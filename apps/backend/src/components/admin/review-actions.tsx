"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewActions({ contentId }: { contentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [comment, setComment] = useState("");

  async function act(action: "APPROVE" | "REJECT" | "REQUEST_CHANGES") {
    if (action === "REJECT" || action === "REQUEST_CHANGES") {
      setShowReject(true);
      return;
    }
    setLoading(true);
    await fetch(`/api/admin/content/${contentId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  async function submitRejection() {
    setLoading(true);
    await fetch(`/api/admin/content/${contentId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REJECT", comment }),
    });
    router.refresh();
  }

  if (showReject) {
    return (
      <div className="space-y-3 min-w-[260px]">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Reason for rejection..."
          className="admin-input min-h-[80px]"
        />
        <div className="flex gap-2">
          <button onClick={submitRejection} disabled={loading || !comment.trim()} className="admin-button flex-1">
            {loading ? "..." : "Confirm Reject"}
          </button>
          <button onClick={() => setShowReject(false)} className="admin-button-ghost">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <button onClick={() => act("APPROVE")} disabled={loading} className="admin-button">
        Approve & Publish
      </button>
      <button onClick={() => act("REJECT")} disabled={loading} className="admin-button-ghost text-red-400 hover:text-red-300">
        Request Changes
      </button>
    </div>
  );
}