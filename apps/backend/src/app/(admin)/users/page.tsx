import { prisma } from "@groovethiopia/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { UserActions } from "@/components/admin/user-actions";

export default async function UsersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      approvedAt: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold mb-2">Users</h1>
        <p className="text-ink-400">Manage admin and editor accounts</p>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-800 text-left">
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">User</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Role</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Status</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400">Last Login</th>
              <th className="px-5 py-3 font-mono text-xs uppercase tracking-widest text-ink-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink-800/50 last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium">{u.name || "—"}</p>
                  <p className="text-xs text-ink-400">{u.email}</p>
                </td>
                <td className="px-5 py-3">
                  <span className="font-mono text-xs uppercase text-gold-400">{u.role.toLowerCase()}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`admin-badge-${u.status === "ACTIVE" ? "approved" : u.status === "PENDING_APPROVAL" ? "pending" : "draft"}`}>
                    {u.status.toLowerCase().replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-400 text-xs">{formatDateTime(u.lastLoginAt)}</td>
                <td className="px-5 py-3 text-right">
                  <UserActions userId={u.id} status={u.status} role={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}