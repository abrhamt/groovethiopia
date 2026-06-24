import { notFound } from "next/navigation";
import { prisma } from "@groovethiopia/db";
import { ContentForm } from "@/components/admin/content-form";
import { ReviewActions } from "@/components/admin/review-actions";
import { formatDateTime } from "@/lib/utils";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await prisma.content.findUnique({
    where: { id },
    include: { media: { orderBy: { createdAt: "asc" } } },
  });

  if (!vehicle) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">{vehicle.title}</h1>
          <p className="text-ink-400 text-sm">
            <span className="font-mono">{vehicle.type}</span> · {vehicle.locale} · Last updated {formatDateTime(vehicle.updatedAt)}
          </p>
        </div>
        {vehicle.status === "PENDING_REVIEW" && <ReviewActions contentId={vehicle.id} />}
      </div>
      <ContentForm type="VEHICLE" mode="edit" initial={vehicle} />
    </div>
  );
}