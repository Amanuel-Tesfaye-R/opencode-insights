const intlNumber = new Intl.NumberFormat("en-US");

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return intlNumber.format(Math.round(n));
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs < 1000) return String(Math.round(n));
  if (abs < 1_000_000) {
    const v = n / 1000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1)}K`;
  }
  const v = n / 1_000_000;
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)}M`;
}

export function formatTokens(n: number): string {
  return formatCompact(n);
}

export function formatCost(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const restS = s % 60;
  if (m < 60) return `${m}m ${restS}s`;
  const h = Math.floor(m / 60);
  const restM = m % 60;
  if (h < 24) return `${h}h ${restM}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

const intlDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const intlDateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const intlTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const intlDay = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function formatDate(ts: number): string {
  return intlDate.format(ts);
}

export function formatDateTime(ts: number): string {
  return intlDateTime.format(ts);
}

export function formatTime(ts: number): string {
  return intlTime.format(ts);
}

export function formatDay(ts: number): string {
  return intlDay.format(ts);
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function shortPreview(text: string | null | undefined, max = 180): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}...`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return intlDate.format(ts);
}

export function basename(p: string): string {
  const norm = p.replace(/\\/g, "/").replace(/\/+$/, "");
  const parts = norm.split("/");
  return parts[parts.length - 1] || norm;
}

export function parseModelJson(raw: string | null | undefined): {
  modelId: string;
  providerId: string;
} {
  if (!raw) return { modelId: "unknown", providerId: "unknown" };
  try {
    const parsed = JSON.parse(raw);
    return {
      modelId: parsed.id ?? parsed.modelID ?? "unknown",
      providerId: parsed.providerID ?? parsed.provider ?? "unknown",
    };
  } catch {
    return { modelId: raw, providerId: "unknown" };
  }
}
