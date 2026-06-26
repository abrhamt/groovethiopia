import Link from "next/link";
import { prisma } from "@groovethiopia/db";
import { formatDate } from "@/lib/utils";

export default async function ShukshutaPage() {
  // Find the parent Shukshuta series event
  const parent = await prisma.content.findFirst({
    where: { slug: "shukshuta-speakeasy", type: "EVENT" },
  });

  const subEvents = await prisma.content.findMany({
    where: { type: "SHUKSHUTA_EVENT", status: { in: ["PUBLISHED", "APPROVED", "DRAFT", "PENDING_REVIEW"] } },
    orderBy: { startsAt: "asc" },
    include: { media: { take: 1 } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Shukshuta Series</h1>
        <p className="text-ink-400">Manage the parent event and its sub-events (each edition)</p>
      </div>

      {/* Parent */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="label-mono">Parent Series</span>
            <h3 className="font-serif text-2xl mt-1">{parent?.title || "Shukshuta Speakeasy"}</h3>
          </div>
          <div className="flex items-center gap-2">
            {parent && (
              <Link href={`/events/${parent.id}`} className="admin-button-ghost text-xs">
                Edit Parent
              </Link>
            )}
          </div>
        </div>
        {parent?.body && (
          <p className="text-sm text-ink-300 font-serif leading-relaxed line-clamp-3">{parent.body}</p>
        )}
      </div>

      {/* Sub-events */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Editions</h2>
        <Link href="/events/new?shukshuta=true" className="admin-button text-sm">
          + New Edition
        </Link>
      </div>

      {subEvents.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="text-ink-400 mb-4">No editions yet</p>
          <Link href="/events/new?shukshuta=true" className="admin-button-ghost inline-block">
            Create the first edition
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {subEvents.map((e: any) => (
            <Link key={e.id} href={`/events/${e.id}`} className="admin-card flex gap-4 hover:border-gold-500/50">
              {e.media[0] && (
                <img src={e.media[0].thumbnailUrl || e.media[0].publicUrl} alt="" className="w-24 h-24 object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`admin-badge-${e.status === "PUBLISHED" ? "published" : e.status === "PENDING_REVIEW" ? "pending" : "draft"}`}>
                    {e.status.toLowerCase().replace("_", " ")}
                  </span>
                  {e.startsAt && (
                    <span className="text-xs text-ink-400">{formatDate(e.startsAt)}</span>
                  )}
                </div>
                <h3 className="font-serif text-xl">{e.title}</h3>
                {e.venue && <p className="text-xs text-ink-400 mt-1">{e.venue}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}