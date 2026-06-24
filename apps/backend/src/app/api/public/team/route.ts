// GET /api/public/team — leadership + team members
import { NextResponse } from "next/server";
import { prisma } from "@groovethiopia/db";

export async function GET() {
  const team = await prisma.teamMember.findMany({
    orderBy: [{ isLeadership: "desc" }, { displayOrder: "asc" }],
  });

  return Response.json({ team });
}