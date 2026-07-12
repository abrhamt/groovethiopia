import type { PageSection } from "@/lib/pages";

export function ManifestoTeaserDynamic({ section }: { section: PageSection }) {
  return (
    <section className="relative py-16 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="label-mono mb-8">{section.subtitle || "Our philosophy"}</div>
        <p className="text-2xl md:text-4xl font-serif font-light leading-relaxed text-foreground whitespace-pre-wrap">
          {section.excerpt || section.body}
        </p>
        <div className="gold-line w-24 mx-auto mt-12" />
      </div>
    </section>
  );
}