import { setRequestLocale, getTranslations } from "next-intl/server";
import { AboutView } from "@/components/about/about-view";

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

  // Resolve values list server-side
  const values = [0, 1, 2, 3].map((i) => ({
    title: tValues(`list.${i}.title`),
    body: tValues(`list.${i}.body`),
  }));

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
    />
  );
}