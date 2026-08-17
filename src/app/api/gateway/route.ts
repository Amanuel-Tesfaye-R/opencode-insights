export const dynamic = "force-dynamic";

export type GatewayState = "healthy" | "cracked" | "error";

export type GatewayProbe = {
  state: GatewayState;
  statusCode: number | null;
  message: string;
  checkedAt: number;
  latencyMs: number | null;
};

const ZEN_URL = "https://opencode.ai/zen/v1/chat/completions";
const CACHE_TTL_MS = 20_000;

let cache: { at: number; probe: GatewayProbe } | null = null;

async function probeZen(): Promise<GatewayProbe> {
  const started = Date.now();
  try {
    const res = await fetch(ZEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The free tier flags bare requests without a UA as abuse. Sending a
        // real one makes the probe measure the wall, not its own manners.
        "User-Agent": "opencode/1.0",
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash-free",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 16,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;

    if (res.status === 200) {
      return {
        state: "healthy",
        statusCode: 200,
        message: "Zen free tier is responding. The wall stands.",
        checkedAt: Date.now(),
        latencyMs,
      };
    }

    if (res.status === 429) {
      let message = "Free usage limit reached. The wall is holding traffic.";
      try {
        const body = (await res.json()) as { error?: { message?: string } };
        if (body?.error?.message) message = body.error.message;
      } catch {
        // keep default
      }
      return {
        state: "cracked",
        statusCode: 429,
        message,
        checkedAt: Date.now(),
        latencyMs,
      };
    }

    return {
      state: "error",
      statusCode: res.status,
      message: `Unexpected gateway status ${res.status}.`,
      checkedAt: Date.now(),
      latencyMs,
    };
  } catch {
    return {
      state: "error",
      statusCode: null,
      message: "Could not reach the gateway.",
      checkedAt: Date.now(),
      latencyMs: Date.now() - started,
    };
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  const now = Date.now();
  if (!force && cache && now - cache.at < CACHE_TTL_MS) {
    return Response.json(cache.probe, {
      headers: { "Cache-Control": "no-store" },
    });
  }
  const probe = await probeZen();
  cache = { at: Date.now(), probe };
  return Response.json(probe, {
    headers: { "Cache-Control": "no-store" },
  });
}
