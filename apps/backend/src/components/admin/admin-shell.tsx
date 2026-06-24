"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/admin/notification-bell";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "◆" },
  { href: "/analytics", label: "Analytics", icon: "▤", adminOnly: true },
  { href: "/review", label: "Pending Review", icon: "✓", badge: true },
  { href: "/events", label: "Events", icon: "♪" },
  { href: "/shukshuta", label: "Shukshuta Series", icon: "✦" },
  { href: "/vehicles", label: "Vehicles", icon: "◆" },
  { href: "/real-estate", label: "Real Estate", icon: "▲" },
  { href: "/gallery", label: "Gallery", icon: "▦" },
  { href: "/partners", label: "Partners", icon: "◯" },
  { href: "/pages", label: "Pages", icon: "▤" },
  { href: "/inquiries", label: "Inquiries", icon: "✉" },
  { href: "/users", label: "Users", icon: "◉", adminOnly: true },
  { href: "/media", label: "Media Library", icon: "▣" },
  { href: "/settings", label: "Settings", icon: "⚙", adminOnly: true },
  { href: "/audit", label: "Audit Log", icon: "⌘", adminOnly: true },
];

export function AdminShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: "ADMIN" | "EDITOR" };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const visibleNav = NAV.filter((item) => !item.adminOnly || user.role === "ADMIN");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-ink-800 bg-ink-900/50 backdrop-blur-md flex flex-col transition-all",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-5 border-b border-ink-800 flex items-center justify-between">
          {!collapsed && <Logo />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-ink-400 hover:text-gold-400 transition-colors text-xs"
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
          {visibleNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group relative",
                  active
                    ? "bg-gold-500/10 text-gold-400"
                    : "text-ink-300 hover:bg-ink-800 hover:text-foreground"
                )}
              >
                <span className="text-base font-mono">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
                {item.badge && !collapsed && (
                  <PendingBadge />
                )}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gold-500 rounded-r" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink-800">
          {!collapsed && (
            <div className="mb-3 px-2">
              <p className="text-xs font-medium text-foreground truncate">
                {user.name || user.email}
              </p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gold-400">
                {user.role}
              </p>
            </div>
          )}
          <button
            onClick={() => signOut({ redirect: false }).then(() => router.push("/login"))}
            className="w-full px-3 py-2 text-xs text-ink-300 hover:text-red-400 transition-colors text-left"
          >
            {collapsed ? "↩" : "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-end px-8 py-4 bg-background/80 backdrop-blur-md border-b border-ink-800">
          <NotificationBell />
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

function PendingBadge() {
  // Will fetch count via API; placeholder for now
  return (
    <span className="ml-auto text-[10px] font-mono bg-gold-500 text-ink-900 px-1.5 py-0.5 rounded-full">
      •
    </span>
  );
}