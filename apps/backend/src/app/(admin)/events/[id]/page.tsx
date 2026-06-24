import { notFound } from "next/navigation";
import { prisma } from "@groovethiopia/db";
import { ContentForm } from "@/components/admin/content-form";
import { ReviewActions } from "@/components/admin/review-actions";
import { formatDateTime } from "@/lib/utils";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.content.findUnique({
    where: { id },
    include: { media: { orderBy: { createdAt: "asc" } } },
  });

  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">{event.title}</h1>
          <p className="text-ink-400 text-sm">
            <span className="font-mono">{event.type}</span> · {event.locale} · Last updated {formatDateTime(event.updatedAt)}
          </p>
        </div>
        {event.status === "PENDING_REVIEW" && <ReviewActions contentId={event.id} />}
      </div>

      <ContentForm type="EVENT" mode="edit" initial={event} />
    </div>
  );
}