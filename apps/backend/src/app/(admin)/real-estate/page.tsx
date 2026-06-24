import { prisma } from "@groovethiopia/db";
import Link from "next/link";

export default async function RealEstatePage() {
  const projects = await prisma.content.findMany({
    where: { type: "REAL_ESTATE_PROJECT" },
    orderBy: { updatedAt: "desc" },
    include: { media: { take: 1, orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold mb-2">The Sanctuary</h1>
          <p className="text-ink-400">Real estate & development projects</p>
        </div>
        <Link href="/real-estate/new" className="admin-button">+ New Project</Link>
      </div>

      {projects.length === 0 ? (
        <div className="admin-card text-center py-16">
          <p className="text-ink-400 mb-4">No projects yet</p>
          <Link href="/real-estate/new" className="admin-button-ghost inline-block">
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Link key={p.id} href={`/real-estate/${p.id}`} className="admin-card flex gap-4 hover:border-gold-500/50">
              {p.media[0] && (
                <img src={p.media[0].thumbnailUrl || p.media[0].publicUrl} alt="" className="w-32 h-32 object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono uppercase text-gold-400 mb-1">
                  {p.projectStage?.toLowerCase()} · {p.location}
                </p>
                <h3 className="font-semibold mb-1">{p.title}</h3>
                <p className="text-xs text-ink-400 line-clamp-2">{p.excerpt}</p>
              </div>
              <span className="admin-badge-draft self-start">{p.status.toLowerCase()}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}