// GET /api/public/partners — list active partners
import { prisma } from "@groovethiopia/db";

export async function GET() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }],
  });

  return Response.json({ partners });
}