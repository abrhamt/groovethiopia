"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Sparkles, Save, X } from "lucide-react";

type ContentType = "EVENT" | "VEHICLE" | "REAL_ESTATE_PROJECT" | "PAGE";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "am", label: "አማርኛ" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

export function ContentForm({
  type,
  initial,
  mode = "create",
}: {
  type: ContentType;
  initial?: any;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(mode === "create");
  const [media, setMedia] = useState<any[]>(initial?.media || []);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = buildPayload(type, fd, autoTranslate);

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

    const result = await res.json();
    router.push(`/${typeToPath(type)}/${result.content.id}`);
    router.refresh();
  }

  async function handleUpload(files: File[]) {
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("altText", file.name.replace(/\.[^.]+$/, ""));
      if (initial?.id) fd.append("contentId", initial.id);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setMedia((m) => [...m, data.media]);
      }
    }
    setUploading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Locale + Translate */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="label-mono block mb-2">Locale</label>
          <select name="locale" defaultValue={initial?.locale || "en"} className="admin-input">
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
        {mode === "create" && (
          <label className="flex items-center gap-2 mt-6 text-sm">
            <input
              type="checkbox"
              checked={autoTranslate}
              onChange={(e) => setAutoTranslate(e.target.checked)}
              className="accent-gold-500"
            />
            <Sparkles size={14} className="text-gold-400" />
            <span className="text-ink-300">Auto-translate to other languages</span>
          </label>
        )}
      </div>

      {/* Core fields */}
      <div>
        <label className="label-mono block mb-2">Title</label>
        <input
          name="title"
          required
          defaultValue={initial?.title}
          className="admin-input text-2xl font-serif"
          placeholder="The headline"
        />
      </div>

      <div>
        <label className="label-mono block mb-2">Subtitle</label>
        <input
          name="subtitle"
          defaultValue={initial?.subtitle}
          className="admin-input"
          placeholder="Optional tagline"
        />
      </div>

      <div>
        <label className="label-mono block mb-2">Excerpt</label>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={initial?.excerpt}
          className="admin-input"
          placeholder="Short description shown in lists"
        />
      </div>

      <div>
        <label className="label-mono block mb-2">Body</label>
        <textarea
          name="body"
          rows={12}
          defaultValue={initial?.body}
          className="admin-input font-mono text-sm"
          placeholder="Full content (markdown supported)"
        />
      </div>

      {/* Type-specific fields */}
      {type === "EVENT" && <EventFields initial={initial} />}
      {type === "VEHICLE" && <VehicleFields initial={initial} />}
      {type === "REAL_ESTATE_PROJECT" && <RealEstateFields initial={initial} />}

      {/* Scheduling */}
      <div className="admin-card">
        <h3 className="label-mono mb-4">Scheduling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-ink-400 block mb-1">Publish at (optional)</label>
            <input
              type="datetime-local"
              name="scheduledFor"
              defaultValue={initial?.scheduledFor ? toLocalISO(initial.scheduledFor) : ""}
              className="admin-input"
            />
          </div>
          <div>
            <label className="text-xs text-ink-400 block mb-1">Unpublish at (optional)</label>
            <input
              type="datetime-local"
              name="unpublishAt"
              defaultValue={initial?.unpublishAt ? toLocalISO(initial.unpublishAt) : ""}
              className="admin-input"
            />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="admin-card">
        <h3 className="label-mono mb-4">Media</h3>
        <label className="border border-dashed border-ink-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gold-500 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <p className="text-sm text-ink-300">Uploading...</p>
          ) : (
            <>
              <ImageIcon size={24} className="text-gold-400 mb-2" />
              <p className="text-sm text-ink-300">Click to upload images</p>
              <p className="text-xs text-ink-500 mt-1">Auto-processed: WebP, thumbnails, blurhash</p>
            </>
          )}
        </label>
        {media.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">
            {media.map((m) => (
              <div key={m.id} className="aspect-square rounded overflow-hidden bg-ink-800">
                <img src={m.thumbnailUrl || m.publicUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-background py-4 border-t border-ink-800">
        <button type="submit" disabled={loading} className="admin-button">
          <Save size={16} className="mr-2" />
          {loading ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} className="admin-button-ghost">
          <X size={16} className="mr-2" />
          Cancel
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={async () => {
              if (!confirm("Submit for admin review?")) return;
              await fetch(`/api/admin/content/${initial.id}/action`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "SUBMIT" }),
              });
              router.refresh();
            }}
            disabled={initial?.status !== "DRAFT" && initial?.status !== "REJECTED"}
            className="admin-button-ghost ml-auto"
          >
            Submit for Review
          </button>
        )}
      </div>
    </form>
  );
}

function EventFields({ initial }: { initial?: any }) {
  return (
    <div className="admin-card">
      <h3 className="label-mono mb-4">Event details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ink-400 block mb-1">Starts at</label>
          <input type="datetime-local" name="startsAt" defaultValue={initial?.startsAt ? toLocalISO(initial.startsAt) : ""} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Ends at</label>
          <input type="datetime-local" name="endsAt" defaultValue={initial?.endsAt ? toLocalISO(initial.endsAt) : ""} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Venue</label>
          <input name="venue" defaultValue={initial?.venue} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Venue address</label>
          <input name="venueAddress" defaultValue={initial?.venueAddress} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Capacity</label>
          <input type="number" name="capacity" defaultValue={initial?.capacity} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Ticket price (USD)</label>
          <input type="number" step="0.01" name="ticketPrice" defaultValue={initial?.ticketPrice} className="admin-input" />
        </div>
      </div>
    </div>
  );
}

function VehicleFields({ initial }: { initial?: any }) {
  return (
    <div className="admin-card">
      <h3 className="label-mono mb-4">Vehicle details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ink-400 block mb-1">Year</label>
          <input type="number" name="year" defaultValue={initial?.year} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Make</label>
          <input name="make" defaultValue={initial?.make} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Model</label>
          <input name="model" defaultValue={initial?.model} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Category</label>
          <select name="category" defaultValue={initial?.category || "MODERN_LUXURY"} className="admin-input">
            <option value="MODERN_LUXURY">Modern Luxury</option>
            <option value="VINTAGE_CLASSIC">Vintage Classic</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Price</label>
          <input type="number" step="0.01" name="price" defaultValue={initial?.price} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Currency</label>
          <select name="currency" defaultValue={initial?.currency || "USD"} className="admin-input">
            <option>USD</option>
            <option>EUR</option>
            <option>ETB</option>
            <option>GBP</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function RealEstateFields({ initial }: { initial?: any }) {
  return (
    <div className="admin-card">
      <h3 className="label-mono mb-4">Project details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ink-400 block mb-1">Location</label>
          <input name="location" defaultValue={initial?.location} className="admin-input" />
        </div>
        <div>
          <label className="text-xs text-ink-400 block mb-1">Project stage</label>
          <select name="projectStage" defaultValue={initial?.projectStage || "PLANNING"} className="admin-input">
            <option value="PLANNING">Planning</option>
            <option value="DESIGN">Design</option>
            <option value="CONSTRUCTION">Construction</option>
            <option value="OPERATIONAL">Operational</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function buildPayload(type: ContentType, fd: FormData, autoTranslate: boolean) {
  const base: any = {
    type,
    title: fd.get("title"),
    subtitle: fd.get("subtitle") || undefined,
    excerpt: fd.get("excerpt") || undefined,
    body: fd.get("body") || undefined,
    locale: fd.get("locale"),
    autoTranslate,
  };

  if (type === "EVENT") {
    base.startsAt = toISO(fd.get("startsAt") as string);
    base.endsAt = toISO(fd.get("endsAt") as string);
    base.venue = fd.get("venue") || undefined;
    base.venueAddress = fd.get("venueAddress") || undefined;
    base.capacity = num(fd.get("capacity"));
    base.ticketPrice = num(fd.get("ticketPrice"));
  } else if (type === "VEHICLE") {
    base.year = num(fd.get("year"));
    base.make = fd.get("make") || undefined;
    base.model = fd.get("model") || undefined;
    base.category = fd.get("category") || undefined;
    base.price = num(fd.get("price"));
    base.currency = fd.get("currency") || undefined;
  } else if (type === "REAL_ESTATE_PROJECT") {
    base.location = fd.get("location") || undefined;
    base.projectStage = fd.get("projectStage") || undefined;
  }

  base.scheduledFor = toISO(fd.get("scheduledFor") as string);
  base.unpublishAt = toISO(fd.get("unpublishAt") as string);

  return base;
}

function toISO(v: string | null): string | undefined {
  if (!v) return undefined;
  try {
    return new Date(v).toISOString();
  } catch {
    return undefined;
  }
}

function toLocalISO(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function num(v: FormDataEntryValue | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function typeToPath(type: ContentType): string {
  if (type === "EVENT") return "events";
  if (type === "VEHICLE") return "vehicles";
  if (type === "REAL_ESTATE_PROJECT") return "real-estate";
  return "pages";
}