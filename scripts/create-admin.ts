// CLI script to create the first admin user
// Usage: DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm tsx scripts/create-admin.ts

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ Password must be at least 8 characters");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    console.log(`⏭️  User already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash,
      approvedAt: new Date(),
    },
  });

  console.log(`✅ Created admin user: ${user.email}`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Role: ${user.role}`);
  console.log(`\n🔐 You can now log in at https://admin.groovethiopia.com/login`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });