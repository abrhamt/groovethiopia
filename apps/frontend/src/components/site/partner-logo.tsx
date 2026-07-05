"use client";

import { useState } from "react";

export type PartnerLike = {
  name: string;
  logoUrl?: string | null;
  tier?: string;
};

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { box: string; text: string }> = {
  xs: { box: "w-10 h-10", text: "text-base" },
  sm: { box: "w-14 h-14", text: "text-lg" },
  md: { box: "w-24 h-24", text: "text-3xl" },
  lg: { box: "w-40 h-40", text: "text-5xl" },
  xl: { box: "w-72 h-72 md:w-96 md:h-96", text: "text-8xl" },
};

/**
 * PartnerLogo renders a partner's logo image. If no `logoUrl` is set on the
 * partner record, the component falls back to public CDN sources
 * (Clearbit + Wikipedia) by matching the partner name against a known map,
 * and finally to a styled gold-on-ink placeholder with the partner's initial.
 *
 * The fallback chain is automatic and graceful — admins don't need to upload
 * anything for the home-page marquee or the partners page to look complete.
 */
export function PartnerLogo({
  partner,
  size = "md",
  showCaption = false,
  className = "",
}: {
  partner: PartnerLike;
  size?: Size;
  showCaption?: boolean;
  className?: string;
}) {
  const sz = sizeMap[size];
  const initial = (partner.name || "?").trim().charAt(0).toUpperCase();
  const candidates = buildLogoCandidates(partner);
  const [idx, setIdx] = useState(0);
  const src = candidates[idx];
  const showImage = !!src && idx < candidates.length;

  return (
    <div className={"flex flex-col items-center justify-center " + className}>
      <div
        className={
          sz.box +
          " relative flex items-center justify-center rounded-2xl border border-ink-800/80 bg-gradient-to-br from-ink-900/80 to-ink-950 overflow-hidden shrink-0 p-2"
        }
        aria-label={partner.name + " logo"}
        title={partner.name}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={partner.name + " logo"}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={() => setIdx(idx + 1)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span
              className={
                "font-serif font-bold text-gold-400 " +
                sz.text +
                " drop-shadow-[0_0_10px_rgba(212,149,32,0.25)]"
              }
            >
              {initial}
            </span>
          </div>
        )}
      </div>
      {showCaption && (
        <p className="mt-3 text-center text-sm text-ink-300 line-clamp-2 max-w-[12rem]">
          {partner.name}
        </p>
      )}
    </div>
  );
}

function buildLogoCandidates(partner: PartnerLike): string[] {
  const out: string[] = [];
  if (partner.logoUrl) out.push(partner.logoUrl);

  const domain = guessDomain(partner.name);
  if (domain) {
    out.push("https://logo.clearbit.com/" + domain + "?size=200");
  }

  const wiki = guessWikipediaLogo(partner.name);
  if (wiki) out.push(wiki);

  if (domain) {
    out.push("https://www.google.com/s2/favicons?sz=128&domain=" + domain);
  }

  return out;
}

function guessDomain(name: string): string | null {
  const map: Record<string, string> = {
    "NIB International Bank": "nibbank.com.et",
    "Hyatt Regency": "hyatt.com",
    "Ethiopian Airlines": "ethiopianairlines.com",
    "Sheraton Addis": "marriott.com",
    "Addis Ababa University": "aau.edu.et",
    "Kana TV": "kanatelevition.com",
  };
  return map[name] || null;
}

function guessWikipediaLogo(name: string): string | null {
  const m: Record<string, string> = {
    "NIB International Bank":
      "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Nibbank.svg/240px-Nibbank.svg.png",
    "Hyatt Regency":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Hyatt_Logo.svg/240px-Hyatt_Logo.svg.png",
    "Ethiopian Airlines":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Ethiopian_Airlines_logo.svg/240px-Ethiopian_Airlines_logo.svg.png",
    "Sheraton Addis":
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Marriott_Hotels_%26_Resorts_logo.svg/240px-Marriott_Hotels_%26_Resorts_logo.svg.png",
    "Addis Ababa University":
      "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Addis_Ababa_University_logo.svg/200px-Addis_Ababa_University_logo.svg.png",
    "Kana TV":
      "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Kana_TV_logo.png/240px-Kana_TV_logo.png",
  };
  return m[name] || null;
}
