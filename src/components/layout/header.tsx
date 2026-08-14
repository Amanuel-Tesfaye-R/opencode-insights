"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Loader2, Moon, RefreshCw, Sun } from "lucide-react";
import { useState } from "react";

export function Header() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur h-14 flex items-center justify-between gap-2 px-4 pl-14 lg:px-6 lg:pl-6">
      <div className="flex items-center gap-2.5 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.png"
          alt="OpenCode Insights logo"
          width={28}
          height={28}
          className="h-7 w-7 rounded-md object-contain"
        />
        <span className="text-sm font-semibold tracking-tight">
          Mesob AI Stats
        </span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 h-9 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
}
