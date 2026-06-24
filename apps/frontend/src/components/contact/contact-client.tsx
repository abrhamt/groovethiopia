"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { GoogleAuth } from "@/components/auth/google-auth";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Division = "EVENTS" | "TRADING" | "REAL_ESTATE";

export function ContactClient() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");

  const [openModal, setOpenModal] = useState<Division | null>(null);
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const paths = [
    { key: "EVENTS" as Division, label: t("paths.events"), desc: t("paths.eventsDesc") },
    { key: "TRADING" as Division, label: t("paths.trading"), desc: t("paths.tradingDesc") },
    { key: "REAL_ESTATE" as Division, label: t("paths.realEstate"), desc: t("paths.realEstateDesc") },
  ];

  return (
    <>
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {paths.map((p) => (
            <button
              key={p.key}
              onClick={() => setOpenModal(p.key)}
              className="group p-8 border border-ink-800 rounded-2xl bg-ink-900/40 hover:border-gold-500/50 transition-all text-left"
            >
              <span className="label-mono">{p.key.replace("_", " ")}</span>
              <h3 className="font-serif text-2xl mt-3 mb-2 group-hover:text-gold-400 transition-colors">
                {p.label}
              </h3>
              <p className="text-sm text-ink-400">{p.desc}</p>
              <div className="mt-6 text-xs font-mono uppercase tracking-widest text-gold-400">
                Open →
              </div>
            </button>
          ))}
        </div>
      </section>

      {openModal && (
        <InquiryModal
          division={openModal}
          user={user}
          onClose={() => { setOpenModal(null); setSuccess(false); }}
          onUser={setUser}
          success={success}
          setSuccess={setSuccess}
        />
      )}
    </>
  );
}

function InquiryModal({
  division,
  user,
  onClose,
  onUser,
  success,
  setSuccess,
}: {
  division: Division;
  user: any;
  onClose: () => void;
  onUser: (u: any) => void;
  success: boolean;
  setSuccess: (s: boolean) => void;
}) {
  const t = useTranslations("contact.form");
  const tCommon = useTranslations("common");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    try {
      await api.submitInquiry({
        division,
        name: fd.get("name") as string,
        organization: fd.get("organization") as string,
        email: user.email,
        phone: fd.get("phone") as string,
        message: fd.get("message") as string,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || tCommon("error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto" onClick={onClose}>
      <div className="relative max-w-2xl w-full bg-ink-900 border border-ink-800 rounded-2xl p-8 my-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-ink-400 hover:text-gold-400">
          <X size={20} />
        </button>

        <span className="label-mono">{division.replace("_", " ")}</span>
        <h2 className="font-serif text-3xl mt-3 mb-8">
          {division === "EVENTS" ? "Event inquiry" : division === "TRADING" ? "Procurement inquiry" : "Investment inquiry"}
        </h2>

        {success ? (
          <div className="text-center py-12">
            <p className="text-4xl text-gold-400 mb-4">✓</p>
            <p className="text-xl font-serif">{tCommon("success")}</p>
          </div>
        ) : !user ? (
          <div>
            <p className="text-ink-300 mb-6">{t("signInRequired")}</p>
            <GoogleAuth onSuccess={onUser} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-mono block mb-2">{t("name")}</label>
              <input name="name" required className="w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-lg focus:border-gold-500 focus:outline-none" defaultValue={user.name} />
            </div>
            <div>
              <label className="label-mono block mb-2">{t("phone")}</label>
              <input name="phone" type="tel" className="w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-lg focus:border-gold-500 focus:outline-none" />
            </div>
            <div>
              <label className="label-mono block mb-2">{t("message")}</label>
              <textarea name="message" required rows={5} className="w-full px-4 py-3 bg-ink-800 border border-ink-700 rounded-lg focus:border-gold-500 focus:outline-none" />
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full"
            >
              {submitting ? tCommon("submitting") : t("submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}