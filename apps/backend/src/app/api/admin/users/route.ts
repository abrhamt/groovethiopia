// GET /api/admin/users — list users (admin only)
// POST /api/admin/users — create user directly (admin only)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      approvedAt: true,
      createdAt: true,
      lastLoginAt: true,
      approvedBy: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ users });
}

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["ADMIN", "EDITOR"]),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name,
        role: parsed.data.role,
        status: "ACTIVE",
        passwordHash,
        approvedAt: new Date(),
        approvedById: session.user.id,
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (e) {
    console.error("[admin/users POST] error", e);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}