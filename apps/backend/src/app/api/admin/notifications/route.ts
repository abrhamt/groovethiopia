// GET /api/admin/notifications — get recent activity for bell
import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const isAdmin = session.user.role === "ADMIN";

  const [recentInquiries, recentSubmissions, pendingUsers] = await Promise.all([
    isAdmin
      ? prisma.inquiry.findMany({
          where: { status: "NEW" },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [],
    prisma.approvalAction.findMany({
      where: { action: "SUBMIT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { content: true, user: true },
    }),
    isAdmin
      ? prisma.user.findMany({
          where: { status: "PENDING_APPROVAL" },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [],
  ]);

  const notifications = [
    ...recentInquiries.map((i) => ({
      id: `inquiry-${i.id}`,
      type: "inquiry" as const,
      title: `New ${i.division.toLowerCase()} inquiry`,
      message: `${i.name}: ${i.message.slice(0, 60)}...`,
      href: `/inquiries/${i.id}`,
      createdAt: i.createdAt.toISOString(),
      read: false,
    })),
    ...recentSubmissions.map((s) => ({
      id: `submission-${s.id}`,
      type: "submission" as const,
      title: `${s.user.name || s.user.email} submitted for review`,
      message: s.content.title,
      href: `/review`,
      createdAt: s.createdAt.toISOString(),
      read: false,
    })),
    ...pendingUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "user_registration" as const,
      title: "New user awaiting approval",
      message: u.name ? `${u.name} (${u.email})` : u.email,
      href: `/users`,
      createdAt: u.createdAt.toISOString(),
      read: false,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return Response.json({ notifications });
}