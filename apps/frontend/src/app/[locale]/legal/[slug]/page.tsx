import { setRequestLocale } from "next-intl/server";

const legalPages: Record<string, { title: string; content: string }> = {
  privacy: {
    title: "Privacy Policy",
    content: "Last updated: January 2026. This Privacy Policy describes how Groovethiopia Trading PLC collects, uses, and protects your personal information...",
  },
  terms: {
    title: "Terms of Service",
    content: "Last updated: January 2026. By accessing and using the Groovethiopia website, you agree to be bound by these Terms of Service...",
  },
  cookies: {
    title: "Cookie Policy",
    content: "Last updated: January 2026. This website uses cookies to enhance your browsing experience and analyze site traffic...",
  },
};

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = legalPages[slug];
  if (!page) {
    return (
      <div className="pt-32 px-6 pb-24 max-w-4xl mx-auto">
        <h1 className="editorial-heading text-5xl">Page not found</h1>
      </div>
    );
  }

  return (
    <div className="pt-32 px-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="editorial-heading text-5xl md:text-7xl mb-12">{page.title}</h1>
        <div className="prose prose-invert max-w-none">
          <p className="text-ink-300 leading-relaxed">{page.content}</p>
          <p className="text-ink-400 text-sm mt-8 italic">
            For the full legal text, please contact hello@groovethiopia.com.
          </p>
        </div>
      </div>
    </div>
  );
}