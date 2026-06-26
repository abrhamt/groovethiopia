// SEO helper — injects OpenGraph + Twitter + canonical tags dynamically
function setMeta({ title, description, image, url, type = "website" }) {
  document.title = title;

  function upsert(name, content, attr = "name") {
    let el = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  upsert("description", description);
  upsert("og:title", title, "property");
  upsert("og:description", description, "property");
  upsert("og:type", type, "property");
  upsert("og:url", url, "property");
  upsert("og:image", image, "property");
  upsert("og:site_name", "Groovethiopia", "property");
  upsert("twitter:card", "summary_large_image");
  upsert("twitter:title", title);
  upsert("twitter:description", description);
  upsert("twitter:image", image);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

// Auto-fill from filename if not overridden
if (!window.__seoSet) {
  const path = location.pathname.split("/").pop() || "index.html";
  const slug = path.replace(".html", "").toLowerCase();
  const meta = {
    "index": { title: "Groovethiopia — Curating the New Horizon", description: "A curated ecosystem of flagship events, rare objects, and refined hospitality in Addis Ababa." },
    "about": { title: "About — Groovethiopia", description: "A private members collective and creative house based in Addis Ababa. Founded 2019." },
    "events": { title: "Events — Groovethiopia", description: "Flagship festivals, intimate gatherings, and the underground Shukshuta series." },
    "event-detail": { title: "Event — Groovethiopia", description: "Reserve your invitation to our flagship events in Addis Ababa." },
    "collection": { title: "The Collection — Groovethiopia", description: "Curated collector vehicles and rare pieces with a story." },
    "partners": { title: "Partners — Groovethiopia", description: "Strategic, cultural, and media partners who share our standard." },
    "sanctuary": { title: "The Sanctuary — Groovethiopia", description: "A private members house and creative residency in Addis Ababa. By introduction." },
    "gallery": { title: "Gallery — Groovethiopia", description: "Photography from our events, members, and travels." },
    "contact": { title: "Contact — Groovethiopia", description: "Get in touch. For partnerships, press, and general inquiries." },
  };
  const m = meta[slug] || meta["index"];
  const url = `https://abrhamt.github.io/groovethiopia/${path}`;
  const image = `https://abrhamt.github.io/groovethiopia/assets/og-default.png`;
  setMeta({ ...m, url, image });
}
