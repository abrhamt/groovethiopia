import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { DigestButton } from "@/components/admin/digest-button";

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const [pendingCount, publishedCount, draftCount, recentInquiries, recentSubmissions, userCount] = await Promise.all([
    prisma.content.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.content.count({ where: { status: "PUBLISHED" } }),
    prisma.content.count({ where: { authorId: session?.user.id, status: "DRAFT" } }),
    isAdmin ? prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }) : Promise.resolve([]),
    prisma.approvalAction.findMany({
      where: { action: "SUBMIT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { content: true, user: { select: { name: true, email: true } } },
    }),
    isAdmin ? prisma.user.count() : Promise.resolve(0),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">
          Welcome back, <span className="text-gradient-gold">{session?.user.name || "Admin"}</span>
        </h1>
        <p className="text-ink-400">Here's what's happening across your ecosystem.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Pending Review" value={pendingCount} accent="gold" />
        <StatCard label="Published" value={publishedCount} accent="green" />
        <StatCard label="My Drafts" value={draftCount} accent="muted" />
        {isAdmin && <StatCard label="Total Users" value={userCount} accent="muted" />}
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isAdmin && (
          <div className="admin-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
              Recent Inquiries
              <a href="/inquiries" className="text-xs font-mono text-gold-400 hover:text-gold-300">View all →</a>
            </h3>
            {recentInquiries.length === 0 ? (
              <p className="text-sm text-ink-400">No inquiries yet.</p>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((i: any) => (
                  <a key={i.id} href={`/inquiries/${i.id}`} className="block p-3 -mx-3 rounded-lg hover:bg-ink-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{i.name}</p>
                        <p className="text-xs text-ink-400 truncate">{i.message}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-ink-400 whitespace-nowrap">
                        {i.division.toLowerCase()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            Recent Submissions
            <a href="/review" className="text-xs font-mono text-gold-400 hover:text-gold-300">View all →</a>
          </h3>
          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-ink-400">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSubmissions.map((s: any) => (
                <a key={s.id} href={`/review/${s.content.id}`} className="block p-3 -mx-3 rounded-lg hover:bg-ink-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-0">
                      <p className="text-sm font-medium truncate">{s.content.title}</p>
                      <p className="text-xs text-ink-400">
                        {s.user.name || s.user.email} · {s.content.type.toLowerCase()}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-ink-400 whitespace-nowrap">
                      {formatDateTime(s.createdAt)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DigestButton />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: "gold" | "green" | "muted" }) {
  return (
    <div className="admin-card">
      <p className="text-xs font-mono uppercase tracking-widest text-ink-400 mb-1">{label}</p>
      <p className={`text-3xl font-semibold ${
        accent === "gold" ? "text-gradient-gold" :
        accent === "green" ? "text-green-400" :
        "text-foreground"
      }`}>
        {value}
      </p>
    </div>
  );
}