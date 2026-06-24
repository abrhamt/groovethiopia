import { prisma } from "@groovethiopia/db";
import { MediaUploader } from "@/components/admin/media-uploader";

export default async function GalleryPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { content: { select: { title: true, type: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Gallery</h1>
        <p className="text-ink-400">Visual assets across all divisions</p>
      </div>

      <MediaUploader />

      {media.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="text-ink-400">No media uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {media.map((m) => (
            <div key={m.id} className="aspect-square rounded-lg overflow-hidden bg-ink-800 relative group">
              <img
                src={m.thumbnailUrl || m.publicUrl}
                alt={m.altText || ""}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-xs">
                <p className="text-white truncate">{m.filename}</p>
                {m.content && <p className="text-gold-400 truncate">{m.content.title}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}