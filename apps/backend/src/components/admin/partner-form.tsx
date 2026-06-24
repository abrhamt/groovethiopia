"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PartnerForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await fetch("/api/admin/partners", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        tier: formData.get("tier"),
        description: formData.get("description"),
        websiteUrl: formData.get("websiteUrl"),
        isFeatured: formData.get("isFeatured") === "on",
      }),
      headers: { "Content-Type": "application/json" },
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="admin-button-ghost">
        + Add Partner
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="admin-card space-y-3">
      <input name="name" required placeholder="Partner name" className="admin-input" />
      <select name="tier" required className="admin-input">
        <option value="STRATEGIC">Strategic</option>
        <option value="CULTURAL">Cultural</option>
        <option value="MEDIA">Media</option>
      </select>
      <input name="description" placeholder="Short description" className="admin-input" />
      <input name="websiteUrl" type="url" placeholder="https://..." className="admin-input" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isFeatured" />
        Feature on Partners page
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="admin-button">
          {loading ? "Saving..." : "Save Partner"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="admin-button-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}