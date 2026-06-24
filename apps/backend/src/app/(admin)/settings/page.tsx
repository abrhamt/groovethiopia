import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const settings = await prisma.setting.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Settings</h1>
        <p className="text-ink-400">Site-wide configuration</p>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-800 text-left">
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Key</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Value</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr key={s.id} className="border-b border-ink-800/50 last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-gold-400">{s.key}</td>
                <td className="px-5 py-3 text-ink-300">
                  <code className="text-xs">{JSON.stringify(s.value)}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}