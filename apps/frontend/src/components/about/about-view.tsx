// Client component view for About page — receives all translated strings as props
import Link from "next/link";
import { TeamGrid } from "./team-grid";

export function AboutView(props: {
  title: string;
  subtitle: string;
  manifestoTitle: string;
  manifestoBody: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
  storyTitle: string;
  storyBody: string;
  valuesTitle: string;
  values: { title: string; body: string }[];
  teamTitle: string;
  teamSubtitle: string;
  team?: any[];
  partnership?: {
    title: string;
    body: string;
    items: { label: string; value: string; action: string; href: string }[];
  };
}) {
  return (
    <div className="pt-32">
      {/* Hero */}
      <section className="px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          <span className="label-mono">About</span>
          <h1 className="editorial-heading text-5xl md:text-7xl mt-6 mb-8 leading-tight">{props.title}</h1>
          <p className="text-xl md:text-2xl text-ink-200 font-serif font-light leading-relaxed whitespace-pre-line">
            {props.subtitle}
          </p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="px-6 py-32 border-y border-ink-800/50 bg-ink-900/30">
        <div className="max-w-4xl mx-auto">
          <span className="label-mono">{props.manifestoTitle}</span>
          <p className="text-2xl md:text-3xl font-serif font-light leading-relaxed mt-8 text-foreground">
            {props.manifestoBody}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="px-6 py-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <span className="label-mono">{props.missionTitle}</span>
            <p className="text-xl font-serif mt-6 leading-relaxed text-ink-200">{props.missionBody}</p>
          </div>
          <div>
            <span className="label-mono">{props.visionTitle}</span>
            <p className="text-xl font-serif mt-6 leading-relaxed text-ink-200">{props.visionBody}</p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 py-32 border-t border-ink-800/50">
        <div className="max-w-4xl mx-auto">
          <span className="label-mono">{props.storyTitle}</span>
          <p className="text-xl font-serif mt-8 leading-relaxed text-ink-200">{props.storyBody}</p>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-32 border-t border-ink-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-5xl mb-16">{props.valuesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {props.values.map((v, i) => (
              <div key={i} className="p-8 border border-ink-800 rounded-2xl bg-ink-900/40">
                <span className="label-mono text-gold-400 mb-3 block">0{i + 1}</span>
                <h3 className="font-serif text-2xl mb-3">{v.title}</h3>
                <p className="text-ink-300 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership */}
      {props.partnership && (
        <section className="px-6 py-32 border-t border-ink-800/50 bg-ink-900/10">
          <div className="max-w-4xl mx-auto">
            <span className="label-mono">Collaboration</span>
            <h2 className="editorial-heading text-5xl mt-4 mb-6">{props.partnership.title}</h2>
            <p className="text-xl font-serif leading-relaxed text-ink-200 mb-12">
              {props.partnership.body}
            </p>
            <div className="space-y-4">
              {props.partnership.items.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-ink-800 rounded-2xl bg-ink-900/40 hover:border-gold-500/30 transition-all">
                  <span className="font-serif text-lg text-ink-100 pr-4">
                    <span className="text-gold-400 font-semibold">{item.label}: </span>
                    {item.value}
                  </span>
                  <Link href={item.href} className="btn-secondary text-sm px-6 py-2 mt-4 sm:mt-0 text-center inline-block whitespace-nowrap min-w-[120px]">
                    {item.action}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      <section className="px-6 py-32 border-t border-ink-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="editorial-heading text-5xl mb-4">{props.teamTitle}</h2>
          <p className="text-ink-400 mb-16">{props.teamSubtitle}</p>
          <TeamGrid team={props.team || []} />
        </div>
      </section>
    </div>
  );
}