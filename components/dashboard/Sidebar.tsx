"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Zap, Link2, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/automations", label: "Automations", icon: Zap },
  { href: "/dashboard/integrations", label: "Integrations", icon: Link2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-[var(--surface-border)] flex flex-col py-6 px-4 z-10">
      {/* Logo */}
      <div className="px-3 mb-8">
        <span className="text-xl font-bold gradient-text tracking-tight">slide</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? "bg-[var(--brand)]/15 text-white border border-[var(--brand)]/30"
                  : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-3 px-3 py-3 border-t border-[var(--surface-border)] mt-4">
        <UserButton afterSignOutUrl="/" />
        <span className="text-sm text-[var(--text-muted)]">Account</span>
      </div>
    </aside>
  );
}
