// POST /api/admin/content/bulk — bulk actions on multiple content items
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";
import { inngest } from "@/lib/inngest";

const schema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  action: z.enum([
    "PUBLISH",         // → PUBLISHED
    "UNPUBLISH",       // → ARCHIVED
    "ARCHIVE",         // → ARCHIVED
    "DELETE",          // hard delete
    "APPROVE",         // → APPROVED (+ PUBLISHED if no schedule)
    "REJECT",          // → REJECTED
    "SET_FEATURED",    // toggle featured flag in metadata
    "UNSET_FEATURED",
  ]),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { ids, action, comment } = parsed.data;
    const isAdmin = session.user.role === "ADMIN";

    // Editors can only operate on their own drafts
    if (!isAdmin) {
      const items = await prisma.content.findMany({
        where: { id: { in: ids } },
        select: { id: true, authorId: true, status: true },
      });
      const disallowed = items.find(
        (i) => i.authorId !== session.user.id || !["DRAFT", "REJECTED"].includes(i.status)
      );
      if (disallowed) {
        return NextResponse.json({ error: "Editors can only bulk-update own drafts" }, { status: 403 });
      }
    }

    // Snapshot revisions before changes
    if (["PUBLISH", "ARCHIVE", "APPROVE", "REJECT"].includes(action)) {
      const existing = await prisma.content.findMany({ where: { id: { in: ids } } });
      await prisma.revision.createMany({
        data: existing.map((e: any) => ({
          contentId: e.id,
          userId: session.user.id,
          snapshot: e as any,
          changeNote: `Bulk ${action.toLowerCase()}: ${comment || ""}`,
        })),
      });
    }

    // Apply action
    let updated = 0;
    const now = new Date();

    if (action === "DELETE") {
      // Cascade: delete media, revisions, etc.
      const result = await prisma.content.deleteMany({ where: { id: { in: ids } } });
      updated = result.count;
    } else {
      // Compute status / data update
      let data: any = {};

      switch (action) {
        case "PUBLISH":
          data = { status: "PUBLISHED", publishedAt: now };
          break;
        case "UNPUBLISH":
        case "ARCHIVE":
          data = { status: "ARCHIVED" };
          break;
        case "APPROVE":
          data = { status: "PUBLISHED", publishedAt: now, reviewerId: session.user.id };
          break;
        case "REJECT":
          data = { status: "REJECTED", reviewerId: session.user.id };
          break;
        case "SET_FEATURED":
        case "UNSET_FEATURED":
          // Special handling: merge metadata
          const featured = action === "SET_FEATURED";
          const items = await prisma.content.findMany({
            where: { id: { in: ids } },
            select: { id: true, metadata: true },
          });
          for (const item of items) {
            const meta = (item.metadata as any) || {};
            await prisma.content.update({
              where: { id: item.id },
              data: { metadata: { ...meta, featured } },
            });
            updated++;
          }
          break;
      }

      if (Object.keys(data).length > 0) {
        const result = await prisma.content.updateMany({
          where: { id: { in: ids } },
          data,
        });
        updated = result.count;
      }
    }

    // Record action + send notifications
    if (["APPROVE", "REJECT"].includes(action) && isAdmin) {
      const items = await prisma.content.findMany({
        where: { id: { in: ids } },
        include: { author: { select: { email: true, name: true } } },
      });

      for (const item of items) {
        await prisma.approvalAction.create({
          data: {
            contentId: item.id,
            userId: session.user.id,
            action: action === "APPROVE" ? "APPROVE" : "REJECT",
            comment: comment || `Bulk action: ${action.toLowerCase()}`,
          },
        });

        if (action === "APPROVE") {
          await inngest.send({
            name: "content/approved",
            data: {
              contentId: item.id,
              editorEmail: item.author.email,
              title: item.title,
            },
          });
        } else {
          await inngest.send({
            name: "content/rejected",
            data: {
              contentId: item.id,
              editorEmail: item.author.email,
              title: item.title,
              reason: comment || "Bulk rejection",
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      action,
      affected: updated,
    });
  } catch (e) {
    console.error("[admin/bulk] error", e);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}