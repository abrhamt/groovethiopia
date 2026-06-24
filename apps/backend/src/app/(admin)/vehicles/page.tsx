import { prisma } from "@groovethiopia/db";
import Link from "next/link";
import { VehiclesBulkClient } from "@/components/admin/vehicles-bulk-client";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const vehicles = await prisma.content.findMany({
    where: { type: "VEHICLE" },
    orderBy: { updatedAt: "desc" },
    include: {
      media: { take: 1, orderBy: { createdAt: "asc" } },
    },
  });

  const serialized = vehicles.map((v) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    year: v.year,
    make: v.make,
    category: v.category,
    status: v.status,
    price: v.price?.toString() || null,
    currency: v.currency,
    imageUrl: v.media[0]?.thumbnailUrl || v.media[0]?.publicUrl || null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">The Collection</h1>
          <p className="text-ink-400">Luxury & vintage automotive assets</p>
        </div>
        <Link href="/vehicles/new" className="admin-button">+ Add Vehicle</Link>
      </div>

      <VehiclesBulkClient items={serialized} />
    </div>
  );
}