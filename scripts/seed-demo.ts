// Seed rich demo content so the public site looks complete from day one.
// Run after the main seed: pnpm tsx scripts/seed-demo.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Cinematic placeholder images (royalty-free Unsplash)
const images = {
  event1: "https://images.unsplash.com/photo-1571266028243-d220bc56b8f3?w=1600&q=80",
  event2: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80",
  event3: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80",
  event4: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=80",
  car1: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80",
  car2: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80",
  car3: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1600&q=80",
  car4: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1600&q=80",
  car5: "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?w=1600&q=80",
  car6: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80",
  project1: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1600&q=80",
  project2: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
  project3: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80",
  hero: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=2400&q=80",
  shukshuta: "https://images.unsplash.com/photo-1571266028243-d220bc56b8f3?w=1600&q=80",
};

async function main() {
  console.log("🌱 Seeding demo content...");

  // Need an author — create or find admin
  let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    const passwordHash = await bcrypt.hash("AdminPassword123!", 12);
    admin = await prisma.user.create({
      data: {
        email: "admin@groovethiopia.com",
        name: "Admin",
        role: "ADMIN",
        status: "ACTIVE",
        passwordHash,
        approvedAt: new Date(),
      },
    });
    console.log(`✅ Created demo admin: ${admin.email} / AdminPassword123!`);
  }

  // ===== EVENTS =====
  const events = [
    {
      slug: "shukshuta-speakeasy",
      type: "EVENT",
      title: "Shukshuta Speakeasy",
      subtitle: "Our Signature Series",
      excerpt: "An intimate underground gathering of sound, atmosphere, and curated community.",
      body: "Born from a desire to create spaces where music moves beyond entertainment into ritual, Shukshuta Speakeasy is our flagship series — subterranean evenings that blur the line between concert and conversation. Each edition brings together a handpicked lineup of electronic artists in settings designed for intimacy, with sound architecture and lighting that respond to the room. Limited capacity. RSVP required.",
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      venue: "Addis Ababa · Secret Location",
      venueAddress: "Disclosed 24h before",
      capacity: 200,
      ticketPrice: 3500,
      image: images.event1,
      featured: true,
    },
    {
      slug: "horizon-festival-2026",
      type: "EVENT",
      title: "Horizon Festival 2026",
      subtitle: "Two days. Three stages. One horizon.",
      excerpt: "Our flagship outdoor festival returns — bigger, bolder, more immersive.",
      body: "Horizon Festival is where the scene gathers. Two days across three stages, featuring both international headliners and Ethiopia's most exciting emerging artists. More than music: installations, food curated by top local chefs, and spaces designed for the unexpected.",
      startsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 62 * 24 * 60 * 60 * 1000),
      venue: "Entoto Hills · Addis Ababa",
      venueAddress: "Entoto Natural Park",
      capacity: 5000,
      ticketPrice: 8500,
      image: images.event3,
      featured: true,
    },
    {
      slug: "shukshuta-volume-iii",
      type: "SHUKSHUTA_EVENT",
      title: "Shukshuta Vol. III",
      subtitle: "Edition III — Sunrise Set",
      excerpt: "The third installment. An all-night-to-sunrise format.",
      body: "Volume III takes the Shukshuta format to its longest iteration yet — from midnight through sunrise. Curated specifically for the night owls and early risers, with a lineup built for the journey, not just the peak.",
      startsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      venue: "Addis Ababa · Skyline Rooftop",
      capacity: 180,
      ticketPrice: 4500,
      image: images.event2,
      featured: false,
    },
    {
      slug: "open-air-after-hours",
      type: "EVENT",
      title: "Open Air: After Hours",
      subtitle: "An immersive night under the stars",
      excerpt: "An outdoor production combining electronic music, visual art, and Ethiopian landscape.",
      body: "After Hours is our open-air concept — combining state-of-the-art sound, immersive lighting, and visual installations against an Ethiopian landscape backdrop.",
      startsAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      venue: "Bishoftu · Lake Bishoftu",
      capacity: 1500,
      ticketPrice: 5500,
      image: images.event4,
      featured: false,
    },
  ];

  for (const e of events) {
    const { image, featured, ...data } = e;
    const created = await prisma.content.upsert({
      where: { slug_locale: { slug: data.slug, locale: "en" } },
      update: { ...data, metadata: { featured } },
      create: {
        ...data,
        locale: "en",
        status: "PUBLISHED",
        authorId: admin.id,
        publishedAt: new Date(),
        metadata: { featured },
      },
    });

    if (image) {
      await prisma.media.upsert({
        where: { r2Key: `seed/${created.id}.webp` },
        update: {},
        create: {
          filename: `${data.slug}.jpg`,
          mimeType: "image/jpeg",
          type: "IMAGE",
          size: 100000,
          r2Key: `seed/${created.id}.webp`,
          publicUrl: image,
          thumbnailUrl: image,
          altText: data.title,
          contentId: created.id,
        },
      });
    }
  }
  console.log(`✅ Seeded ${events.length} events`);

  // ===== VEHICLES =====
  const vehicles = [
    {
      slug: "2024-bentley-continental-gt",
      type: "VEHICLE",
      title: "2024 Bentley Continental GT",
      subtitle: "Modern Luxury",
      excerpt: "The definitive grand tourer — 6.0L twin-turbo W12, hand-finished cabin.",
      body: "A masterclass in contemporary craftsmanship. The 2024 Continental GT combines a 6.0-liter twin-turbocharged W12 producing 650 horsepower with a cabin trimmed in diamond-knurled aluminum and the finest Bridge of Weir leather. Bespoke Mulliner customization available.",
      year: 2024,
      make: "Bentley",
      model: "Continental GT",
      category: "MODERN_LUXURY",
      price: 285000,
      currency: "USD",
      image: images.car1,
      featured: true,
    },
    {
      slug: "1967-mercedes-benz-250sl",
      type: "VEHICLE",
      title: "1967 Mercedes-Benz 250 SL 'Pagoda'",
      subtitle: "Vintage Classic",
      excerpt: "An icon — fully restored, matching numbers, period-correct.",
      body: "The 'Pagoda' remains one of the most sought-after classics of the post-war era. This 1967 example has undergone a comprehensive two-year restoration by marque specialists, finished in its original Strawberry Red with cognac leather. Hardtop and soft top both included. Documented service history from new.",
      year: 1967,
      make: "Mercedes-Benz",
      model: "250 SL",
      category: "VINTAGE_CLASSIC",
      price: 195000,
      currency: "USD",
      image: images.car2,
      featured: true,
    },
    {
      slug: "2024-rolls-royce-spectre",
      type: "VEHICLE",
      title: "2024 Rolls-Royce Spectre",
      subtitle: "Modern Luxury",
      excerpt: "The first fully-electric Rolls-Royce. Silent, vast, unmistakable.",
      body: "Spectre represents a new chapter — 585 horsepower of whisper-quiet electric performance, draped in a coupe silhouette that draws from automotive history while pointing toward the future. Starlight Doors with 4,796 illuminated stars. Bespoke commission, delivered to your specification.",
      year: 2024,
      make: "Rolls-Royce",
      model: "Spectre",
      category: "MODERN_LUXURY",
      price: 422000,
      currency: "USD",
      image: images.car3,
      featured: false,
    },
    {
      slug: "1972-ferrari-365-gtb4-daytona",
      type: "VEHICLE",
      title: "1972 Ferrari 365 GTB/4 'Daytona'",
      subtitle: "Vintage Classic",
      excerpt: "The Berlinetta that defined an era. Concours-condition example.",
      body: "Often called the last of the great front-engine Ferraris. This 1972 Daytona has been the subject of a documented rotisserie restoration by a leading Ferrari Classiche specialist. Matching numbers, original tools and books, Rosso Chiaro over Crema.",
      year: 1972,
      make: "Ferrari",
      model: "365 GTB/4",
      category: "VINTAGE_CLASSIC",
      price: 850000,
      currency: "USD",
      image: images.car4,
      featured: true,
    },
    {
      slug: "2025-lamborghini-revuelto",
      type: "VEHICLE",
      title: "2025 Lamborghini Revuelto",
      subtitle: "Modern Luxury",
      excerpt: "V12 hybrid. 1,015 horsepower. The future of the bull.",
      body: "Lamborghini's flagship hybrid supercar. A naturally aspirated 6.5L V12 paired with three electric motors producing a combined 1,015 horsepower. The successor to the Aventador — and arguably the most extreme production Lamborghini ever built.",
      year: 2025,
      make: "Lamborghini",
      model: "Revuelto",
      category: "MODERN_LUXURY",
      price: 600000,
      currency: "USD",
      image: images.car5,
      featured: false,
    },
    {
      slug: "1965-aston-martin-db5",
      type: "VEHICLE",
      title: "1965 Aston Martin DB5",
      subtitle: "Vintage Classic",
      excerpt: "The most famous GT in the world. Silver Birch over Black.",
      body: "Perhaps the most iconic grand tourer ever produced, made world-famous by a certain secret agent. This 1965 example retains its original matching-numbers 4.0L inline-six and is presented in its most evocative specification: Silver Birch over Black Connolly leather.",
      year: 1965,
      make: "Aston Martin",
      model: "DB5",
      category: "VINTAGE_CLASSIC",
      price: 1200000,
      currency: "USD",
      image: images.car6,
      featured: true,
    },
  ];

  for (const v of vehicles) {
    const { image, featured, ...data } = v;
    const created = await prisma.content.upsert({
      where: { slug_locale: { slug: data.slug, locale: "en" } },
      update: { ...data, metadata: { featured } },
      create: {
        ...data,
        locale: "en",
        status: "PUBLISHED",
        authorId: admin.id,
        publishedAt: new Date(),
        metadata: { featured },
      },
    });

    if (image) {
      await prisma.media.upsert({
        where: { r2Key: `seed/${created.id}.webp` },
        update: {},
        create: {
          filename: `${data.slug}.jpg`,
          mimeType: "image/jpeg",
          type: "IMAGE",
          size: 100000,
          r2Key: `seed/${created.id}.webp`,
          publicUrl: image,
          thumbnailUrl: image,
          altText: data.title,
          contentId: created.id,
        },
      });
    }
  }
  console.log(`✅ Seeded ${vehicles.length} vehicles`);

  // ===== REAL ESTATE PROJECTS =====
  const projects = [
    {
      slug: "wagela-forest-retreat",
      type: "REAL_ESTATE_PROJECT",
      title: "Wagela Forest Retreat",
      subtitle: "Boutique eco-lodge · 12 keys",
      excerpt: "A boutique retreat nestled deep within the Wagela forest — a dialogue between architecture and canopy.",
      body: "Wagela Forest Retreat is our flagship boutique hotel concept: a 12-key property nestled within highland forest, designed in collaboration with international architects. The buildings appear to grow from the landscape — timber, stone, and glass folded into the canopy. Sustainability is non-negotiable: off-grid power, rainwater harvesting, locally-sourced food philosophy.",
      location: "Wagela Highlands, Oromia",
      projectStage: "DESIGN",
      image: images.project1,
      featured: true,
    },
    {
      slug: "rift-valley-lakehouse",
      type: "REAL_ESTATE_PROJECT",
      title: "Rift Valley Lakehouse",
      subtitle: "Private estate · 8 keys",
      excerpt: "Eight private lakeside residences on the shores of a pristine Rift Valley lake.",
      body: "Eight freehold estates, each set on its own peninsula of untouched Rift Valley lakeshore. Designed for those who value absolute privacy without sacrificing the conveniences of a managed destination. Concierge, dining, and amenities operated by Groovethiopia Hospitality.",
      location: "Rift Valley Lakes Region",
      projectStage: "PLANNING",
      image: images.project2,
      featured: true,
    },
    {
      slug: "bale-mountain-lodge",
      type: "REAL_ESTATE_PROJECT",
      title: "Bale Mountain Lodge",
      subtitle: "Adventure lodge · 24 keys",
      excerpt: "A high-altitude lodge at the gateway to the Bale Mountains — for the wild at heart.",
      body: "Set at 3,400m elevation, Bale Mountain Lodge is positioned for those drawn to one of Africa's most biodiverse mountain ecosystems. The lodge is a base for trekking, wildlife viewing (mountain nyala, Ethiopian wolf), and serious stargazing — wrapped in the same warm-luxury design language across all Sanctuary properties.",
      location: "Bale Mountains National Park",
      projectStage: "CONSTRUCTION",
      image: images.project3,
      featured: true,
    },
  ];

  for (const p of projects) {
    const { image, featured, ...data } = p;
    const created = await prisma.content.upsert({
      where: { slug_locale: { slug: data.slug, locale: "en" } },
      update: { ...data, metadata: { featured } },
      create: {
        ...data,
        locale: "en",
        status: "PUBLISHED",
        authorId: admin.id,
        publishedAt: new Date(),
        metadata: { featured },
      },
    });

    if (image) {
      await prisma.media.upsert({
        where: { r2Key: `seed/${created.id}.webp` },
        update: {},
        create: {
          filename: `${data.slug}.jpg`,
          mimeType: "image/jpeg",
          type: "IMAGE",
          size: 100000,
          r2Key: `seed/${created.id}.webp`,
          publicUrl: image,
          thumbnailUrl: image,
          altText: data.title,
          contentId: created.id,
        },
      });
    }
  }
  console.log(`✅ Seeded ${projects.length} real estate projects`);

  // ===== PARTNERS =====
  const partners = [
    { name: "NIB International Bank", tier: "STRATEGIC", description: "Banking partner since 2019", websiteUrl: "https://nibbank.com.et", displayOrder: 1, isFeatured: true },
    { name: "Hyatt Regency Addis Ababa", tier: "STRATEGIC", description: "Hospitality & venue partner", websiteUrl: "https://hyatt.com", displayOrder: 2 },
    { name: "Sheraton Addis", tier: "STRATEGIC", description: "Luxury hospitality partner", websiteUrl: "https://sheratonaddis.com", displayOrder: 3 },
    { name: "Ethiopian Airlines", tier: "STRATEGIC", description: "Travel & logistics partner", websiteUrl: "https://ethiopianairlines.com", displayOrder: 4 },
    { name: "Marathon Motors", tier: "STRATEGIC", description: "Automotive partner", websiteUrl: "https://marathonmotors.et", displayOrder: 5 },
    { name: "Lucy Restaurant", tier: "CULTURAL", description: "Hospitality partner", websiteUrl: "https://lucyaddis.com", displayOrder: 6 },
    { name: "Kana TV", tier: "MEDIA", description: "Media partner", websiteUrl: "https://kanatv.com", displayOrder: 7 },
    { name: "Addis Ababa University", tier: "CULTURAL", description: "Cultural & academic partner", websiteUrl: "https://aau.edu.et", displayOrder: 8 },
    { name: "Betr Media", tier: "MEDIA", description: "Digital media partner", displayOrder: 9 },
    { name: "Habesha Brewery", tier: "CULTURAL", description: "Beverage partner", displayOrder: 10 },
    { name: "Tomoca Coffee", tier: "CULTURAL", description: "Coffee partner", websiteUrl: "https://tomocacoffee.com", displayOrder: 11 },
    { name: "Silk Road Events", tier: "CULTURAL", description: "Cultural events network", displayOrder: 12 },
  ];

  for (const p of partners) {
    const existing = await prisma.partner.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.partner.update({ where: { id: existing.id }, data: p });
    } else {
      await prisma.partner.create({ data: p });
    }
  }
  console.log(`✅ Seeded ${partners.length} partners`);

  // ===== TEAM MEMBERS =====
  const teamMembers = [
    { slug: "abel-tadesse", name: "Abel Tadesse", role: "Founder & CEO", bio: "Building Groovethiopia from the conviction that Ethiopia deserves world-class curation across culture, craft, and capital.", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", email: "abel@groovethiopia.com", linkedinUrl: "https://linkedin.com/in/abaltadesse", displayOrder: 1, isLeadership: true },
    { slug: "selamawit-bekele", name: "Selamawit Bekele", role: "Head of Events · The Pulse", bio: "Two decades producing electronic music events across East Africa. Believes in sound as architecture.", photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80", email: "selam@groovethiopia.com", displayOrder: 2, isLeadership: true },
    { slug: "dawit-mekonnen", name: "Dawit Mekonnen", role: "Head of Trading · The Collection", bio: "Specialist in vintage automotive procurement. Former European auction house consultant.", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80", email: "dawit@groovethiopia.com", displayOrder: 3, isLeadership: true },
    { slug: "hana-bekele", name: "Hana Bekele", role: "Head of Real Estate · The Sanctuary", bio: "Architect and developer. Focused on sustainable-luxury hospitality destinations.", photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80", email: "hana@groovethiopia.com", displayOrder: 4, isLeadership: true },
    { slug: "yonas-tefera", name: "Yonas Tefera", role: "Creative Director", bio: "Brand and visual identity. Makes everything look like it belongs in a magazine.", photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80", displayOrder: 5 },
    { slug: "meron-assefa", name: "Meron Assefa", role: "Operations Manager", bio: "Keeps the trains running on time, across time zones.", photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80", displayOrder: 6 },
    { slug: "binyam-hailu", name: "Binyam Hailu", role: "Sound Architect", bio: "Designs sound systems for our venues. Studied acoustics in Berlin.", photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80", displayOrder: 7 },
    { slug: "lensa-kebede", name: "Lensa Kebede", role: "Hospitality Lead", bio: "Front-of-house across all our events and properties.", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80", displayOrder: 8 },
  ];

  for (const m of teamMembers) {
    await prisma.teamMember.upsert({
      where: { slug: m.slug },
      update: m,
      create: m,
    });
  }
  console.log(`✅ Seeded ${teamMembers.length} team members`);

  // ===== PAGE SECTIONS =====
  const pages = [
    {
      slug: "homepage-manifesto",
      title: "Homepage Manifesto (English)",
      subtitle: "Our philosophy",
      excerpt: "We curate the modern African lifestyle. We bridge the heritage of our land with the innovation of the future. Every detail is chosen with intention. Every experience is designed to last.",
      body: "We curate the modern African lifestyle. We bridge the heritage of our land with the innovation of the future. Every detail is chosen with intention. Every experience is designed to last.",
    },
    {
      slug: "about-manifesto",
      title: "About Manifesto (English)",
      subtitle: "Manifesto",
      excerpt: "We curate the modern African lifestyle. We bridge the heritage of our land with the innovation of the future. At Groovethiopia, we view real estate as the canvas for human connection, events as the architecture of culture, and trade as the procurement of excellence. We are not generalists — we are specialists in high-concept living.",
      body: "We curate the modern African lifestyle. We bridge the heritage of our land with the innovation of the future. At Groovethiopia, we view real estate as the canvas for human connection, events as the architecture of culture, and trade as the procurement of excellence. We are not generalists — we are specialists in high-concept living.",
    },
  ];

  for (const p of pages) {
    await prisma.content.upsert({
      where: { slug_locale: { slug: p.slug, locale: "en" } },
      update: { title: p.title, subtitle: p.subtitle, excerpt: p.excerpt, body: p.body, status: "PUBLISHED", publishedAt: new Date() },
      create: {
        ...p,
        type: "PAGE",
        locale: "en",
        status: "PUBLISHED",
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });
  }
  console.log(`✅ Seeded ${pages.length} page sections`);

  console.log("\n🎉 Demo seed complete!");
  console.log("\nNext steps:");
  console.log("  • Visit /admin/login to log in");
  console.log("  • Browse the public site at /");
  console.log("  • Edit any of this content via the admin panel");
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });