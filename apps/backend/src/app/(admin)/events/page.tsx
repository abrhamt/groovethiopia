import { prisma } from "@groovethiopia/db";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export default async function EventsPage() {
  const events = await prisma.content.findMany({
    where: { type: { in: ["EVENT", "SHUKSHUTA_EVENT"] } },
    orderBy: { startsAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      media: { take: 1, orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">Events</h1>
          <p className="text-ink-400">Manage The Pulse — Events & Production</p>
        </div>
        <Link href="/events/new" className="admin-button">
          + New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="text-ink-400 mb-4">No events yet</p>
          <Link href="/events/new" className="admin-button-ghost inline-block">
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="admin-card flex gap-4 hover:border-gold-500/50"
            >
              {event.media[0] && (
                <img
                  src={event.media[0].thumbnailUrl || event.media[0].publicUrl}
                  alt=""
                  className="w-24 h-24 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={event.status} />
                  <span className="text-xs text-ink-500">{event.locale}</span>
                </div>
                <h3 className="font-semibold mb-1 truncate">{event.title}</h3>
                {event.venue && (
                  <p className="text-xs text-ink-400">
                    {event.venue} · {event.startsAt && formatDateTime(event.startsAt)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "admin-badge-draft",
    PENDING_REVIEW: "admin-badge-pending",
    APPROVED: "admin-badge-approved",
    PUBLISHED: "admin-badge-published",
    REJECTED: "admin-badge-rejected",
    ARCHIVED: "admin-badge-draft",
    ENDED: "admin-badge-draft",
    SOLD: "admin-badge-draft",
  };
  return <span className={map[status] || "admin-badge-draft"}>{status.toLowerCase().replace("_", " ")}</span>;
}