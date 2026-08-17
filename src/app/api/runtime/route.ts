import { getDb } from "@/lib/db";
import { parseModelJson } from "@/lib/format";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

export const dynamic = "force-dynamic";

const AUTH_PATH = path.join(os.homedir(), ".local", "share", "opencode", "auth.json");
const MODELS_CACHE = path.join(os.homedir(), ".cache", "opencode", "models.json");
const CONFIG_PATH = path.join(os.homedir(), ".config", "opencode", "opencode.json");

export type RuntimeInfo = {
  providers: Array<{
    id: string;
    configured: boolean;
    type: string | null;
  }>;
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

function readAuth(): Record<string, { type?: string }> {
  try {
    const raw = fs.readFileSync(AUTH_PATH, "utf8");
    return JSON.parse(raw) as Record<string, { type?: string }>;
  } catch {
    return {};
  }
}

function contextLimitFor(
  modelId: string,
  providerId: string
): number | null {
  try {
    const raw = fs.readFileSync(MODELS_CACHE, "utf8");
    const models = JSON.parse(raw) as Record<string, { models?: Record<string, { lim?: { context?: number } }> }>;
    const entry = models[providerId]?.models?.[modelId];
    return entry?.lim?.context ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const auth = readAuth();

  // Zen is keyless — always "configured" by nature. OpenRouter = api key.
  // GitHub Copilot = oauth. Report presence without ever leaking secrets.
  const providers = [
    {
      id: "opencode",
      configured: true,
      type: "keyless",
    },
    {
      id: "openrouter",
      configured: Boolean(auth.openrouter?.type),
      type: auth.openrouter?.type ?? null,
    },
    {
      id: "github-copilot",
      configured: Boolean(auth["github-copilot"]?.type),
      type: auth["github-copilot"]?.type ?? null,
    },
  ];

  // LSP: opencode enables LSPs only when configured. No lsp block anywhere
  // in the config => genuinely disabled, same as the TUI reports.
  let lspConfig: unknown = null;
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    lspConfig = (JSON.parse(raw) as { lsp?: unknown }).lsp ?? null;
  } catch {
    lspConfig = null;
  }
  const lsp = {
    enabled: lspConfig != null,
    note: lspConfig == null ? "No LSP servers configured" : "LSP servers configured",
  };

  // Live session context: the most recently updated session, its latest
  // message's token totals vs the model's context window.
  let session: RuntimeInfo["session"] = null;
  try {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, title, model, cost, tokens_input, tokens_output,
                tokens_reasoning, tokens_cache_read, time_updated
         FROM session ORDER BY time_updated DESC LIMIT 1`
      )
      .all() as Array<Record<string, unknown>>;
    if (rows.length > 0) {
      const row = rows[0];
      const model = parseModelJson(String(row.model ?? ""));
      const modelId = model.modelId;
      const providerId = model.providerId;

      // Latest message in that session = the context actually in flight.
      // Some messages (tool noise) carry zero tokens, so scan back for the
      // most recent one that actually consumed context.
      const msgRows = db
        .prepare(
          `SELECT data FROM message WHERE session_id = ?
           ORDER BY time_created DESC LIMIT 50`
        )
        .all(String(row.id)) as Array<{ data: string }>;
      let ctxTokens = 0;
      for (const m of msgRows) {
        try {
          const d = JSON.parse(m.data) as { tokens?: { total?: number } };
          const total = Number(d.tokens?.total ?? 0);
          if (total > 0) {
            ctxTokens = total;
            break;
          }
        } catch {
          continue;
        }
      }

      const limit = contextLimitFor(modelId, providerId) ?? 200_000;
      const updatedAt = Number(row.time_updated ?? 0);
      session = {
        id: String(row.id),
        title: String(row.title ?? "Untitled session"),
        modelId,
        providerId,
        cost: Number(row.cost ?? 0),
        tokens: {
          input: Number(row.tokens_input ?? 0),
          output: Number(row.tokens_output ?? 0),
          reasoning: Number(row.tokens_reasoning ?? 0),
          cacheRead: Number(row.tokens_cache_read ?? 0),
        },
        context: {
          tokens: ctxTokens,
          limit,
          pct: limit > 0 ? Math.min(100, Math.round((ctxTokens / limit) * 100)) : 0,
        },
        updatedAt,
        active: Date.now() - updatedAt < 5 * 60_000,
      };
    }
  } catch {
    session = null;
  }

  return Response.json({ providers, lsp, session } satisfies RuntimeInfo, {
    headers: { "Cache-Control": "no-store" },
  });
}
