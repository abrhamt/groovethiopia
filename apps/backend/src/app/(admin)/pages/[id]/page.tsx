import { prisma } from "@groovethiopia/db";
import { PageForm } from "@/components/admin/page-form";

export default async function PageEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ slug?: string; title?: string }>;
}) {
  const { id } = await params;
  const { slug, title } = await searchParams;
  const isNew = id === "new";

  let page = null;
  if (!isNew) {
    page = await prisma.content.findUnique({
      where: { id },
      include: { media: true },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">
          {isNew ? "New Page Section" : page?.title || title || "Edit Page"}
        </h1>
        <p className="text-ink-400">
          Edit the content that appears on the public site.
        </p>
      </div>

      <PageForm
        mode={isNew ? "create" : "edit"}
        initial={page}
        defaultSlug={slug}
        defaultTitle={title ? decodeURIComponent(title) : undefined}
      />
    </div>
  );
}