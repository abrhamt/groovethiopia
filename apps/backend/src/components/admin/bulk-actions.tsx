"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Archive, Trash2, Star, Send, Loader2 } from "lucide-react";

export type BulkAction = "PUBLISH" | "UNPUBLISH" | "ARCHIVE" | "DELETE" | "APPROVE" | "REJECT" | "SET_FEATURED" | "UNSET_FEATURED";

type Action = {
  key: BulkAction;
  label: string;
  icon: React.ReactNode;
  variant?: "primary" | "default" | "danger";
  confirm?: boolean;
};

const ACTIONS: Action[] = [
  { key: "APPROVE", label: "Approve", icon: <Check size={14} />, variant: "primary", confirm: true },
  { key: "PUBLISH", label: "Publish", icon: <Send size={14} />, variant: "primary", confirm: true },
  { key: "SET_FEATURED", label: "Feature", icon: <Star size={14} /> },
  { key: "UNSET_FEATURED", label: "Unfeature", icon: <Star size={14} /> },
  { key: "ARCHIVE", label: "Archive", icon: <Archive size={14} />, confirm: true },
  { key: "REJECT", label: "Reject", icon: <X size={14} />, confirm: true },
  { key: "DELETE", label: "Delete", icon: <Trash2 size={14} />, variant: "danger", confirm: true },
];

export function BulkActions({
  selectedIds,
  onClearSelection,
}: {
  selectedIds: string[];
  onClearSelection: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (selectedIds.length === 0) return null;

  async function handleAction(action: BulkAction) {
    const actionDef = ACTIONS.find((a) => a.key === action)!;
    if (actionDef.confirm) {
      const msg = `${actionDef.label} ${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"}?`;
      if (!confirm(msg)) return;
    }

    setLoading(action);
    setError("");

    try {
      const res = await fetch("/api/admin/content/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }

      onClearSelection();
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Action failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-2xl shadow-2xl border border-gold-500/30 px-5 py-3 flex items-center gap-3 max-w-4xl overflow-x-auto">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gold-500/10 border border-gold-500/30 rounded-full">
        <span className="text-xs font-mono uppercase tracking-widest text-gold-400 whitespace-nowrap">
          {selectedIds.length} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-ink-400 hover:text-foreground"
          aria-label="Clear selection"
        >
          <X size={14} />
        </button>
      </div>

      <div className="h-6 w-px bg-ink-700" />

      <div className="flex items-center gap-1">
        {ACTIONS.map((a) => {
          const isLoading = loading === a.key;
          const isDanger = a.variant === "danger";
          const isPrimary = a.variant === "primary";
          return (
            <button
              key={a.key}
              onClick={() => handleAction(a.key)}
              disabled={loading !== null}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isPrimary
                  ? "bg-gold-500 text-ink-900 hover:bg-gold-400"
                  : isDanger
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-ink-300 hover:bg-ink-800 hover:text-foreground"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : a.icon}
              {a.label}
            </button>
          );
        })}
      </div>

      {error && (
        <span className="text-xs text-red-400 ml-2 whitespace-nowrap">{error}</span>
      )}
    </div>
  );
}

// Hook for managing selection state across list + bulk actions
export function useBulkSelection(items: { id: string }[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0 && selected.size < items.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (prev.size === items.length) return new Set();
      return new Set(items.map((i) => i.id));
    });
  }

  function clear() {
    setSelected(new Set());
  }

  return {
    selected,
    selectedIds: Array.from(selected),
    allSelected,
    someSelected,
    toggle,
    toggleAll,
    clear,
  };
}

// Checkbox component
export function BulkCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
        checked
          ? "bg-gold-500 border-gold-500"
          : indeterminate
          ? "bg-gold-500/50 border-gold-500"
          : "border-ink-600 hover:border-gold-500"
      }`}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <svg className="w-3 h-3 text-ink-900" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {indeterminate && !checked && (
        <span className="w-2 h-0.5 bg-ink-900 rounded-full" />
      )}
    </button>
  );
}