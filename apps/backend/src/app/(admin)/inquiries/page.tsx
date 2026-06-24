import { prisma } from "@groovethiopia/db";
import { formatDateTime } from "@/lib/utils";
import { auth } from "@/lib/auth";

export default async function InquiriesPage() {
  const session = await auth();
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Inquiries</h1>
        <p className="text-ink-400">{inquiries.length} {inquiries.length === 1 ? "inquiry" : "inquiries"} from the public site</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="text-ink-400">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((i) => (
            <div key={i.id} className="admin-card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`admin-badge-${i.status === "NEW" ? "pending" : "draft"}`}>
                    {i.status.toLowerCase().replace("_", " ")}
                  </span>
                  <span className="text-xs font-mono uppercase text-gold-400">
                    {i.division.toLowerCase()}
                  </span>
                </div>
                <span className="text-xs text-ink-400">{formatDateTime(i.createdAt)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-ink-400">From:</span>{" "}
                  <span className="text-foreground">{i.name}</span>
                  {i.organization && <span className="text-ink-400"> · {i.organization}</span>}
                </div>
                <div>
                  <span className="text-ink-400">Email:</span>{" "}
                  <a href={`mailto:${i.email}`} className="text-gold-400 hover:text-gold-300">{i.email}</a>
                  {i.phone && <span className="text-ink-400"> · {i.phone}</span>}
                </div>
              </div>
              <p className="text-sm text-ink-200 whitespace-pre-wrap">{i.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}