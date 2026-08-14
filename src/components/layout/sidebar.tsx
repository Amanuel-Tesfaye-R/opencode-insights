"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bot,
  Cpu,
  FileCode2,
  FolderGit2,
  LayoutDashboard,
  ListChecks,
  Menu,
  MessagesSquare,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatTokens, timeAgo } from "@/lib/format";

export type SidebarStats = {
  sessions7d: number;
  tokensToday: number;
  lastActive: number;
};

const NAV = [
  {
    section: "Insights",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
      { href: "/sessions", label: "Sessions", icon: MessagesSquare },
      { href: "/tools", label: "Tool Calls", icon: Wrench },
    ],
  },
  {
    section: "Data",
    items: [
      { href: "/projects", label: "Projects", icon: FolderGit2 },
      { href: "/models", label: "Models", icon: Cpu },
    ],
  },
  {
    section: "Work",
    items: [
      { href: "/todos", label: "Todos", icon: ListChecks },
      { href: "/files", label: "Files", icon: FileCode2 },
      { href: "/agents", label: "Agents", icon: Bot },
    ],
  },
];

export function Sidebar({ stats }: { stats: SidebarStats }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const nav = (
    <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
      {NAV.map((group) => (
        <div key={group.section}>
          <p className="px-3 mb-2 text-[11px] font-semibold text-white/40 uppercase tracking-widest">
            {group.section}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive(item.href) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-accent shadow-[0_0_10px_rgba(0,222,255,0.8)]" />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive(item.href)
                      ? "text-gold drop-shadow-[0_0_6px_rgba(0,222,255,0.6)]"
                      : "text-white/60"
                  )}
                />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <button
        className="fixed top-3 left-3 z-50 lg:hidden rounded-md bg-navy p-2 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed lg:sticky inset-y-0 left-0 z-50 w-64 sidebar-surface flex flex-col transition-transform duration-200",
          "lg:top-0 lg:h-screen",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="OpenCode Usage Tracking logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg shrink-0 object-contain shadow-[0_0_14px_rgba(0,222,255,0.35)]"
          />
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              OpenCode Usage Tracking
            </p>
            <p className="text-[11px] text-white/40 font-mono">local analytics</p>
          </div>
        </div>

        {nav}

        <div className="px-3 pb-4">
          <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 space-y-2">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
              Live
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Sessions 7d</span>
              <span className="font-mono text-accent font-semibold">
                {formatNumber(stats.sessions7d)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Tokens today</span>
              <span className="font-mono text-gold font-semibold">
                {formatTokens(stats.tokensToday)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Last activity</span>
              <span className="font-mono text-white/80">
                {stats.lastActive ? timeAgo(stats.lastActive) : "never"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
