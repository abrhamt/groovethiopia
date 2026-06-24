"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MediaUploader() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", file.name.replace(/\.[^.]+$/, ""));

      await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setUploading(false);
    router.refresh();
  }

  return (
    <div className="admin-card border-dashed">
      <label className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-ink-800/30 -m-6 rounded-xl transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <>
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-ink-300">Uploading... {progress}%</p>
          </>
        ) : (
          <>
            <p className="text-2xl text-gold-400 mb-2">+</p>
            <p className="text-sm font-medium mb-1">Drop images or click to upload</p>
            <p className="text-xs text-ink-400">Auto-processed (WebP, thumbnails, blurhash)</p>
          </>
        )}
      </label>
    </div>
  );
}