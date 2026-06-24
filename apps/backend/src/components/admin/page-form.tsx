"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

export function PageForm({
  mode,
  initial,
  defaultSlug,
  defaultTitle,
}: {
  mode: "create" | "edit";
  initial?: any;
  defaultSlug?: string;
  defaultTitle?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(mode === "create");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    const payload = {
      type: "PAGE",
      slug: fd.get("slug"),
      title: fd.get("title"),
      subtitle: fd.get("subtitle") || undefined,
      excerpt: fd.get("excerpt") || undefined,
      body: fd.get("body") || undefined,
      locale: fd.get("locale"),
      autoTranslate,
    };

    const url = mode === "create" ? "/api/admin/content" : `/api/admin/content/${initial.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed");
      return;
    }

    router.push("/pages");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {mode === "create" && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="label-mono block mb-2">Slug</label>
            <input
              name="slug"
              required
              defaultValue={defaultSlug}
              className="admin-input font-mono text-sm"
              placeholder="homepage-hero"
            />
            <p className="text-xs text-ink-500 mt-1">Internal identifier (kebab-case)</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="label-mono block mb-2">Title (internal)</label>
          <input
            name="title"
            required
            defaultValue={initial?.title || defaultTitle}
            className="admin-input"
            placeholder="Homepage Hero"
          />
        </div>
        <div>
          <label className="label-mono block mb-2">Locale</label>
          <select name="locale" defaultValue={initial?.locale || "en"} className="admin-input">
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      {mode === "create" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={(e) => setAutoTranslate(e.target.checked)}
            className="accent-gold-500"
          />
          <span className="text-ink-300">Auto-translate to other languages on save</span>
        </label>
      )}

      <div>
        <label className="label-mono block mb-2">Subtitle (shown as kicker)</label>
        <input name="subtitle" defaultValue={initial?.subtitle} className="admin-input" placeholder="A tagline or label" />
      </div>

      <div>
        <label className="label-mono block mb-2">Excerpt / Tagline</label>
        <input name="excerpt" defaultValue={initial?.excerpt} className="admin-input" placeholder="Short text shown prominently" />
      </div>

      <div>
        <label className="label-mono block mb-2">Body Content</label>
        <textarea
          name="body"
          rows={15}
          defaultValue={initial?.body}
          className="admin-input font-serif text-base leading-relaxed"
          placeholder="Full content for this page section..."
        />
        <p className="text-xs text-ink-500 mt-1">Markdown supported. Line breaks preserved.</p>
      </div>

      <div className="flex items-center gap-3 sticky bottom-0 bg-background py-4 border-t border-ink-800">
        <button type="submit" disabled={loading} className="admin-button">
          <Save size={16} className="mr-2" />
          {loading ? "Saving..." : mode === "create" ? "Create Page" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="admin-button-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}