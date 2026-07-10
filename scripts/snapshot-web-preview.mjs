// Snapshot the running localhost:3000 site into apps/web-preview so the
// GitHub Pages preview is an EXACT match of the live frontend.
//
// Approach: for every (locale × route) pair we
//   1. fetch the rendered HTML
//   2. find every asset URL the page references (CSS/JS/images/favicons)
//   3. download each unique asset into apps/web-preview/_next/
//   4. rewrite the URLs in the saved HTML to point at the local copies
//   5. rewrite internal navigation `<a href="/<locale>/…">` to relative
//      file paths so the static snapshot navigates correctly
//   6. write apps/web-preview/<locale>/<page>.html (or <dir>/index.html)
//
// Locales and static routes are inferred from the App-Router filesystem.

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const PREVIEW_DIR = path.join(ROOT, "apps/web-preview");
const ASSETS_DIR = path.join(PREVIEW_DIR, "_next");
const APP_DIR = path.join(ROOT, "apps/frontend/src/app/[locale]");
const BACKEND = process.env.SNAPSHOT_BACKEND || "http://localhost:3002";
const FRONTEND = process.env.SNAPSHOT_FRONTEND || "http://localhost:3000";

const STATIC_ROUTES = [
  { path: "/", file: "index.html" },
  { path: "/about", file: "about.html" },
  { path: "/divisions", file: "divisions.html" },
  { path: "/events", file: "events.html" },
  { path: "/gallery", file: "gallery.html" },
  { path: "/partners", file: "partners.html" },
  { path: "/collection", file: "collection.html" },
  { path: "/sanctuary", file: "sanctuary.html" },
  { path: "/contact", file: "contact.html" },
  { path: "/search", file: "search.html" },
];

// Routes that intentionally need query parameters and are not part of the
// static preview (they render transactional UI).
const SKIP_ROUTES = new Set([
  "/tickets/checkout",
  "/tickets/success",
]);

async function ensureCleanDir(dir) {
  await fsp.rm(dir, { recursive: true, force: true });
  await fsp.mkdir(dir, { recursive: true });
}

async function fetchDynamicSlugs() {
  // Pull the lists we need from the backend public API.
  async function slugs(type) {
    const url = `${BACKEND}/api/public/content?type=${encodeURIComponent(type)}&locale=en&limit=200`;
    try {
      const r = await fetch(url);
      if (!r.ok) return [];
      const j = await r.json();
      return (j.items || []).map((x) => x.slug).filter(Boolean);
    } catch {
      return [];
    }
  }

  const events = await slugs("EVENT");
  const shukshuta = await slugs("SHUKSHUTA_EVENT");
  const collection = await slugs("VEHICLE");
  const sanctuary = await slugs("PROJECT");

  return { events, shukshuta, collection, sanctuary };
}

async function fetchHtml(url) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 snapshot-bot",
      "Accept-Language": "en",
    },
  });
  if (!r.ok) {
    throw new Error(`HTTP ${r.status} for ${url}`);
  }
  return await r.text();
}

async function downloadAsset(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`asset ${r.status}: ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const u = new URL(url);
  let pathname = u.pathname;
  let ext = path.extname(pathname);
  if (!ext) {
    const ct = r.headers.get("content-type") || "";
    ext = ct.includes("svg")
      ? ".svg"
      : ct.includes("png")
        ? ".png"
        : ct.includes("jpeg") || ct.includes("jpg")
          ? ".jpg"
          : ct.includes("webp")
            ? ".webp"
            : ct.includes("woff") || ct.includes("font")
              ? ".woff2"
              : ".bin";
    pathname = pathname + ext;
  }
  // All assets land under apps/web-preview/_next/<orig-path>. We rewrite
  // every page reference to ../_next/<orig-path>.
  let rel = pathname.replace(/^\//, "");
  if (rel.startsWith("_next/")) rel = rel.slice("_next/".length);
  else rel = "root/" + rel;
  const out = path.join(ASSETS_DIR, rel);
  await fsp.mkdir(path.dirname(out), { recursive: true });
  await fsp.writeFile(out, buf);
  return rel;
}

function assetLocalPath(originalPath) {
  const u = new URL(originalPath, FRONTEND);
  let rel = u.pathname.replace(/^\//, "");
  if (rel.startsWith("_next/")) return rel;
  return "root/" + rel;
}

function rewriteAssetUrls(html, depth) {
  // _next/* references  → ../_next/<path>
  html = html.replace(/(href|src|srcSet)=("|'|\&quot;)\/?_next\/([^"'\s]+)\2/g, (m, attr, q, p) => {
    const local = assetLocalPath("/_next/" + p);
    return `${attr}=${q}${toRelative(depth, "_next/" + local)}${q}`;
  });

  // root-level assets → ../_next/root/<path>
  html = html.replace(/(href|src|srcSet)=("|'|\&quot;)\/(favicon\.ico|icon\.png|logo\.png)([^"'\s]*)\2/g, (m, attr, q, name, rest) => {
    return `${attr}=${q}${toRelative(depth, "_next/root/" + name)}${q}`;
  });

  return html;
}

// `depth` is the number of folder segments between the preview root and the
// page being rewritten (e.g. `en/events/foo.html` → 2).
function toRelative(depth, asset) {
  const up = depth === 0 ? "" : "../".repeat(depth);
  return up + asset;
}

function rewriteInternalLinks(html, locale, currentDepth) {
  // <a href="/en/..."> -> ../en/.../index.html or en/...html depending.
  const re = /href=("|'|\&quot;)\/([a-z]{2})\/([^"'\s#?]*)([#?][^"'\s]*)?\1/g;
  return html.replace(re, (m, q, loc, rest, tail = "") => {
    if (loc !== locale) return m; // leave cross-locale links; we'd need a resolver
    const clean = rest.replace(/\/$/, "") || "index";
    const file = clean.endsWith(".html") || clean.includes(".")
      ? clean
      : clean + ".html";
    return `href=${q}${toRelative(currentDepth, `${loc}/${file}`)}${q}`;
  });
}

function rewriteNavHelpers(html, locale, currentDepth) {
  // Sometimes the page navigates via Next.js router. Replace any <Link href=
  // next-router style with relative paths too.
  // (Best-effort; the rendered HTML mostly contains raw <a href>.)
  return html;
}

const downloadedAssetPaths = new Set();

async function crawlOne(locale, route, fileRel) {
  const url = `${FRONTEND}/${locale}${route}`;
  console.log(`  ${locale}${route}  ->  ${locale}/${fileRel}`);
  let html;
  try {
    html = await fetchHtml(url);
  } catch (e) {
    console.warn(`    SKIP: ${e.message}`);
    return;
  }

  // Extract every asset URL the page references and download it once.
  const seen = new Set();
  const collect = (raw) => {
    if (!raw) return;
    try {
      const abs = new URL(raw, FRONTEND);
      if (abs.origin === FRONTEND || abs.origin === BACKEND) {
        seen.add(abs.toString());
      }
    } catch {}
  };

  const attrRe = /(?:href|src|srcSet)\s*=\s*("|'|\&quot;)([^"'\s]+(?:\s+[^"'\s]+)*?)\1/g;
  let m;
  while ((m = attrRe.exec(html))) {
    const v = m[2];
    for (const piece of v.split(/\s+/)) {
      if (!piece) continue;
      // srcSet entries are "url widthDescriptor" – take just the URL portion
      const urlOnly = piece.match(/^(https?:|\/)[^,\s]+/);
      if (urlOnly) collect(urlOnly[0]);
      else collect(piece);
    }
  }

  for (const assetUrl of seen) {
    if (downloadedAssetPaths.has(assetUrl)) continue;
    try {
      await downloadAsset(assetUrl);
      downloadedAssetPaths.add(assetUrl);
    } catch (e) {
      // Silently ignore missing assets — they're often data: or unnecessary
      // optional chunks.
    }
  }

  // Also download common root-level statics referenced from layout.
  for (const root of ["/favicon.ico", "/icon.png", "/logo.png"]) {
    const u = new URL(root, FRONTEND).toString();
    if (!downloadedAssetPaths.has(u)) {
      try {
        await downloadAsset(u);
        downloadedAssetPaths.add(u);
      } catch {}
    }
  }

  // Compute the on-disk destination path.
  const destRel = path.join(locale, fileRel);
  const destAbs = path.join(PREVIEW_DIR, destRel);
  await fsp.mkdir(path.dirname(destAbs), { recursive: true });

  // Compute the depth (number of folder segments) for relative paths.
  // e.g. en/events/horizon-festival-2026.html → depth 2
  const depth = path.dirname(destRel).split(path.sep).length;

  let out = html;
  out = rewriteAssetUrls(out, depth);
  out = rewriteInternalLinks(out, locale, depth);
  out = rewriteNavHelpers(out, locale, depth);

  await fsp.writeFile(destAbs, out, "utf8");
}

async function main() {
  console.log("→ reset preview locale folders");
  // Keep top-level hand-crafted files (index.html, 404.html, lang.html,
  // sitemap.xml, robots.txt, css/, js/, assets/) untouched; nuke only the
  // locale subtrees and _next/.
  for (const loc of ["en", "am", "fr", "es"]) {
    await ensureCleanDir(path.join(PREVIEW_DIR, loc));
  }
  await ensureCleanDir(ASSETS_DIR);

  console.log("→ fetch dynamic slug lists");
  const { events, shukshuta, collection, sanctuary } = await fetchDynamicSlugs();

  const locales = ["en", "am", "fr", "es"];

  for (const locale of locales) {
    console.log(`\n— ${locale.toUpperCase()} —`);
    for (const r of STATIC_ROUTES) {
      await crawlOne(locale, r.path, r.file);
    }

    for (const slug of [...events, ...shukshuta]) {
      await crawlOne(
        locale,
        `/events/${slug}`,
        path.join("events", `${slug}.html`)
      );
    }
    for (const slug of collection) {
      await crawlOne(
        locale,
        `/collection/${slug}`,
        path.join("collection", `${slug}.html`)
      );
    }
    for (const slug of sanctuary) {
      await crawlOne(
        locale,
        `/sanctuary/${slug}`,
        path.join("sanctuary", `${slug}.html`)
      );
    }
  }
  console.log("\n✔ snapshot complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
