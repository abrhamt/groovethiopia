import { prisma } from "@groovethiopia/db";
import { ReviewActions } from "@/components/admin/review-actions";
import { formatDateTime } from "@/lib/utils";

export default async function ReviewPage() {
  const items = await prisma.content.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { updatedAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      media: { take: 1, orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Pending Review</h1>
        <p className="text-ink-400">{items.length} {items.length === 1 ? "item" : "items"} awaiting approval</p>
      </div>

      {items.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="text-ink-400 mb-2">All caught up</p>
          <p className="text-xs text-ink-500">No content pending review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="admin-card flex gap-4">
              {item.media[0] && (
                <img
                  src={item.media[0].thumbnailUrl || item.media[0].publicUrl}
                  alt={item.media[0].altText || ""}
                  className="w-32 h-32 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono uppercase text-gold-400">
                    {item.type.toLowerCase().replace("_", " ")}
                  </span>
                  <span className="text-xs text-ink-500">·</span>
                  <span className="text-xs text-ink-400">{item.locale}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1 truncate">{item.title}</h3>
                {item.excerpt && (
                  <p className="text-sm text-ink-300 line-clamp-2 mb-2">{item.excerpt}</p>
                )}
                <p className="text-xs text-ink-400">
                  By {item.author.name || item.author.email} · {formatDateTime(item.updatedAt)}
                </p>
              </div>
              <ReviewActions contentId={item.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}