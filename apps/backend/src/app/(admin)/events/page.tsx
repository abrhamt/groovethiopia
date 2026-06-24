import { prisma } from "@groovethiopia/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { EventsBulkClient } from "@/components/admin/events-bulk-client";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.content.findMany({
    where: { type: { in: ["EVENT", "SHUKSHUTA_EVENT"] } },
    orderBy: { startsAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      media: { take: 1, orderBy: { createdAt: "asc" } },
    },
  });

  const serialized = events.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    locale: e.locale,
    status: e.status,
    startsAt: e.startsAt?.toISOString() || null,
    venue: e.venue,
    imageUrl: e.media[0]?.thumbnailUrl || e.media[0]?.publicUrl || null,
    type: e.type,
  }));

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

      <EventsBulkClient items={serialized} />
    </div>
  );
}