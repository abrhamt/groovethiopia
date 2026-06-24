import { notFound } from "next/navigation";
import { prisma } from "@groovethiopia/db";
import { ContentForm } from "@/components/admin/content-form";
import { ReviewActions } from "@/components/admin/review-actions";
import { formatDateTime } from "@/lib/utils";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.content.findUnique({
    where: { id },
    include: { media: { orderBy: { createdAt: "asc" } } },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">{project.title}</h1>
          <p className="text-ink-400 text-sm">
            <span className="font-mono">{project.type}</span> · {project.locale} · Last updated {formatDateTime(project.updatedAt)}
          </p>
        </div>
        {project.status === "PENDING_REVIEW" && <ReviewActions contentId={project.id} />}
      </div>
      <ContentForm type="REAL_ESTATE_PROJECT" mode="edit" initial={project} />
    </div>
  );
}