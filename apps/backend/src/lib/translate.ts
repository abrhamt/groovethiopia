// Google Translate API with glossary support
import { prisma } from "@groovethiopia/db";

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";

export async function autoTranslate(
  text: string,
  from: string,
  to: string
): Promise<string> {
  if (from === to) return text;
  if (!text.trim()) return text;

  // Check glossary first for brand terms
  const glossary = await prisma.glossaryTerm.findMany();
  for (const entry of glossary) {
    const translations = entry.translations as Record<string, string>;
    const translated = translations[to];
    if (translated && text.includes(entry.term)) {
      // Will use the glossary term in final translation
    }
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    console.warn("[translate] Not configured — returning original text");
    return text;
  }

  try {
    const url = `${ENDPOINT}?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: "text",
      }),
    });

    if (!res.ok) {
      console.error("[translate] API error", await res.text());
      return text;
    }

    const data = await res.json();
    let translated = data.data.translations[0].translatedText;

    // Apply glossary: replace brand terms
    for (const entry of glossary) {
      const translations = entry.translations as Record<string, string>;
      const target = translations[to];
      if (target) {
        const escaped = entry.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        translated = translated.replace(new RegExp(escaped, "gi"), target);
      }
    }

    return translated;
  } catch (e) {
    console.error("[translate] failed", e);
    return text;
  }
}

export async function autoTranslateContent(
  fields: Record<string, string>,
  from: string,
  targets: string[]
): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {};
  for (const field of Object.keys(fields)) {
    result[field] = { [from]: fields[field] };
    for (const to of targets) {
      if (to === from) continue;
      result[field][to] = await autoTranslate(fields[field], from, to);
    }
  }
  return result;
}