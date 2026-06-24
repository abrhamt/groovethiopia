// Database seed — creates initial admin user and sample data
// Run with: pnpm db:seed

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create initial admin user
  const adminEmail = process.env.ADMIN_EMAIL || "admin@groovethiopia.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Admin",
        role: "ADMIN",
        status: "ACTIVE",
        approvedAt: new Date(),
      },
    });
    console.log(`✅ Created admin user: ${adminEmail}`);
    console.log(`   Password: ${adminPassword} (change immediately!)`);
  } else {
    console.log(`⏭️  Admin user already exists: ${adminEmail}`);
  }

  // 2. Seed glossary with brand-specific terms
  const glossary = [
    {
      term: "Curating the New Horizon",
      translations: {
        en: "Curating the New Horizon",
        am: "አዲሱን ሰማያዊ መስመር መቅረጽ",
        fr: "Organiser le Nouvel Horizon",
        es: "Curando el Nuevo Horizonte",
      },
      context: "Brand tagline",
    },
    {
      term: "Shukshuta",
      translations: {
        en: "Shukshuta",
        am: "ሹክሹታ",
        fr: "Shukshuta",
        es: "Shukshuta",
      },
      context: "Speakeasy series name (do not translate)",
    },
    {
      term: "Groovethiopia",
      translations: {
        en: "Groovethiopia",
        am: "ግሩቭኢትዮጵያ",
        fr: "Groovethiopia",
        es: "Groovethiopia",
      },
      context: "Brand name (do not translate)",
    },
    {
      term: "The Pulse",
      translations: {
        en: "The Pulse",
        am: "ልብ ምት",
        fr: "Le Pouls",
        es: "El Pulso",
      },
      context: "Events division name",
    },
    {
      term: "The Collection",
      translations: {
        en: "The Collection",
        am: "ስብስቡ",
        fr: "La Collection",
        es: "La Colección",
      },
      context: "Trading division name",
    },
    {
      term: "The Sanctuary",
      translations: {
        en: "The Sanctuary",
        am: "መቅደሱ",
        fr: "Le Sanctuaire",
        es: "El Santuario",
      },
      context: "Real Estate division name",
    },
  ];

  for (const entry of glossary) {
    await prisma.glossaryTerm.upsert({
      where: { term: entry.term },
      update: { translations: entry.translations, context: entry.context },
      create: entry,
    });
  }
  console.log(`✅ Seeded ${glossary.length} glossary terms`);

  // 3. Seed default settings
  const settings = [
    { key: "site.tagline", value: "Curating the New Horizon" },
    { key: "site.contactEmail", value: "hello@groovethiopia.com" },
    { key: "site.contactPhone", value: "+251 11 XXX XXXX" },
    { key: "site.address", value: "Addis Ababa, Ethiopia" },
    {
      key: "social.platforms",
      value: ["instagram", "telegram", "tiktok", "x"],
    },
    {
      key: "languages.enabled",
      value: ["en", "am", "fr", "es"],
    },
    { key: "languages.default", value: "en" },
    {
      key: "languages.names",
      value: { en: "English", am: "አማርኛ", fr: "Français", es: "Español" },
    },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✅ Seeded ${settings.length} default settings`);

  // 4. Seed sample partners (placeholders)
  const partners = [
    {
      name: "NIB International Bank",
      tier: "STRATEGIC",
      description: "Banking partner",
      displayOrder: 1,
    },
    {
      name: "Hyatt Regency Addis Ababa",
      tier: "STRATEGIC",
      description: "Hospitality partner",
      displayOrder: 2,
    },
    {
      name: "Sheraton Addis",
      tier: "CULTURAL",
      description: "Cultural events partner",
      displayOrder: 3,
    },
  ];

  for (const p of partners) {
    const existing = await prisma.partner.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.partner.create({ data: p });
    }
  }
  console.log(`✅ Seeded ${partners.length} sample partners`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });