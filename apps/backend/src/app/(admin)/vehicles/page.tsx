import { prisma } from "@groovethiopia/db";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export default async function VehiclesPage() {
  const vehicles = await prisma.content.findMany({
    where: { type: "VEHICLE" },
    orderBy: { updatedAt: "desc" },
    include: {
      media: { take: 1, orderBy: { createdAt: "asc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">The Collection</h1>
          <p className="text-ink-400">Luxury & vintage automotive assets</p>
        </div>
        <Link href="/vehicles/new" className="admin-button">+ Add Vehicle</Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="text-ink-400 mb-4">No vehicles in the collection yet</p>
          <Link href="/vehicles/new" className="admin-button-ghost inline-block">
            Add your first vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/vehicles/${v.id}`}
              className="admin-card p-0 overflow-hidden hover:border-gold-500/50"
            >
              {v.media[0] && (
                <img
                  src={v.media[0].publicUrl}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5">
                <p className="text-xs font-mono uppercase text-gold-400 mb-1">
                  {v.year} · {v.make}
                </p>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                {v.price && (
                  <p className="text-lg text-gradient-gold font-semibold mb-2">
                    ${Number(v.price).toLocaleString()}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-400">{v.category?.replace("_", " ").toLowerCase()}</span>
                  <StatusBadge status={v.status} />
                </div>
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
    SOLD: "admin-badge-rejected",
  };
  return <span className={map[status] || "admin-badge-draft"}>{status.toLowerCase().replace("_", " ")}</span>;
}