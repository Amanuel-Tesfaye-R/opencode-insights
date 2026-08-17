"use client";

import { useEffect, useState } from "react";
import { useGateway } from "@/lib/use-gateway";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATE_META: Record<
  string,
  { label: string; dot: string; ring: string }
> = {
  healthy: { label: "Wall up", dot: "bg-ok", ring: "shadow-[0_0_8px_rgba(34,197,94,0.7)]" },
  cracked: { label: "Wall breached", dot: "bg-err", ring: "shadow-[0_0_8px_rgba(239,68,68,0.8)]" },
  error: { label: "Status unknown", dot: "bg-warn", ring: "shadow-[0_0_8px_rgba(234,179,8,0.7)]" },
};

export function GatewayWidget() {
  const { probe, loading } = useGateway(30_000);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(id);
  }, []);

  const state = probe?.state ?? "error";
  const meta = STATE_META[state];
  const lastChecked = probe ? timeAgo(probe.checkedAt) : "never";

  return (
    <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
          Gateway Wall
        </p>
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0 animate-pulse",
            meta.dot,
            meta.ring
          )}
          title={`checked ${lastChecked}`}
        />
      </div>
      <p
        className={cn(
          "text-xs font-semibold",
          state === "healthy"
            ? "text-emerald-400"
            : state === "cracked"
              ? "text-red-400"
              : "text-yellow-300"
        )}
      >
        {loading ? "Checking..." : meta.label}
      </p>
      <p className="text-[11px] leading-relaxed text-white/50">
        {probe?.message ??
          "Probing the Zen free tier to see if the wall is standing."}
      </p>
      <div className="flex items-center justify-between text-[10px] text-white/40">
        <span className="font-mono">
          {probe ? `HTTP ${probe.statusCode ?? "n/a"}` : "no probe yet"}
        </span>
        <span className="font-mono">checked {lastChecked}</span>
      </div>
    </div>
  );
}
