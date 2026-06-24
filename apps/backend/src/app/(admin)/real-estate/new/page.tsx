import { ContentForm } from "@/components/admin/content-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">New Project</h1>
        <p className="text-ink-400">Create a new real estate project for The Sanctuary.</p>
      </div>
      <ContentForm type="REAL_ESTATE_PROJECT" mode="create" />
    </div>
  );
}