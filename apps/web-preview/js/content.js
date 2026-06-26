// Shared content + helpers for the static preview

const BRAND = {
  name: "Groovethiopia",
  tagline: "Curating the New Horizon",
  contactEmail: "hello@groovethiopia.com",
  city: "Addis Ababa",
  social: { instagram: "https://instagram.com/groovethiopia", twitter: "https://twitter.com/groovethiopia", tiktok: "https://tiktok.com/@groovethiopia", telegram: "https://t.me/groovethiopia" }
};

const NAV = [
  { href: "index.html", label: "Home" },
  { href: "about.html", label: "About" },
  { href: "events.html", label: "Events" },
  { href: "collection.html", label: "The Collection" },
  { href: "sanctuary.html", label: "The Sanctuary" },
  { href: "gallery.html", label: "Gallery" },
  { href: "partners.html", label: "Partners" },
];

const EVENTS = [
  { id: 1, slug: "horizon-festival-2026", title: "Horizon Festival 2026", date: "August 23-24, 2026", venue: "Entoto Hills · Addis Ababa", price: 8500, type: "FLAGSHIP", featured: true, image: "assets/event-horizon.jpg" },
  { id: 2, slug: "shukshuta-vol-iii", title: "Shukshuta Vol. III", date: "July 18, 2026", venue: "Skyline Rooftop · Addis Ababa", price: 4500, type: "SHUKSHUTA", featured: true, image: "assets/event-shukshuta.jpg" },
  { id: 3, slug: "open-air-after-hours", title: "Open Air: After Hours", date: "August 9, 2026", venue: "Friendship Park · Addis Ababa", price: 5500, type: "EVENT", featured: false, image: "assets/event-openair.jpg" },
  { id: 4, slug: "shukshuta-speakeasy", title: "Shukshuta Speakeasy", date: "September 6, 2026", venue: "Sarbet · Addis Ababa", price: 3500, type: "SHUKSHUTA", featured: true, image: "assets/event-speakeasy.jpg" },
];

const VEHICLES = [
  { id: 1, title: "1962 Jaguar E-Type Series 1", year: 1962, price: 240000, status: "AVAILABLE", color: "Carmen Red", image: "assets/vehicle-jaguar.jpg" },
  { id: 2, title: "1971 Mercedes-Benz 280SL", year: 1971, price: 195000, status: "AVAILABLE", color: "Silver", image: "assets/vehicle-mercedes.jpg" },
  { id: 3, title: "1989 Porsche 930 Turbo Cabriolet", year: 1989, price: 285000, status: "RESERVED", color: "Black", image: "assets/vehicle-porsche.jpg" },
  { id: 4, title: "1973 Land Rover Series III", year: 1973, price: 78000, status: "AVAILABLE", color: "Bronze Green", image: "assets/vehicle-landrover.jpg" },
  { id: 5, title: "1995 BMW M3 (E36)", year: 1995, price: 95000, status: "AVAILABLE", color: "Alpine White", image: "assets/vehicle-bmw.jpg" },
  { id: 6, title: "1965 Aston Martin DB5", year: 1965, price: 1200000, status: "SOLD", color: "Silver Birch", image: "assets/vehicle-aston.jpg" },
];

const TEAM = [
  { name: "Abel Tadesse", role: "Founder · Creative Director", leadership: true, initial: "A" },
  { name: "Selamawit Bekele", role: "Head of Events", leadership: true, initial: "S" },
  { name: "Dawit Mekonnen", role: "Head of Curation", leadership: true, initial: "D" },
  { name: "Hana Alemu", role: "Hospitality Lead", leadership: true, initial: "H" },
  { name: "Yonas Tesfaye", role: "Sound Architect", leadership: false, initial: "Y" },
  { name: "Marta Lemma", role: "Visual Director", leadership: false, initial: "M" },
  { name: "Kirubel Asfaw", role: "Operations", leadership: false, initial: "K" },
  { name: "Tigist Haile", role: "Brand & Editorial", leadership: false, initial: "T" },
];

const PARTNERS_STRATEGIC = [
  { name: "NIB International Bank", initial: "N", tier: "STRATEGIC" },
  { name: "Hyatt Regency Addis Ababa", initial: "H", tier: "STRATEGIC" },
  { name: "Sheraton Addis", initial: "S", tier: "STRATEGIC" },
  { name: "Ethiopian Airlines", initial: "E", tier: "STRATEGIC" },
  { name: "Marathon Motors", initial: "M", tier: "STRATEGIC" },
];

const PARTNERS_CULTURAL = [
  { name: "Lucy Restaurant", initial: "L", tier: "CULTURAL" },
  { name: "Kana TV", initial: "K", tier: "CULTURAL" },
  { name: "Addis Ababa University", initial: "A", tier: "CULTURAL" },
  { name: "Betr Media", initial: "B", tier: "CULTURAL" },
  { name: "Habesha Brewery", initial: "H", tier: "CULTURAL" },
  { name: "Tomoca Coffee", initial: "T", tier: "CULTURAL" },
  { name: "Silk Road Events", initial: "S", tier: "CULTURAL" },
];

const DIVISIONS = [
  { label: "Events", description: "Flagship festivals, intimate gatherings, and the underground Shukshuta series.", href: "events.html" },
  { label: "Trading", description: "Curated collector vehicles, real estate, and rare objects.", href: "collection.html" },
  { label: "Hospitality", description: "The Sanctuary — a private members club and creative residency.", href: "sanctuary.html" },
  { label: "Media", description: "Editorial, photography, and storytelling that document the scene.", href: "gallery.html" },
];

// Render nav
function renderNav(active) {
  return NAV.map(item => 
    `<li><a href="${item.href}" class="${active === item.href ? 'active' : ''}">${item.label}</a></li>`
  ).join("\n        ");
}

// Render event/vehicle image (real photo or SVG fallback)
function eventImage(src, altText = "") {
  if (src && src.startsWith("assets/")) {
    return `<img src="${src}" alt="${altText}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">`;
  }
  // Fallback SVG placeholder
  const palettes = {
    festival: ["#1a1a1a", "#3d2817", "#d49520"],
    shukshuta: ["#0a0a0a", "#2a1a3a", "#9b4dca"],
    openair: ["#1a1a1a", "#1a3a2a", "#4dca7a"],
    speakeasy: ["#0a0a0a", "#3a1a1a", "#ca4d4d"],
  };
  const colors = palettes[src] || ["#1a1a1a", "#2a2a2a", "#d49520"];
  const [c1, c2, c3] = colors;
  return `<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block">
    <defs>
      <linearGradient id="g-${src}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="50%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c1}"/>
      </linearGradient>
      <radialGradient id="r-${src}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${c3}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${c3}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="320" height="200" fill="url(#g-${src})"/>
    <ellipse cx="160" cy="100" rx="120" ry="80" fill="url(#r-${src})"/>
    <text x="160" y="115" fill="${c3}" font-family="Cormorant Garamond, serif" font-size="48" font-weight="300" text-anchor="middle" opacity="0.5">${(src || '').split('-')[0]}</text>
  </svg>`;
}
