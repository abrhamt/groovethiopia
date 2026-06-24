"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useBulkSelection, BulkCheckbox, BulkActions } from "./bulk-actions";

type SerializedEvent = {
  id: string;
  title: string;
  slug: string;
  locale: string;
  status: string;
  startsAt: string | null;
  venue: string | null;
  imageUrl: string | null;
  type: string;
};

export function EventsBulkClient({ items }: { items: SerializedEvent[] }) {
  const { selected, selectedIds, allSelected, someSelected, toggle, toggleAll, clear } =
    useBulkSelection(items);

  if (items.length === 0) {
    return (
      <div className="admin-card text-center py-16">
        <p className="text-ink-400 mb-4">No events yet</p>
        <Link href="/events/new" className="admin-button-ghost inline-block">
          Create your first event
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="admin-card p-0 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-ink-800 text-xs font-mono uppercase tracking-widest text-ink-400">
          <div className="col-span-1">
            <BulkCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleAll}
            />
          </div>
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Venue</div>
          <div className="col-span-1">Locale</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {/* Rows */}
        {items.map((event) => {
          const isSelected = selected.has(event.id);
          return (
            <div
              key={event.id}
              className={`grid grid-cols-12 gap-4 px-5 py-3 border-b border-ink-800/50 last:border-0 items-center hover:bg-ink-800/20 transition-colors ${
                isSelected ? "bg-gold-500/5" : ""
              }`}
            >
              <div className="col-span-1">
                <BulkCheckbox
                  checked={isSelected}
                  onChange={() => toggle(event.id)}
                />
              </div>
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="w-12 h-12 object-cover rounded shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <Link
                    href={`/events/${event.id}`}
                    className="font-medium hover:text-gold-400 truncate block"
                  >
                    {event.title}
                  </Link>
                  <p className="text-xs text-ink-500 truncate">
                    {event.type === "SHUKSHUTA_EVENT" ? "Shukshuta" : event.type.toLowerCase()}
                  </p>
                </div>
              </div>
              <div className="col-span-2 text-sm">
                {event.startsAt ? formatDate(new Date(event.startsAt)) : "—"}
              </div>
              <div className="col-span-2 text-sm text-ink-300 truncate">
                {event.venue || "—"}
              </div>
              <div className="col-span-1 text-xs text-ink-400">
                {event.locale}
              </div>
              <div className="col-span-1 text-right">
                <StatusBadge status={event.status} />
              </div>
            </div>
          );
        })}
      </div>

      <BulkActions selectedIds={selectedIds} onClearSelection={clear} />
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "admin-badge-draft",
    PENDING_REVIEW: "admin-badge-pending",
    APPROVED: "admin-badge-approved",
    PUBLISHED: "admin-badge-published",
    REJECTED: "admin-badge-rejected",
    ARCHIVED: "admin-badge-draft",
    ENDED: "admin-badge-draft",
  };
  return <span className={map[status] || "admin-badge-draft"}>{status.toLowerCase().replace("_", " ")}</span>;
}