// Seed sample analytics data spread over the past 30 days
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding analytics sample data...");

  // Get events to spread ticket sales
  const events = await prisma.content.findMany({
    where: { type: { in: ["EVENT", "SHUKSHUTA_EVENT"] }, status: "PUBLISHED" },
    take: 4,
  });
  console.log(`Found ${events.length} events`);

  if (events.length === 0) return;

  // Get or create some public users
  const users = [];
  for (let i = 0; i < 5; i++) {
    const u = await prisma.publicUser.upsert({
      where: { id: `analytics-user-${i}` },
      update: {},
      create: {
        id: `analytics-user-${i}`,
        email: `analytics${i}@demo.groovethiopia.com`,
        name: `Analytics User ${i + 1}`,
        googleId: `analytics-${i}-${Date.now()}`,
      },
    });
    users.push(u);
  }

  // Get a few inquiries
  const inquiryCount = await prisma.inquiry.count();
  if (inquiryCount < 5) {
    for (let i = 0; i < 8; i++) {
      const days = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - days * 86400000);
      await prisma.inquiry.create({
        data: {
          division: ["EVENTS", "TRADING", "REAL_ESTATE"][i % 3],
          name: `Sample Inquiry ${i + 1}`,
          email: `inquiry${i}@example.com`,
          message: "Sample inquiry for analytics demo",
          status: "NEW",
          createdAt,
        },
      });
    }
    console.log("Created 8 sample inquiries");
  }

  // Create bookings spread over the past 30 days
  const existingBookings = await prisma.eventBooking.count();
  if (existingBookings < 5) {
    for (let i = 0; i < 12; i++) {
      const event = events[i % events.length];
      const user = users[i % users.length];
      const days = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - days * 86400000);
      await prisma.eventBooking.create({
        data: {
          eventId: event.id,
          publicUserId: user.id,
          partySize: Math.floor(Math.random() * 4) + 1,
          phoneNumber: `+251911${String(i).padStart(6, "0")}`,
          status: ["CONFIRMED", "PENDING", "CONFIRMED", "CONFIRMED"][i % 4] as any,
          createdAt,
        },
      });
    }
    console.log("Created 12 sample bookings");
  }

  // Create more ticket purchases spread over 30 days
  const existingTickets = await prisma.ticketPurchase.count();
  if (existingTickets < 5) {
    for (let i = 0; i < 20; i++) {
      const event = events[i % events.length];
      const user = users[i % users.length];
      const days = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - days * 86400000);
      const ticketPrice = Number(event.ticketPrice || 1000);
      const qty = Math.floor(Math.random() * 3) + 1;
      await prisma.ticketPurchase.create({
        data: {
          eventId: event.id,
          publicUserId: user.id,
          ticketType: "GENERAL",
          quantity: qty,
          unitPrice: ticketPrice,
          totalPrice: ticketPrice * qty,
          currency: "USD",
          paymentRef: `seed-sim-${i}-${Date.now()}`,
          status: "CONFIRMED",
          phoneNumber: `+251911${String(i).padStart(6, "0")}`,
          createdAt,
        },
      });
    }
    console.log("Created 20 sample ticket purchases");
  }

  // Create some public users spread over time
  const userCount = await prisma.publicUser.count();
  if (userCount < 10) {
    for (let i = 0; i < 30; i++) {
      const days = Math.floor(Math.random() * 30);
      const createdAt = new Date(Date.now() - days * 86400000);
      await prisma.publicUser.create({
        data: {
          id: `seed-user-${i}-${Date.now()}`,
          email: `seed${i}-${Date.now()}@demo.groovethiopia.com`,
          name: `Seed User ${i + 1}`,
          googleId: `seed-${i}-${Date.now()}`,
          createdAt,
        },
      });
    }
    console.log("Created 30 sample public users");
  }

  console.log("Done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
