"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GatewayState = "healthy" | "cracked" | "error";

export type GatewayProbe = {
  state: GatewayState;
  statusCode: number | null;
  message: string;
  checkedAt: number;
  latencyMs: number | null;
};

export type GatewayCheck = GatewayProbe & { at: number };

const MAX_HISTORY = 240;
const HISTORY_KEY = "gateway-wall-history-v1";

function loadHistory(): GatewayCheck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GatewayCheck[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => c && typeof c.at === "number");
  } catch {
    return [];
  }
}

export function useGateway(pollMs = 30_000) {
  const [probe, setProbe] = useState<GatewayProbe | null>(null);
  const [history, setHistory] = useState<GatewayCheck[]>(() => loadHistory());
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const persist = useCallback((next: GatewayCheck[]) => {
    setHistory(next);
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(-MAX_HISTORY)));
    } catch {
      // storage full or unavailable — history stays in memory
    }
  }, []);

  const check = useCallback(
    async (opts?: { force?: boolean }) => {
      try {
        const qs = opts?.force ? "?force=1" : "";
        const res = await fetch(`/api/gateway${qs}`, { cache: "no-store" });
        const data: GatewayProbe = await res.json();
        if (!mounted.current) return;
        setProbe(data);
        persist([...historyRef.current, { ...data, at: Date.now() }]);
      } catch {
        if (!mounted.current) return;
        const data: GatewayProbe = {
          state: "error",
          statusCode: null,
          message: "Dashboard could not reach the probe route.",
          checkedAt: Date.now(),
          latencyMs: null,
        };
        setProbe(data);
      } finally {
        if (mounted.current) setLoading(false);
      }
    },
    [persist]
  );

  // Keep a ref of latest history so the interval closure never goes stale.
  const historyRef = useRef<GatewayCheck[]>([]);
  historyRef.current = history;

  useEffect(() => {
    mounted.current = true;
    check();
    const id = setInterval(() => check(), pollMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [check, pollMs]);

  return { probe, history, loading, check };
}
