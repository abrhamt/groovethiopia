// PATCH /api/admin/content/[id] — update content (creates revision snapshot)
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  body: z.string().optional(),
  metadata: z.any().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  scheduledFor: z.string().datetime().optional(),
  unpublishAt: z.string().datetime().optional(),
  price: z.number().optional(),
  venue: z.string().optional(),
  venueAddress: z.string().optional(),
  year: z.number().int().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  projectStage: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Editors can only edit their own drafts
    if (session.user.role === "EDITOR") {
      if (existing.authorId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (!["DRAFT", "REJECTED"].includes(existing.status)) {
        return NextResponse.json({ error: "Cannot edit published content" }, { status: 403 });
      }
    }

    // Snapshot revision
    await prisma.revision.create({
      data: {
        contentId: id,
        userId: session.user.id,
        snapshot: existing as any,
      },
    });

    const updated = await prisma.content.update({
      where: { id },
      data: parsed.data as any,
    });

    return NextResponse.json({ success: true, content: updated });
  } catch (e) {
    console.error("[admin/content PATCH] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}