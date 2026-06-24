// POST /api/admin/content/[id]/action — submit, approve, reject, publish, unpublish
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";
import { inngest } from "@/lib/inngest";

const schema = z.object({
  action: z.enum(["SUBMIT", "APPROVE", "REJECT", "PUBLISH", "UNPUBLISH", "REQUEST_CHANGES"]),
  comment: z.string().max(2000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { action, comment } = parsed.data;
    const content = await prisma.content.findUnique({
      where: { id },
      include: { author: { select: { name: true, email: true } } },
    });
    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = content.authorId === session.user.id;

    // Permission check
    if (action === "SUBMIT") {
      if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (!["DRAFT", "REJECTED"].includes(content.status)) {
        return NextResponse.json({ error: "Cannot submit from current state" }, { status: 400 });
      }
    } else if (action === "APPROVE" || action === "REJECT" || action === "REQUEST_CHANGES") {
      if (!isAdmin) return NextResponse.json({ error: "Only admins can approve/reject" }, { status: 403 });
      if (content.status !== "PENDING_REVIEW") {
        return NextResponse.json({ error: "Content not pending review" }, { status: 400 });
      }
    } else if (action === "PUBLISH") {
      if (!isAdmin) return NextResponse.json({ error: "Only admins can publish" }, { status: 403 });
    } else if (action === "UNPUBLISH") {
      if (!isAdmin) return NextResponse.json({ error: "Only admins can unpublish" }, { status: 403 });
    }

    // Apply action
    let newStatus: any = content.status;
    let publishNow = false;

    switch (action) {
      case "SUBMIT":
        newStatus = "PENDING_REVIEW";
        break;
      case "APPROVE":
        newStatus = "APPROVED";
        // Auto-publish if no schedule
        if (!content.scheduledFor) {
          newStatus = "PUBLISHED";
          publishNow = true;
        }
        break;
      case "REJECT":
        newStatus = "REJECTED";
        break;
      case "REQUEST_CHANGES":
        newStatus = "DRAFT";
        break;
      case "PUBLISH":
        newStatus = "PUBLISHED";
        publishNow = true;
        break;
      case "UNPUBLISH":
        newStatus = "ARCHIVED";
        break;
    }

    // Update content + record action
    const [updated, actionRecord] = await prisma.$transaction([
      prisma.content.update({
        where: { id },
        data: {
          status: newStatus,
          reviewerId: session.user.id,
          ...(publishNow && { publishedAt: new Date() }),
        },
      }),
      prisma.approvalAction.create({
        data: {
          contentId: id,
          userId: session.user.id,
          action,
          comment,
        },
      }),
    ]);

    // Trigger side effects via Inngest
    if (action === "SUBMIT") {
      await inngest.send({
        name: "content/submitted",
        data: {
          contentId: id,
          type: content.type,
          title: content.title,
          authorName: content.author.name || content.author.email,
        },
      });
    } else if (action === "APPROVE" || action === "PUBLISH") {
      await inngest.send({
        name: "content/approved",
        data: {
          contentId: id,
          editorEmail: content.author.email,
          title: content.title,
        },
      });
    } else if (action === "REJECT") {
      await inngest.send({
        name: "content/rejected",
        data: {
          contentId: id,
          editorEmail: content.author.email,
          title: content.title,
          reason: comment || "Changes requested",
        },
      });
    }

    return NextResponse.json({ success: true, content: updated, action: actionRecord });
  } catch (e) {
    console.error("[admin/content action] error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}