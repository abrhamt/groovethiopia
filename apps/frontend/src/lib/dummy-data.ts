// Centralized dummy/fallback data for the public site.
// Used when the backend API is unreachable or returns empty content.
// Images are royalty-free Unsplash placeholders that match the Groovethiopia
// aesthetic (dark, cinematic, editorial).

import type { ContentItem } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Image library
// ─────────────────────────────────────────────────────────────────────────────

export const dummyImages = {
    // Hero / cover backgrounds
    heroMain:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=2400&q=80",
    heroAlt:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=2400&q=80",
    heroAlt2:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=2400&q=80",

    // Ecosystem divisions
    ecosystemEvents:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    ecosystemCollection:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    ecosystemSanctuary:
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1200&q=80",

    // Events
    event1:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=80",
    event2:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&q=80",
    event3:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80",
    event4:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=80",
    event5:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&q=80",

    // Vehicles
    car1: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80",
    car2: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80",
    car3: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1600&q=80",
    car4: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1600&q=80",
    car5: "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?w=1600&q=80",
    car6: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80",

    // Real estate / sanctuary
    project1:
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=1600&q=80",
    project2:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
    project3:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80",
    project4:
        "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=1600&q=80",

    // Gallery / Instagram
    gallery1:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=80",
    gallery2:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80",
    gallery3:
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=900&q=80",
    gallery4:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80",
    gallery5:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900&q=80",
    gallery6:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&q=80",
    gallery7:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=900&q=80",
    gallery8:
        "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=900&q=80",
    gallery9:
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80",
    gallery10:
        "https://images.unsplash.com/photo-1542362567-b07e54358753?w=900&q=80",
    gallery11:
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&q=80",
    gallery12:
        "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?w=900&q=80",

    // Team members (portraits)
    team1:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
    team2:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    team3:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80",
    team4:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80",
};

// Helper to wrap a URL in a ContentItem-shaped image object.
const img = (url: string, alt: string) => ({
    url,
    thumbnailUrl: url,
    altText: alt,
    width: 1600,
    height: 1000,
});

// ─────────────────────────────────────────────────────────────────────────────
// Hero background cover
// ─────────────────────────────────────────────────────────────────────────────

export type DummyHeroCover = {
    url: string;
    alt: string;
    // Optional subtle second image for parallax/dual-layer hero variants.
    secondaryUrl?: string;
};

export const dummyHeroCover: DummyHeroCover = {
    url: dummyImages.heroMain,
    alt: "Cinematic event lighting — Groovethiopia",
    secondaryUrl: dummyImages.heroAlt,
};

// ─────────────────────────────────────────────────────────────────────────────
// Featured event
// ─────────────────────────────────────────────────────────────────────────────

const now = Date.now();
const inDays = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000).toISOString();

export const dummyFeaturedEvent: ContentItem = {
    id: "dummy-event-shukshuta",
    type: "EVENT",
    slug: "shukshuta-speakeasy",
    title: "Shukshuta Speakeasy",
    subtitle: "Our Signature Series",
    excerpt:
        "An intimate underground gathering of sound, atmosphere, and curated community.",
    body:
        "Born from a desire to create spaces where music moves beyond entertainment into ritual, Shukshuta Speakeasy is our flagship series — subterranean evenings that blur the line between concert and conversation. Each edition brings together a handpicked lineup of electronic artists in settings designed for intimacy.",
    locale: "en",
    startsAt: inDays(7),
    endsAt: inDays(7),
    venue: "Addis Ababa · Secret Location",
    venueAddress: "Disclosed 24h before",
    ticketPrice: 3500,
    currency: "ETB",
    image: img(dummyImages.event1, "Shukshuta Speakeasy — underground event"),
};

export const dummyEvents: ContentItem[] = [
    dummyFeaturedEvent,
    {
        id: "dummy-event-horizon",
        type: "EVENT",
        slug: "horizon-festival-2026",
        title: "Horizon Festival 2026",
        subtitle: "Two days. Three stages. One horizon.",
        excerpt:
            "Our flagship outdoor festival returns — bigger, bolder, more immersive.",
        body: "Horizon is our flagship outdoor festival — a multi-day, multi-stage gathering that brings together the best of East African electronic music with international headliners. Set against the backdrop of the Entoto hills at golden hour, Horizon is more than a festival; it's a cultural moment.",
        locale: "en",
        startsAt: inDays(60),
        endsAt: inDays(62),
        venue: "Entoto Hills · Addis Ababa",
        venueAddress: "Entoto Natural Park",
        ticketPrice: 8500,
        currency: "ETB",
        image: img(dummyImages.event3, "Horizon Festival outdoor stage"),
    },
    {
        id: "dummy-event-shukshuta-iii",
        type: "EVENT",
        slug: "shukshuta-volume-iii",
        title: "Shukshuta Vol. III",
        subtitle: "Edition III — Sunrise Set",
        excerpt: "The third installment. An all-night-to-sunrise format.",
        body: "An all-night-to-sunrise format curated for the early hours. International DJs paired with skyline views — a defining morning-after experience.",
        locale: "en",
        startsAt: inDays(21),
        venue: "Addis Ababa · Skyline Rooftop",
        ticketPrice: 4500,
        currency: "ETB",
        image: img(dummyImages.event2, "Shukshuta Vol. III rooftop sunrise"),
    },
    {
        id: "dummy-event-gala",
        type: "EVENT",
        slug: "winter-gala-2026",
        title: "Winter Gala 2026",
        subtitle: "A black-tie affair",
        excerpt: "Our annual gala — a black-tie evening of philanthropy, art, and culinary excellence.",
        body: "Our annual Winter Gala brings together patrons of culture, art, and craft for a single evening of generosity and celebration. Proceeds support emerging Ethiopian artists.",
        locale: "en",
        startsAt: inDays(120),
        venue: "Addis Ababa · Sheraton Grand Ballroom",
        ticketPrice: 12000,
        currency: "ETB",
        image: img(dummyImages.event4, "Winter Gala — black-tie dinner"),
    },
    {
        id: "dummy-event-rooftop",
        type: "EVENT",
        slug: "rooftop-sessions-vol-ii",
        title: "Rooftop Sessions Vol. II",
        subtitle: "Jazz, soul, golden hour",
        excerpt: "An intimate rooftop evening of jazz, soul, and conversation as the sun sets.",
        body: "The Rooftop Sessions return — a curated evening of live jazz, soul, and golden-hour conversation on one of the city's most exclusive rooftops.",
        locale: "en",
        startsAt: inDays(14),
        venue: "Addis Ababa · Skyline Rooftop",
        ticketPrice: 2500,
        currency: "ETB",
        image: img(dummyImages.event5, "Rooftop Sessions — jazz at sunset"),
    },
    {
        id: "dummy-event-warehouse",
        type: "EVENT",
        slug: "warehouse-protocol",
        title: "Warehouse Protocol",
        subtitle: "Industrial · Underground",
        excerpt: "A pure underground warehouse experience — minimal lighting, maximal sound.",
        body: "An uncompromising warehouse experience. Industrial setting, world-class sound, no phones, no pretense.",
        locale: "en",
        startsAt: inDays(35),
        venue: "Addis Ababa · Industrial District",
        ticketPrice: 3000,
        currency: "ETB",
        image: img(dummyImages.event1, "Warehouse Protocol — industrial dance floor"),
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Vehicles (The Collection)
// ─────────────────────────────────────────────────────────────────────────────

export const dummyVehicles: ContentItem[] = [
    {
        id: "dummy-vehicle-bentley",
        type: "VEHICLE",
        slug: "2024-bentley-continental-gt",
        title: "2024 Bentley Continental GT",
        subtitle: "Modern Luxury",
        excerpt:
            "The definitive grand tourer — 6.0L twin-turbo W12, hand-finished cabin.",
        body: "The 2024 Bentley Continental GT defines the modern grand tourer. Beneath the sculpted body sits a 6.0L twin-turbocharged W12 producing 650 horsepower, paired with an 8-speed dual-clutch transmission and adaptive all-wheel drive. The cabin is hand-finished in diamond-knurled metal, sustainably sourced wood veneers, and Nappa leather.",
        locale: "en",
        year: 2024,
        make: "Bentley",
        model: "Continental GT",
        category: "MODERN_LUXURY",
        price: "285000",
        currency: "USD",
        image: img(dummyImages.car1, "2024 Bentley Continental GT — front 3/4"),
    },
    {
        id: "dummy-vehicle-mercedes-250sl",
        type: "VEHICLE",
        slug: "1967-mercedes-benz-250sl",
        title: "1967 Mercedes-Benz 250 SL 'Pagoda'",
        subtitle: "Vintage Classic",
        excerpt:
            "An icon — fully restored, matching numbers, period-correct.",
        body: "A matching-numbers 1967 Mercedes-Benz 250 SL 'Pagoda' — one of the most collectible roadsters of the 20th century. Three-year rotisserie restoration completed in 2022. Original color combination of Strawberry Red over Cream leather. Documented service history from new.",
        locale: "en",
        year: 1967,
        make: "Mercedes-Benz",
        model: "250 SL",
        category: "VINTAGE_CLASSIC",
        price: "195000",
        currency: "USD",
        image: img(dummyImages.car2, "1967 Mercedes-Benz 250 SL Pagoda"),
    },
    {
        id: "dummy-vehicle-rolls-spectre",
        type: "VEHICLE",
        slug: "2024-rolls-royce-spectre",
        title: "2024 Rolls-Royce Spectre",
        subtitle: "Modern Luxury",
        excerpt:
            "The first fully-electric Rolls-Royce. Silent, vast, unmistakable.",
        body: "The first fully-electric Rolls-Royce. The Spectre is built on the brand's proprietary architecture of luxury, delivering an estimated 329 miles of range, 577 horsepower, and the silent cabin experience Rolls-Royce has defined for over a century.",
        locale: "en",
        year: 2024,
        make: "Rolls-Royce",
        model: "Spectre",
        category: "MODERN_LUXURY",
        price: "422000",
        currency: "USD",
        image: img(dummyImages.car3, "2024 Rolls-Royce Spectre"),
    },
    {
        id: "dummy-vehicle-porsche-911",
        type: "VEHICLE",
        slug: "1973-porsche-911-carrera-rs",
        title: "1973 Porsche 911 Carrera RS",
        subtitle: "Vintage Classic",
        excerpt: "Lightweight, air-cooled, homologation legend. Matching numbers, documented.",
        body: "A Lightweight 1973 Porsche 911 Carrera RS — one of approximately 1,580 built. Air-cooled 2.7L flat-six with mechanical fuel injection. Documented from new with books, tools, and original bill of sale. A blue-chip collector piece.",
        locale: "en",
        year: 1973,
        make: "Porsche",
        model: "911 Carrera RS",
        category: "VINTAGE_CLASSIC",
        price: "1200000",
        currency: "USD",
        image: img(dummyImages.car4, "1973 Porsche 911 Carrera RS"),
    },
    {
        id: "dummy-vehicle-lambo-revuelto",
        type: "VEHICLE",
        slug: "2024-lamborghini-revuelto",
        title: "2024 Lamborghini Revuelto",
        subtitle: "Modern Luxury",
        excerpt: "The flagship hybrid V12 supercar — 1,015 hp, naturally aspirated soul.",
        body: "Lamborghini's flagship hybrid V12. 6.5L naturally aspirated V12 paired with three electric motors for a combined 1,015 horsepower. 0-60 in 2.5 seconds. A new chapter for the Raging Bull.",
        locale: "en",
        year: 2024,
        make: "Lamborghini",
        model: "Revuelto",
        category: "MODERN_LUXURY",
        price: "608000",
        currency: "USD",
        image: img(dummyImages.car5, "2024 Lamborghini Revuelto"),
    },
    {
        id: "dummy-vehicle-aston-db12",
        type: "VEHICLE",
        slug: "2024-aston-martin-db12",
        title: "2024 Aston Martin DB12",
        subtitle: "Modern Luxury",
        excerpt: "The world's first super tourer — twin-turbo V8, 671 hp, hand-built in Gaydon.",
        body: "The Aston Martin DB12 is the world's first super tourer. A 4.0L twin-turbo V8 producing 671 horsepower paired with an 8-speed automatic and electronic limited-slip differential. Hand-built in Gaydon, England.",
        locale: "en",
        year: 2024,
        make: "Aston Martin",
        model: "DB12",
        category: "MODERN_LUXURY",
        price: "268000",
        currency: "USD",
        image: img(dummyImages.car6, "2024 Aston Martin DB12"),
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Real estate projects (The Sanctuary)
// ─────────────────────────────────────────────────────────────────────────────

export const dummyProjects: ContentItem[] = [
    {
        id: "dummy-project-wagela",
        type: "REAL_ESTATE_PROJECT",
        slug: "wagela-forest-retreat",
        title: "Wagela Forest Retreat",
        subtitle: "Boutique eco-lodge · 12 keys",
        excerpt:
            "A boutique retreat nestled deep within the Wagela forest — a dialogue between architecture and canopy.",
        body: "Twelve private treehouse suites suspended above the canopy. Designed by Addis-based Studio Biene, the retreat is constructed almost entirely from locally-sourced timber and stone. Phase I opens Q4 2027.",
        locale: "en",
        location: "Wagela Highlands, Oromia",
        projectStage: "DESIGN",
        image: img(dummyImages.project1, "Wagela Forest Retreat render"),
    },
    {
        id: "dummy-project-rift",
        type: "REAL_ESTATE_PROJECT",
        slug: "rift-valley-lakehouse",
        title: "Rift Valley Lakehouse",
        subtitle: "Private estate · 8 keys",
        excerpt:
            "Eight private lakeside residences on the shores of a pristine Rift Valley lake.",
        body: "Eight private lakefront residences with a central clubhouse, infinity pool, and dock. Architectural language by Kengo Kuma Associates. Target opening Q2 2028.",
        locale: "en",
        location: "Rift Valley Lakes Region",
        projectStage: "PLANNING",
        image: img(dummyImages.project2, "Rift Valley Lakehouse aerial"),
    },
    {
        id: "dummy-project-bale",
        type: "REAL_ESTATE_PROJECT",
        slug: "bale-mountain-lodge",
        title: "Bale Mountain Lodge",
        subtitle: "Adventure lodge · 24 keys",
        excerpt:
            "A high-altitude lodge at the gateway to the Bale Mountains — for the wild at heart.",
        body: "A high-altitude adventure lodge of 24 keys, with a dedicated trekking concierge, mountain guide program, and a stone-clad spa. Currently in construction; soft opening Q3 2026.",
        locale: "en",
        location: "Bale Mountains National Park",
        projectStage: "CONSTRUCTION",
        image: img(dummyImages.project3, "Bale Mountain Lodge exterior"),
    },
    {
        id: "dummy-project-simien",
        type: "REAL_ESTATE_PROJECT",
        slug: "simien-cliffside-spa",
        title: "Simien Cliffside Spa",
        subtitle: "Wellness retreat · 6 keys",
        excerpt: "A wellness-focused micro-retreat carved into the Simien escarpment.",
        body: "Six private suites with cliffside hot springs, hammam, and silent meditation terraces. Designed for complete digital detox.",
        locale: "en",
        location: "Simien Mountains, Amhara",
        projectStage: "DESIGN",
        image: img(dummyImages.project4, "Simien Cliffside Spa concept"),
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Partners
// ─────────────────────────────────────────────────────────────────────────────

export type DummyPartner = {
    id?: string;
    name: string;
    logoUrl?: string;
    tier: string;
    description?: string;
    websiteUrl?: string;
    isFeatured?: boolean;
};

export const dummyPartners: DummyPartner[] = [
    {
        id: "dummy-partner-nib",
        name: "NIB International Bank",
        tier: "STRATEGIC",
        description:
            "Ethiopia's leading private bank — our primary financial partner for trade finance and treasury services.",
        websiteUrl: "https://nibbank.com.et",
        isFeatured: true,
    },
    {
        id: "dummy-partner-hyatt",
        name: "Hyatt Regency",
        tier: "STRATEGIC",
        description: "Global hospitality partner across our Sanctuary developments.",
        websiteUrl: "https://hyatt.com",
    },
    {
        id: "dummy-partner-ethiopian",
        name: "Ethiopian Airlines",
        tier: "STRATEGIC",
        description: "Cargo partner for our vehicle import division.",
        websiteUrl: "https://ethiopianairlines.com",
    },
    {
        id: "dummy-partner-marathon",
        name: "Marathon Motors",
        tier: "STRATEGIC",
        description: "Vehicle logistics and customs partner.",
    },
    {
        id: "dummy-partner-sheraton",
        name: "Sheraton Addis",
        tier: "CULTURAL",
        description: "Host venue for our annual Winter Gala.",
        websiteUrl: "https://marriott.com",
    },
    {
        id: "dummy-partner-aau",
        name: "Addis Ababa University",
        tier: "CULTURAL",
        description: "Academic partner for our cultural research programs.",
        websiteUrl: "https://aau.edu.et",
    },
    {
        id: "dummy-partner-kana",
        name: "Kana TV",
        tier: "MEDIA",
        description: "Media partner for our events coverage.",
        websiteUrl: "https://kanatv.com",
    },
    {
        id: "dummy-partner-lucy",
        name: "Lucy Restaurant",
        tier: "CULTURAL",
        description: "Culinary partner for our private dinners.",
        websiteUrl: "https://lucyaddis.com",
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Team members
// ─────────────────────────────────────────────────────────────────────────────

export type DummyTeamMember = {
    id: string;
    name: string;
    role: string;
    bio: string;
    image: { url: string; alt: string };
};

export const dummyTeam: DummyTeamMember[] = [
    {
        id: "team-1",
        name: "Yonas T. Berhe",
        role: "Founder & CEO",
        bio: "Visionary founder with 15+ years in hospitality, real estate, and cultural enterprise across East Africa.",
        image: {
            url: dummyImages.team1,
            alt: "Portrait of Yonas T. Berhe",
        },
    },
    {
        id: "team-2",
        name: "Hanna M. Abebe",
        role: "Chief Creative Officer",
        bio: "Leads brand, design, and curation across the ecosystem. Former lead at a global design studio.",
        image: {
            url: dummyImages.team2,
            alt: "Portrait of Hanna M. Abebe",
        },
    },
    {
        id: "team-3",
        name: "Dawit K. Lemma",
        role: "Head of Hospitality",
        bio: "Twenty-year veteran of luxury hospitality. Oversees The Sanctuary portfolio and partner operations.",
        image: {
            url: dummyImages.team3,
            alt: "Portrait of Dawit K. Lemma",
        },
    },
    {
        id: "team-4",
        name: "Selam A. Tadesse",
        role: "Head of Events",
        bio: "Producer of the Shukshuta and Horizon series. Background in music curation and experiential design.",
        image: {
            url: dummyImages.team4,
            alt: "Portrait of Selam A. Tadesse",
        },
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Gallery / Instagram feed
// ─────────────────────────────────────────────────────────────────────────────

export type DummyGalleryItem = {
    id?: string;
    url: string;
    thumbnailUrl: string;
    alt: string;
    caption?: string;
    permalink?: string;
    division?: "events" | "collection" | "sanctuary";
};

export const dummyGalleryItems: DummyGalleryItem[] = [
    {
        id: "gal-1",
        url: dummyImages.gallery1,
        thumbnailUrl: dummyImages.gallery1,
        alt: "Shukshuta lighting rig",
        caption: "Shukshuta Vol. II — main floor",
        permalink: "https://instagram.com/p/dummy-1",
        division: "events",
    },
    {
        id: "gal-2",
        url: dummyImages.gallery2,
        thumbnailUrl: dummyImages.gallery2,
        alt: "Bentley Continental GT detail",
        caption: "Detail · Continental GT",
        permalink: "https://instagram.com/p/dummy-2",
        division: "collection",
    },
    {
        id: "gal-3",
        url: dummyImages.gallery3,
        thumbnailUrl: dummyImages.gallery3,
        alt: "Wagela Forest Retreat concept",
        caption: "Wagela — early concept",
        permalink: "https://instagram.com/p/dummy-3",
        division: "sanctuary",
    },
    {
        id: "gal-4",
        url: dummyImages.gallery4,
        thumbnailUrl: dummyImages.gallery4,
        alt: "Horizon Festival crowd",
        caption: "Horizon 2025 — sunrise set",
        permalink: "https://instagram.com/p/dummy-4",
        division: "events",
    },
    {
        id: "gal-5",
        url: dummyImages.gallery5,
        thumbnailUrl: dummyImages.gallery5,
        alt: "Festival installation",
        caption: "Installation · Horizon",
        permalink: "https://instagram.com/p/dummy-5",
        division: "events",
    },
    {
        id: "gal-6",
        url: dummyImages.gallery6,
        thumbnailUrl: dummyImages.gallery6,
        alt: "Bale Mountain Lodge terrace",
        caption: "Bale Mountain Lodge — terrace",
        permalink: "https://instagram.com/p/dummy-6",
        division: "sanctuary",
    },
    {
        id: "gal-7",
        url: dummyImages.gallery7,
        thumbnailUrl: dummyImages.gallery7,
        alt: "Rooftop Sessions — golden hour",
        caption: "Rooftop Sessions — golden hour",
        permalink: "https://instagram.com/p/dummy-7",
        division: "events",
    },
    {
        id: "gal-8",
        url: dummyImages.gallery8,
        thumbnailUrl: dummyImages.gallery8,
        alt: "Simien Cliffside Spa",
        caption: "Simien — concept",
        permalink: "https://instagram.com/p/dummy-8",
        division: "sanctuary",
    },
    {
        id: "gal-9",
        url: dummyImages.gallery9,
        thumbnailUrl: dummyImages.gallery9,
        alt: "Mercedes-Benz 250 SL detail",
        caption: "250 SL — chrome work",
        permalink: "https://instagram.com/p/dummy-9",
        division: "collection",
    },
    {
        id: "gal-10",
        url: dummyImages.gallery10,
        thumbnailUrl: dummyImages.gallery10,
        alt: "Porsche 911 Carrera RS",
        caption: "Carrera RS — air-cooled",
        permalink: "https://instagram.com/p/dummy-10",
        division: "collection",
    },
    {
        id: "gal-11",
        url: dummyImages.gallery11,
        thumbnailUrl: dummyImages.gallery11,
        alt: "Rolls-Royce Spectre",
        caption: "Spectre — silence",
        permalink: "https://instagram.com/p/dummy-11",
        division: "collection",
    },
    {
        id: "gal-12",
        url: dummyImages.gallery12,
        thumbnailUrl: dummyImages.gallery12,
        alt: "Lamborghini Revuelto",
        caption: "Revuelto — V12",
        permalink: "https://instagram.com/p/dummy-12",
        division: "collection",
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Merging helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the API items if any are present, otherwise returns the dummy
 * fallback. Used to keep the site visually populated even when the backend
 * has not yet been seeded or is offline.
 */
export function withFallback<T>(apiItems: T[], fallback: T[]): T[] {
    return apiItems && apiItems.length > 0 ? apiItems : fallback;
}

/**
 * Look up a single item by slug from a list of dummy content items.
 * Used by detail pages ([slug]) when the backend API is unreachable.
 */
export function findDummyBySlug<T extends { slug: string }>(
    items: T[],
    slug: string
): T | undefined {
    return items.find((i) => i.slug === slug);
}