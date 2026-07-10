import { setRequestLocale, getTranslations } from "next-intl/server";
import { AboutView } from "@/components/about/about-view";
import { dummyTeam } from "@/lib/dummy-data";

// Force dynamic rendering — server-side translation
export const dynamic = "force-dynamic";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "about" });
  const tValues = await getTranslations({ locale, namespace: "about.values" });

  const values = [0, 1, 2, 3].map((i) => ({
    title: tValues(`list.${i}.title`),
    body: tValues(`list.${i}.body`),
  }));

  // Fetch team members from the backend, falling back to a curated
  // dummy roster so the page is never empty.
  let team: any[] = [];
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API}/api/public/team`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      team = data.team || [];
    }
  } catch { }

  if (!team || team.length === 0) {
    team = dummyTeam;
  }

  const partnership = {
    title: t("partnership.title"),
    body: t("partnership.body"),
    items: [
      {
        label: t("partnership.inquire"),
        value: t("partnership.inquireDesc"),
        action: "Inquire",
        href: `/${locale}/contact`,
      },
      {
        label: t("partnership.consult"),
        value: t("partnership.consultDesc"),
        action: "Request",
        href: `/${locale}/contact`,
      },
      {
        label: t("partnership.invest"),
        value: t("partnership.investDesc"),
        action: "Explore",
        href: `/${locale}/contact`,
      },
    ]
  };

  return (
    <AboutView
      title={t("title")}
      subtitle={t("subtitle")}
      manifestoTitle={t("manifesto.title")}
      manifestoBody={t("manifesto.body")}
      missionTitle={t("mission.title")}
      missionBody={t("mission.body")}
      visionTitle={t("vision.title")}
      visionBody={t("vision.body")}
      storyTitle={t("story.title")}
      storyBody={t("story.body")}
      valuesTitle={t("values.title")}
      values={values}
      teamTitle={t("team.title")}
      teamSubtitle={t("team.subtitle")}
      team={team}
      partnership={partnership}
    />
  );
}
