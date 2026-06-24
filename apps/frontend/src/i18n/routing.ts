import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "am", "fr", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});