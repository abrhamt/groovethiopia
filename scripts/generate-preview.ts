import { PrismaClient, ContentType, PartnerTier } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const PREVIEW_DIR = path.join(__dirname, "../apps/web-preview");

// Clean and recreate directories
function setupDirectories() {
  const locales = ["en", "am", "fr"];
  const subdirs = ["events", "collection", "sanctuary", "tickets"];

  locales.forEach((locale) => {
    const localeDir = path.join(PREVIEW_DIR, locale);
    if (fs.existsSync(localeDir)) {
      fs.rmSync(localeDir, { recursive: true, force: true });
    }
    fs.mkdirSync(localeDir, { recursive: true });

    subdirs.forEach((sub) => {
      fs.mkdirSync(path.join(localeDir, sub), { recursive: true });
    });
  });
}

// Helper to format date
function formatDate(date: Date, locale: string): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  return new Intl.DateTimeFormat(locale === "am" ? "am-ET" : locale === "fr" ? "fr-FR" : "en-US", options).format(date);
}

// Shared Navigation structure
const NAV_LINKS: Record<string, Array<{ href: string; label: string }>> = {
  en: [
    { href: "index.html", label: "Home" },
    { href: "about.html", label: "About" },
    { href: "events.html", label: "Events" },
    { href: "collection.html", label: "The Collection" },
    { href: "sanctuary.html", label: "The Sanctuary" },
    { href: "gallery.html", label: "Gallery" },
    { href: "partners.html", label: "Partners" },
  ],
  am: [
    { href: "index.html", label: "መነሻ" },
    { href: "about.html", label: "ስለ እኛ" },
    { href: "events.html", label: "ዝግጅቶች" },
    { href: "collection.html", label: "ስብስብ" },
    { href: "partners.html", label: "አጋሮች" },
  ],
  fr: [
    { href: "index.html", label: "Accueil" },
    { href: "about.html", label: "À Propos" },
    { href: "events.html", label: "Événements" },
    { href: "collection.html", label: "La Collection" },
    { href: "partners.html", label: "Partenaires" },
  ],
};

const LANG_LABELS: Record<string, string> = {
  en: "EN",
  am: "አማ",
  fr: "FR",
};

// Render Shared Layout Header
function renderHeader(locale: string, title: string, activePage: string, isNested = false): string {
  const depthPrefix = isNested ? "../../" : "../";
  const navItems = NAV_LINKS[locale] || NAV_LINKS.en;

  const renderedLinks = navItems
    .map((item) => {
      const href = item.href;
      const activeClass = activePage === href ? 'class="active"' : "";
      return `<li><a href="${depthPrefix}${locale}/${href}" ${activeClass}>${item.label}</a></li>`;
    })
    .join("\n      ");

  // Language switcher options
  const langSwitches = Object.keys(LANG_LABELS)
    .map((l) => {
      const activeClass = l === locale ? 'class="active"' : "";
      const path = isNested ? `../../${l}/${activePage}` : `../${l}/${activePage}`;
      return `<a href="${path}" ${activeClass}>${LANG_LABELS[l]}</a>`;
    })
    .join("\n      ");

  const contactLink = isNested ? `../../${locale}/contact.html` : `../${locale}/contact.html`;
  const logoLink = isNested ? `../../${locale}/index.html` : `../${locale}/index.html`;

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Groovethiopia</title>
<link rel="stylesheet" href="${depthPrefix}css/style.css">
<link rel="icon" type="image/svg+xml" href="${depthPrefix}favicon.svg">
<meta name="theme-color" content="#0a0a0a">
<style>
.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  z-index: 0;
}
.hero-slide.active {
  opacity: 1;
  z-index: 1;
  animation: kenburns-static 6.5s ease-out forwards;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(10,10,10,0.4) 50%, var(--black) 100%), rgba(0, 0, 0, 0.4);
  z-index: 2;
  pointer-events: none;
}
@keyframes kenburns-static {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}
.am-serif { font-family: 'Cormorant Garamond', 'Nyala', 'Abyssinica SIL', serif; }
body { font-family: 'Söhne', 'Nyala', 'Abyssinica SIL', -apple-system, sans-serif; }
</style>
</head>
<body>

<nav class="nav">
  <div class="container nav-inner">
    <a href="${logoLink}" class="logo">Groove<span class="thin">thiopia</span></a>
    <ul class="nav-links">
      ${renderedLinks}
    </ul>
    <div class="flex items-center">
      ${langSwitches}
      <a href="${contactLink}" class="nav-cta">${locale === "am" ? "አግኙን" : "Contact"}</a>
    </div>
  </div>
</nav>
`;
}

// Render Shared Layout Footer
function renderFooter(locale: string): string {
  const copyright =
    locale === "am"
      ? "© 2026 Groovethiopia Trading PLC. መብቱ የተጠበቀ ነው።"
      : "© 2026 Groovethiopia Trading PLC. All rights reserved.";
  const city = locale === "am" ? "አዲስ አበባ · ኢትዮጵያ" : "Addis Ababa · Ethiopia";

  return `
<footer class="footer">
  <div class="container">
    <div class="footer-meta">
      <div>${copyright}</div>
      <div>${city}</div>
    </div>
  </div>
</footer>
</body>
</html>
`;
}

// Main generation function
async function generate() {
  console.log("🧹 Setting up directories...");
  setupDirectories();

  // Fetch all contents from DB
  const contents = await prisma.content.findMany({
    include: { media: true },
  });

  const partners = await prisma.partner.findMany({
    orderBy: { name: "asc" },
  });

  const team = await prisma.teamMember.findMany({
    orderBy: { displayOrder: "asc" },
  });

  const locales = ["en", "am", "fr"];

  // Write root index redirect file
  fs.writeFileSync(
    path.join(PREVIEW_DIR, "index.html"),
    `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=en/index.html">
  <script>window.location.replace("en/index.html")</script>
</head>
<body>
  Redirecting to English version...
</body>
</html>`
  );

  for (const locale of locales) {
    const localeContents = contents.filter((c) => c.locale === locale);

    // ─────────────────────────────────────────────────────────────────────────
    // HOMEPAGE
    // ─────────────────────────────────────────────────────────────────────────
    const events = localeContents.filter((c) => c.type === ContentType.EVENT || c.type === ContentType.SHUKSHUTA_EVENT);
    const homepageHeroList = events.map((ev) => ev.media[0]?.publicUrl || "assets/hero-home.jpg");

    // Fallbacks if empty
    if (homepageHeroList.length === 0) {
      homepageHeroList.push("assets/hero-home.jpg", "assets/event-horizon.jpg", "assets/event-shukshuta.jpg");
    }

    const homeHtml = `
      ${renderHeader(locale, "Curating the New Horizon", "index.html")}
      <section class="hero" id="heroSlideshow" style="position: relative; min-height: 90vh; display: flex; align-items: center; overflow: hidden;">
        <div class="container hero-content fade-in" style="position: relative; z-index: 10;">
          <span class="label-mono hero-eyebrow">${locale === "am" ? "የተመሰረተው 2019 · አዲስ አበባ" : "EST. 2019 · ADDIS ABABA"}</span>
          <h1 class="${locale === "am" ? "am-serif" : ""}">
            ${locale === "am" ? "አዲሱን<br><em style='font-style: italic; color: var(--gold-300);'>ማዕቀን</em><br>መምረጥ" : locale === "fr" ? "Façonner le<br><em>Nouvel Horizon</em>" : "Curating the<br><em class=\"text-gradient-gold\">New Horizon</em>"}
          </h1>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div style="display: flex; flex-direction: row; gap: 64px; position: relative; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 280px; max-width: 320px;">
              <div style="position: sticky; top: 140px; min-height: 75vh; padding-top: 16px;">
                <span class="label-mono">${locale === "am" ? "ዝግጅቶች" : "THE PULSE"}</span>
                <h2 class="editorial-heading text-gradient-gold" style="font-size: clamp(36px, 5vw, 64px); line-height: 1.05; margin-top: 16px; margin-bottom: 24px;">
                  ${locale === "am" ? "አንድ ትዕይንት፣<br><em style='color: var(--white); font-style: italic;'>አራት ተሞክሮዎች።</em>" : "One scene,<br><em style=\"color: var(--white); font-style: italic;\">four experiences.</em>"}
                </h2>
              </div>
            </div>
            <div style="flex: 2; min-width: 320px; display: flex; flex-direction: column; gap: 64px; padding-bottom: 128px;">
              ${events
                .slice(0, 4)
                .map(
                  (e, index) => `
                <div style="position: sticky; top: calc(140px + ${index} * 32px); z-index: ${index + 10}; width: 100%;">
                  <div style="display: flex; flex-direction: column; overflow: hidden; border-radius: 24px; border: 1px solid var(--ink-800); background: var(--ink-900); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                    <div style="position: relative; aspect-ratio: 16/10; width: 100%; overflow: hidden; background: var(--black);">
                      <img src="${e.media[0]?.publicUrl || 'assets/event-horizon.jpg'}" alt="${e.title}" style="width:100%;height:100%;object-fit:cover;display:block;">
                      <div style="position: absolute; inset: 0; background: linear-gradient(to top, var(--black) 0%, rgba(10,10,10,0.4) 60%, transparent 100%);"></div>
                      <div style="position: absolute; bottom: 24px; left: 24px; right: 24px;">
                        <h3 class="editorial-heading" style="font-size: 32px; color: var(--white); margin: 0 0 4px 0;">${e.title}</h3>
                      </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--ink-800); background: var(--black);">
                      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; border-right: 1px solid var(--ink-800); text-align: center;">
                        <span class="label-mono" style="color: var(--ink-400); margin-bottom: 4px;">When</span>
                        <span style="font-size: 16px; color: var(--ink-100);">${e.startsAt ? formatDate(e.startsAt, locale) : "—"}</span>
                      </div>
                      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center;">
                        <span class="label-mono" style="color: var(--ink-400); margin-bottom: 4px;">Where</span>
                        <span style="font-size: 16px; color: var(--ink-100);">${e.venue || "—"}</span>
                      </div>
                    </div>
                    <a href="events/${e.slug}.html" class="btn-primary" style="display: block; border-radius: 0; padding: 18px 0; text-align: center; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.1em; text-decoration: none; border-top: 1px solid var(--ink-800); background: var(--ink-900); color: var(--gold-400);">
                      ${locale === "am" ? "የበለጠ መረጃ" : "Request Invitation"}
                    </a>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </section>

      ${renderFooter(locale)}

      <script>
        const slidesData = ${JSON.stringify(homepageHeroList)};
        const heroSection = document.getElementById('heroSlideshow');
        if (heroSection) {
          const overlay = document.createElement('div');
          overlay.className = 'hero-overlay';
          heroSection.appendChild(overlay);

          const slideElements = slidesData.map((src, i) => {
            const slide = document.createElement('div');
            slide.className = \`hero-slide\${i === 0 ? ' active' : ''}\`;
            slide.style.backgroundImage = \`url('\${src}')\`;
            heroSection.insertBefore(slide, heroSection.firstChild);
            return slide;
          });

          let currentSlide = 0;
          setInterval(() => {
            slideElements[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slideElements.length;
            slideElements[currentSlide].classList.add('active');
          }, 6000);
        }
      </script>
    `;
    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/index.html`), homeHtml.trim());

    // ─────────────────────────────────────────────────────────────────────────
    // ABOUT PAGE
    // ─────────────────────────────────────────────────────────────────────────
    const aboutHtml = `
      ${renderHeader(locale, "About Us", "about.html")}
      <section class="section" style="padding-top: 120px;">
        <div class="container">
          <span class="label-mono">${locale === "am" ? "ስለ እኛ" : "ABOUT US"}</span>
          <h1 class="editorial-heading text-gradient-gold" style="font-size: 56px; margin-top: 16px; margin-bottom: 24px;">Our Manifesto</h1>
          <p style="font-size: 24px; line-height: 1.6; color: white; font-family: 'Cormorant Garamond', serif; font-style: italic; max-w: 800px; margin-bottom: 64px;">
            ${locale === "am" ? "እኛ የምናዘጋጀው ባህላዊ ድንቅ ስራዎችን ነው — የኢትዮጵያ ድንቅ ባህል ከዘመናዊ አርት እና ዲዛይን ጋር የሚቀናጅበት።" : "We do not host events; we engineer cultural milestones. Bringing together high art, custom design, and modern electronics."}
          </p>

          <h2 class="editorial-heading" style="font-size: 32px; color: white; margin-bottom: 32px;">The Roster</h2>
          <div class="grid grid-4">
            ${team
              .map(
                (t) => `
              <div class="card" style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--ink-800); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; color: var(--gold-400);">
                  ${t.name.charAt(0)}
                </div>
                <div>
                  <h3 style="color: white; font-size: 18px; margin-bottom: 4px;">${t.name}</h3>
                  <span class="label-mono" style="font-size: 10px; color: var(--ink-400);">${t.role}</span>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
      ${renderFooter(locale)}
    `;
    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/about.html`), aboutHtml.trim());

    // ─────────────────────────────────────────────────────────────────────────
    // EVENTS INDEX & DETAIL PAGES
    // ─────────────────────────────────────────────────────────────────────────
    const eventsHtml = `
      ${renderHeader(locale, "Events", "events.html")}
      <section class="section" style="padding-top: 120px;">
        <div class="container">
          <span class="label-mono">${locale === "am" ? "የባህል ፕሮግራሞች" : "EVENTS & CULTURE"}</span>
          <h1 class="editorial-heading text-gradient-gold" style="font-size: 56px; margin-top: 16px; margin-bottom: 40px;">The Pulse</h1>
          <div class="grid grid-2">
            ${events
              .map(
                (ev) => `
              <div class="card" style="display: flex; flex-direction: column; overflow: hidden;">
                <div style="aspect-ratio: 16/9; background: var(--black); overflow: hidden;">
                  <img src="${ev.media[0]?.publicUrl || 'assets/event-horizon.jpg'}" alt="${ev.title}" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
                <div style="padding: 24px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <span class="label-mono" style="color: var(--gold-400); font-size: 11px;">${ev.startsAt ? formatDate(ev.startsAt, locale) : ""}</span>
                    <h3 class="editorial-heading" style="font-size: 28px; color: white; margin-top: 8px; margin-bottom: 12px;">${ev.title}</h3>
                    <p style="color: var(--ink-400); font-size: 14px;">${ev.excerpt || ""}</p>
                  </div>
                  <a href="events/${ev.slug}.html" class="btn-primary" style="margin-top: 24px; text-align: center; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-size: 11px; text-decoration: none; padding: 12px 0; border-radius: 99px;">
                    ${locale === "am" ? "የበለጠ ይመልከቱ" : "View Invitation"}
                  </a>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
      ${renderFooter(locale)}
    `;
    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/events.html`), eventsHtml.trim());

    // Generate individual event details
    events.forEach((ev) => {
      const detailHtml = `
        ${renderHeader(locale, ev.title, "events.html", true)}
        <section class="section" style="padding-top: 120px;">
          <div class="container">
            <div style="margin-bottom: 32px;">
              <a href="../events.html" style="color: var(--ink-300); text-decoration: none; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">← BACK TO EVENTS</a>
            </div>
            <div class="grid grid-2" style="grid-template-columns: 1fr 1fr; align-items: start; gap: 48px;">
              <div>
                <div style="aspect-ratio: 4/3; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 32px; background: var(--ink-950);">
                  <img src="../../${ev.media[0]?.publicUrl || 'assets/event-horizon.jpg'}" alt="${ev.title}" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
                <span class="label-mono" style="color: var(--gold-400);">${ev.startsAt ? formatDate(ev.startsAt, locale) : ""}</span>
                <h1 class="editorial-heading mt-4" style="font-size: 56px; color: white; line-height: 1.1; margin-top: 8px;">${ev.title}</h1>
                <p style="color: var(--ink-300); font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 20px; margin: 16px 0 24px;">${ev.subtitle || ""}</p>
                <div style="color: var(--ink-200); font-size: 16px; line-height: 1.7;">${ev.body || ""}</div>
              </div>
              <div style="position: sticky; top: 120px;">
                <div class="card" style="background: linear-gradient(135deg, var(--ink-800) 0%, var(--ink-700) 100%); border-color: var(--gold-700); padding: 32px;">
                  <span class="label-mono" style="color: var(--gold-400);">RESERVE</span>
                  <p style="font-family: 'Cormorant Garamond', serif; font-size: 56px; color: var(--gold-300); margin: 16px 0 8px; line-height: 1;">$${ev.ticketPrice?.toLocaleString() || "8,500"}</p>
                  <p style="color: var(--ink-300); font-size: 14px; margin-bottom: 24px;">Per ticket · Capacity 2,000</p>
                  <a href="../tickets/checkout.html?slug=${ev.slug}" class="btn-primary" style="width: 100%; text-align: center; display: block; box-sizing: border-box; text-decoration: none; border-radius: 99px; padding: 14px 0; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-size: 11px;">Request Invitation</a>
                  <a href="../contact.html" class="btn-secondary mt-4" style="width: 100%; text-align: center; display: block; box-sizing: border-box; text-decoration: none; border-radius: 99px; padding: 14px 0; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-size: 11px;">More inquiries</a>
                  <div class="divider" style="margin: 24px 0; height: 1px; background: var(--ink-800);"></div>
                  <p style="color: var(--ink-400); font-size: 12px; line-height: 1.6;">Limited inventory. Member rate available. By application.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        ${renderFooter(locale)}
      `;
      fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/events/${ev.slug}.html`), detailHtml.trim());
    });

    // ─────────────────────────────────────────────────────────────────────────
    // COLLECTION INDEX & DETAIL PAGES
    // ─────────────────────────────────────────────────────────────────────────
    const vehicles = localeContents.filter((c) => c.type === ContentType.VEHICLE);
    const collectionHtml = `
      ${renderHeader(locale, "The Collection", "collection.html")}
      <section class="section" style="padding-top: 120px;">
        <div class="container">
          <span class="label-mono">${locale === "am" ? "የስብስብ ዕቃዎች" : "COLLECTIBLES"}</span>
          <h1 class="editorial-heading text-gradient-gold" style="font-size: 56px; margin-top: 16px; margin-bottom: 40px;">Heritage & Luxury</h1>
          <div class="grid grid-3">
            ${vehicles
              .map(
                (v) => `
              <div class="card" style="display: flex; flex-direction: column; overflow: hidden;">
                <div style="aspect-ratio: 4/3; background: var(--ink-950); overflow: hidden;">
                  <img src="${v.media[0]?.publicUrl || 'assets/vehicle-jaguar.jpg'}" alt="${v.title}" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
                <div style="padding: 24px;">
                  <span class="label-mono" style="color: var(--ink-400); font-size: 10px;">${v.year} · ${v.make || ""}</span>
                  <h3 class="editorial-heading" style="font-size: 24px; color: white; margin-top: 8px; margin-bottom: 16px;">${v.title}</h3>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--gold-300); font-family: 'JetBrains Mono', monospace; font-size: 18px;">$${Number(v.ticketPrice || 0).toLocaleString()}</span>
                    <a href="collection/${v.slug}.html" style="color: var(--gold-400); text-decoration: none; font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase;">Inquire →</a>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
      ${renderFooter(locale)}
    `;
    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/collection.html`), collectionHtml.trim());

    // Generate individual vehicle details
    vehicles.forEach((v) => {
      const detailHtml = `
        ${renderHeader(locale, v.title, "collection.html", true)}
        <section class="section" style="padding-top: 120px;">
          <div class="container">
            <div style="margin-bottom: 32px;">
              <a href="../collection.html" style="color: var(--ink-300); text-decoration: none; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">← BACK TO COLLECTION</a>
            </div>
            <div class="grid grid-2" style="grid-template-columns: 1.2fr 0.8fr; align-items: start; gap: 48px;">
              <div>
                <div style="aspect-ratio: 16/10; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 32px; background: var(--ink-950);">
                  <img src="../../${v.media[0]?.publicUrl || 'assets/vehicle-jaguar.jpg'}" alt="${v.title}" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
                <span class="label-mono" style="color: var(--gold-400);">${v.year} · ${v.make || ""}</span>
                <h1 class="editorial-heading" style="font-size: 48px; color: white; margin-top: 8px;">${v.title}</h1>
                <div style="color: var(--ink-200); font-size: 16px; line-height: 1.7; margin-top: 24px;">${v.body || ""}</div>
              </div>
              <div>
                <div class="card" style="padding: 32px; background: var(--ink-900);">
                  <span class="label-mono" style="color: var(--gold-400);">INQUIRE</span>
                  <p style="font-family: 'Cormorant Garamond', serif; font-size: 48px; color: var(--gold-300); margin: 16px 0 8px; line-height: 1;">$${Number(v.ticketPrice || 0).toLocaleString()}</p>
                  <a href="../contact.html?inquiry=${v.slug}" class="btn-primary" style="width: 100%; text-align: center; display: block; box-sizing: border-box; text-decoration: none; border-radius: 99px; padding: 14px 0; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-size: 11px; margin-top: 20px;">Request Acquisition Details</a>
                </div>
              </div>
            </div>
          </div>
        </section>
        ${renderFooter(locale)}
      `;
      fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/collection/${v.slug}.html`), detailHtml.trim());
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SANCTUARY INDEX & DETAIL PAGES
    // ─────────────────────────────────────────────────────────────────────────
    const sanctuaries = localeContents.filter((c) => c.type === ContentType.REAL_ESTATE);
    const sanctuaryHtml = `
      ${renderHeader(locale, "The Sanctuary", "sanctuary.html")}
      <section class="section" style="padding-top: 120px;">
        <div class="container">
          <span class="label-mono">${locale === "am" ? "የእንግዳ ቤት" : "SANCTUARIES"}</span>
          <h1 class="editorial-heading text-gradient-gold" style="font-size: 56px; margin-top: 16px; margin-bottom: 40px;">The Sanctuary</h1>
          <div class="grid grid-2">
            ${sanctuaries
              .map(
                (s) => `
              <div class="card" style="display: flex; flex-direction: column; overflow: hidden;">
                <div style="aspect-ratio: 16/10; background: var(--ink-950); overflow: hidden;">
                  <img src="${s.media[0]?.publicUrl || 'assets/hero-sanctuary.jpg'}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
                <div style="padding: 24px;">
                  <span class="label-mono" style="color: var(--gold-400); font-size: 10px;">${s.location || "Addis Ababa"}</span>
                  <h3 class="editorial-heading" style="font-size: 28px; color: white; margin-top: 8px; margin-bottom: 16px;">${s.title}</h3>
                  <p style="color: var(--ink-400); font-size: 14px; margin-bottom: 24px;">${s.excerpt || ""}</p>
                  <a href="sanctuary/${s.slug}.html" class="btn-primary" style="display: block; text-align: center; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-size: 11px; text-decoration: none; padding: 12px 0; border-radius: 99px;">
                    View Space
                  </a>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
      ${renderFooter(locale)}
    `;
    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/sanctuary.html`), sanctuaryHtml.trim());

    // Generate individual sanctuary details
    sanctuaries.forEach((s) => {
      const detailHtml = `
        ${renderHeader(locale, s.title, "sanctuary.html", true)}
        <section class="section" style="padding-top: 120px;">
          <div class="container">
            <div style="margin-bottom: 32px;">
              <a href="../sanctuary.html" style="color: var(--ink-300); text-decoration: none; font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;">← BACK TO SANCTUARIES</a>
            </div>
            <div class="grid grid-2" style="grid-template-columns: 1.2fr 0.8fr; align-items: start; gap: 48px;">
              <div>
                <div style="aspect-ratio: 16/10; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 32px; background: var(--ink-950);">
                  <img src="../../${s.media[0]?.publicUrl || 'assets/hero-sanctuary.jpg'}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
                <span class="label-mono" style="color: var(--gold-400);">${s.location || ""}</span>
                <h1 class="editorial-heading" style="font-size: 48px; color: white; margin-top: 8px;">${s.title}</h1>
                <div style="color: var(--ink-200); font-size: 16px; line-height: 1.7; margin-top: 24px;">${s.body || ""}</div>
              </div>
              <div>
                <div class="card" style="padding: 32px; background: var(--ink-900);">
                  <span class="label-mono" style="color: var(--gold-400);">MEMBERSHIP & BOOKINGS</span>
                  <p style="color: var(--ink-300); font-size: 14px; margin-top: 12px; line-height: 1.6;">Our properties are accessible to verified members only. Contact creative residency administration for entry options.</p>
                  <a href="../contact.html?space=${s.slug}" class="btn-primary" style="width: 100%; text-align: center; display: block; box-sizing: border-box; text-decoration: none; border-radius: 99px; padding: 14px 0; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-size: 11px; margin-top: 20px;">Request Application</a>
                </div>
              </div>
            </div>
          </div>
        </section>
        ${renderFooter(locale)}
      `;
      fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/sanctuary/${s.slug}.html`), detailHtml.trim());
    });

    // ─────────────────────────────────────────────────────────────────────────
    // PARTNERS PAGE
    // ─────────────────────────────────────────────────────────────────────────
    const partnersHtml = `
      ${renderHeader(locale, "Partners", "partners.html")}
      <section class="section" style="padding-top: 120px;">
        <div class="container">
          <span class="label-mono">${locale === "am" ? "አጋሮች" : "PARTNERS"}</span>
          <h1 class="editorial-heading text-gradient-gold" style="font-size: 56px; margin-top: 16px; margin-bottom: 40px;">Strategic Alliance</h1>
          
          <h2 class="editorial-heading" style="font-size: 32px; color: white; margin-bottom: 24px;">Strategic</h2>
          <div class="grid grid-3" style="margin-bottom: 64px;">
            ${partners
              .filter((p) => p.tier === PartnerTier.STRATEGIC)
              .map(
                (p) => `
              <div class="card" style="padding: 32px; display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center;">
                <div style="font-size: 48px; color: var(--gold-400); font-family: 'Cormorant Garamond', serif; font-weight: bold;">${p.name.charAt(0)}</div>
                <h3 style="color: white; font-size: 18px;">${p.name}</h3>
                ${p.website ? `<a href="${p.website}" target="_blank" style="color: var(--gold-300); text-decoration: none; font-size: 12px; font-family: 'JetBrains Mono', monospace;">Visit website</a>` : ""}
              </div>
            `
              )
              .join("")}
          </div>

          <h2 class="editorial-heading" style="font-size: 32px; color: white; margin-bottom: 24px;">Cultural & Media</h2>
          <div class="grid grid-4">
            ${partners
              .filter((p) => p.tier === PartnerTier.CULTURAL)
              .map(
                (p) => `
              <div class="card" style="padding: 24px; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center;">
                <div style="font-size: 36px; color: var(--gold-300); font-family: 'Cormorant Garamond', serif;">${p.name.charAt(0)}</div>
                <h4 style="color: white; font-size: 16px;">${p.name}</h4>
                ${p.website ? `<a href="${p.website}" target="_blank" style="color: var(--gold-300); text-decoration: none; font-size: 11px; font-family: 'JetBrains Mono', monospace;">Visit website</a>` : ""}
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
      ${renderFooter(locale)}
    `;
    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/partners.html`), partnersHtml.trim());

    // ─────────────────────────────────────────────────────────────────────────
    // GALLERY PAGE
    // ─────────────────────────────────────────────────────────────────────────
    const galleryHtml = `
      ${renderHeader(locale, "Gallery", "gallery.html")}
      <section class="section" style="padding-top: 120px;">
        <div class="container">
          <span class="label-mono">${locale === "am" ? "ምስሎች" : "MEDIA & STORIES"}</span>
          <h1 class="editorial-heading text-gradient-gold" style="font-size: 56px; margin-top: 16px; margin-bottom: 40px;">Gallery</h1>
          <div class="grid grid-3" style="gap: 16px;">
            ${events
              .map(
                (ev) => `
              <div style="aspect-ratio: 1; border-radius: var(--radius-lg); overflow: hidden; position: relative; background: var(--ink-950);">
                <img src="${ev.media[0]?.publicUrl || 'assets/event-horizon.jpg'}" alt="${ev.title}" style="width:100%;height:100%;object-fit:cover;display:block;">
                <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-end; padding: 20px;">
                  <span class="label-mono" style="color: white; font-size: 10px;">${ev.title}</span>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
      ${renderFooter(locale)}
    `;
    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/gallery.html`), galleryHtml.trim());

    // ─────────────────────────────────────────────────────────────────────────
    // CONTACT PAGE
    // ─────────────────────────────────────────────────────────────────────────
    const contactHtml = `
      ${renderHeader(locale, "Contact Us", "contact.html")}
      <section class="section" style="padding-top: 120px;">
        <div class="container" style="max-w: 600px; margin: 0 auto;">
          <span class="label-mono">${locale === "am" ? "አግኙን" : "CONTACT"}</span>
          <h1 class="editorial-heading text-gradient-gold" style="font-size: 56px; margin-top: 16px; margin-bottom: 24px;">Get in Touch</h1>
          <p style="color: var(--ink-300); font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 20px; margin-bottom: 40px;">
            For partnerships, invitations, and acquisition inquiries.
          </p>

          <form class="card" style="padding: 32px; display: flex; flex-direction: column; gap: 20px;" onsubmit="event.preventDefault(); alert('Message sent successfully!'); this.reset();">
            <div class="form-group" style="margin: 0;">
              <label>Full Name</label>
              <input type="text" class="input-field" placeholder="E.g. Abel Tesfaye" required>
            </div>
            <div class="form-group" style="margin: 0;">
              <label>Email Address</label>
              <input type="email" class="input-field" placeholder="name@example.com" required>
            </div>
            <div class="form-group" style="margin: 0;">
              <label>Inquiry Type</label>
              <select class="input-field" style="background: var(--ink-950); cursor: pointer;">
                <option>General Inquiry</option>
                <option>Event Booking</option>
                <option>Asset Acquisition</option>
                <option>Partnerships</option>
              </select>
            </div>
            <div class="form-group" style="margin: 0;">
              <label>Message</label>
              <textarea class="input-field" rows="5" placeholder="Tell us about your inquiry..." required style="resize: none;"></textarea>
            </div>
            <button type="submit" class="btn-primary" style="border: none; cursor: pointer; padding: 14px 0; border-radius: 99px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;">Send Message</button>
          </form>
        </div>
      </section>
      ${renderFooter(locale)}
    `;
    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/contact.html`), contactHtml.trim());

    // ─────────────────────────────────────────────────────────────────────────
    // TICKETS CHECKOUT & SUCCESS PAGES
    // ─────────────────────────────────────────────────────────────────────────
    const checkoutTemplate = fs.readFileSync(path.join(PREVIEW_DIR, "checkout.html"), "utf-8");
    const successTemplate = fs.readFileSync(path.join(PREVIEW_DIR, "success.html"), "utf-8");

    // Replace relative paths in checkout template for nested folder
    const localizedCheckout = checkoutTemplate
      .replace(/href="css\/style\.css"/g, 'href="../../css/style.css"')
      .replace(/href="favicon\.svg"/g, 'href="../../favicon.svg"')
      .replace(/href="index\.html"/g, 'href="../../en/index.html"')
      .replace(/href="contact\.html"/g, 'href="../../en/contact.html"')
      .replace(/src="js\/content\.js"/g, 'src="../../js/content.js"')
      .replace(/url\('assets\//g, "url('../../assets/")
      .replace(/href="event-detail\.html\?slug="/g, 'href="../events/"')
      .replace(/window\.location\.href = url;/g, "window.location.href = url.replace('success.html', 'success.html');");

    const localizedSuccess = successTemplate
      .replace(/href="css\/style\.css"/g, 'href="../../css/style.css"')
      .replace(/href="favicon\.svg"/g, 'href="../../favicon.svg"')
      .replace(/href="index\.html"/g, 'href="../../en/index.html"')
      .replace(/href="contact\.html"/g, 'href="../../en/contact.html"')
      .replace(/src="js\/content\.js"/g, 'src="../../js/content.js"')
      .replace(/url\('assets\//g, "url('../../assets/");

    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/tickets/checkout.html`), localizedCheckout);
    fs.writeFileSync(path.join(PREVIEW_DIR, `${locale}/tickets/success.html`), localizedSuccess);
  }

  // Clean old root flat files to enforce clean structure
  const flatFilesToDelete = [
    "about.html",
    "collection.html",
    "contact.html",
    "event-detail.html",
    "events.html",
    "gallery.html",
    "partners.html",
    "sanctuary.html",
    "index.am.html",
    "index.fr.html",
    "checkout.html",
    "success.html",
  ];

  flatFilesToDelete.forEach((file) => {
    const filePath = path.join(PREVIEW_DIR, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  console.log("🎉 Rebuilt apps/web-preview directory structure successfully!");
}

generate()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Build failed:", err);
    prisma.$disconnect();
    process.exit(1);
  });
