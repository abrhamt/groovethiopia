"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useBulkSelection, BulkCheckbox, BulkActions } from "./bulk-actions";

type SerializedVehicle = {
  id: string;
  title: string;
  slug: string;
  year: number | null;
  make: string | null;
  category: string | null;
  status: string;
  price: string | null;
  currency: string | null;
  imageUrl: string | null;
};

export function VehiclesBulkClient({ items }: { items: SerializedVehicle[] }) {
  const { selected, selectedIds, allSelected, someSelected, toggle, toggleAll, clear } =
    useBulkSelection(items);

  if (items.length === 0) {
    return (
      <div className="admin-card text-center py-16">
        <p className="text-ink-400 mb-4">No vehicles in the collection yet</p>
        <Link href="/vehicles/new" className="admin-button-ghost inline-block">
          Add your first vehicle
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((v) => {
          const isSelected = selected.has(v.id);
          return (
            <div
              key={v.id}
              className={`relative card p-0 overflow-hidden hover:border-gold-500/50 transition-all ${
                isSelected ? "ring-2 ring-gold-500" : ""
              }`}
            >
              <div className="absolute top-3 left-3 z-10">
                <BulkCheckbox
                  checked={isSelected}
                  onChange={() => toggle(v.id)}
                />
              </div>
              <Link href={`/vehicles/${v.id}`}>
                {v.imageUrl && (
                  <img
                    src={v.imageUrl}
                    alt=""
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-5">
                  <p className="label-mono text-ink-400 mb-1">
                    {v.year} · {v.make}
                  </p>
                  <h3 className="font-serif text-2xl mb-2">{v.title}</h3>
                  {v.price && (
                    <p className="text-lg text-gradient-gold font-semibold mb-2">
                      {formatPrice(v.price, v.currency || "USD")}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-400">{v.category?.replace("_", " ").toLowerCase()}</span>
                    <StatusBadge status={v.status} />
                  </div>
                </div>
              </Link>
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
    SOLD: "admin-badge-rejected",
  };
  return <span className={map[status] || "admin-badge-draft"}>{status.toLowerCase().replace("_", " ")}</span>;
}