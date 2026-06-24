import { ContentForm } from "@/components/admin/content-form";

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Add Vehicle</h1>
        <p className="text-ink-400">Add a new vehicle to The Collection.</p>
      </div>
      <ContentForm type="VEHICLE" mode="create" />
    </div>
  );
}