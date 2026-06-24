"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserActions({
  userId,
  status,
  role,
}: {
  userId: string;
  status: string;
  role: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(action: "APPROVE" | "DEACTIVATE" | "CHANGE_ROLE", role?: string) {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, role }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {status === "PENDING_APPROVAL" && (
        <button onClick={() => act("APPROVE")} disabled={loading} className="text-xs admin-button">
          Approve
        </button>
      )}
      <select
        value={role}
        onChange={(e) => act("CHANGE_ROLE", e.target.value)}
        disabled={loading}
        className="bg-ink-900 border border-ink-700 rounded px-2 py-1 text-xs"
      >
        <option value="EDITOR">Editor</option>
        <option value="ADMIN">Admin</option>
      </select>
      {status !== "DEACTIVATED" && (
        <button onClick={() => act("DEACTIVATE")} disabled={loading} className="text-xs text-red-400 hover:text-red-300">
          Deactivate
        </button>
      )}
    </div>
  );
}