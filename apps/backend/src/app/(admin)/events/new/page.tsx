import { ContentForm } from "@/components/admin/content-form";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">New Event</h1>
        <p className="text-ink-400">Create a new event. Will auto-translate to all languages.</p>
      </div>
      <ContentForm type="EVENT" mode="create" />
    </div>
  );
}