"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RuntimeProvider = {
  id: string;
  configured: boolean;
  type: string | null;
};

export type RuntimeInfo = {
  providers: RuntimeProvider[];
  lsp: {
    enabled: boolean;
    note: string;
  };
  session: {
    id: string;
    title: string;
    modelId: string;
    providerId: string;
    cost: number;
    tokens: {
      input: number;
      output: number;
      reasoning: number;
      cacheRead: number;
    };
    context: {
      tokens: number;
      limit: number;
      pct: number;
    };
    updatedAt: number;
    active: boolean;
  } | null;
};

export function useRuntime(pollMs = 10_000) {
  const [info, setInfo] = useState<RuntimeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/runtime", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RuntimeInfo = await res.json();
      if (!mounted.current) return;
      setInfo(data);
      setError(null);
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : "Failed to load runtime info");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [refresh, pollMs]);

  return { info, loading, error, refresh };
}
