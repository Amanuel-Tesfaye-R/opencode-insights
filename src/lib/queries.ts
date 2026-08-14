import { getDb } from "./db";
import {
  basename,
  dayKey,
  parseModelJson,
} from "./format";
import type {
  DailyPoint,
  HourPoint,
  MessagePart,
  ModelBreakdown,
  OverviewStats,
  ProjectBreakdown,
  SessionMessage,
  SessionSummary,
  ToolBreakdown,
  ToolCall,
} from "./types";

type Row = Record<string, unknown>;

function toSession(row: Row): SessionSummary {
  const model = parseModelJson(row.model as string | null | undefined);
  const created = Number(row.time_created ?? 0);
  const updated = Number(row.time_updated ?? created);
  return {
    id: String(row.id),
    title: String(row.title ?? "Untitled session"),
    directory: String(row.directory ?? ""),
    directoryName: basename(String(row.directory ?? "")),
    projectId: String(row.project_id ?? ""),
    projectName: String(row.project_name ?? ""),
    agent: String(row.agent ?? "build"),
    modelId: model.modelId,
    providerId: model.providerId,
    cost: Number(row.cost ?? 0),
    tokensInput: Number(row.tokens_input ?? 0),
    tokensOutput: Number(row.tokens_output ?? 0),
    tokensReasoning: Number(row.tokens_reasoning ?? 0),
    tokensCacheRead: Number(row.tokens_cache_read ?? 0),
    tokensCacheWrite: Number(row.tokens_cache_write ?? 0),
    additions: Number(row.summary_additions ?? 0),
    deletions: Number(row.summary_deletions ?? 0),
    filesChanged: Number(row.summary_files ?? 0),
    messageCount: Number(row.message_count ?? 0),
    toolCount: Number(row.tool_count ?? 0),
    createdAt: created,
    updatedAt: updated,
    archivedAt: row.time_archived ? Number(row.time_archived) : null,
    durationMs: Math.max(0, updated - created),
  };
}

const SESSION_SELECT = `
  SELECT
    s.id, s.title, s.directory, s.project_id, s.agent, s.model, s.cost,
    s.tokens_input, s.tokens_output, s.tokens_reasoning,
    s.tokens_cache_read, s.tokens_cache_write,
    s.summary_additions, s.summary_deletions, s.summary_files,
    s.time_created, s.time_updated, s.time_archived,
    p.name AS project_name,
    (SELECT COUNT(*) FROM message m WHERE m.session_id = s.id) AS message_count,
    (SELECT COUNT(*) FROM part pt WHERE pt.session_id = s.id
      AND json_extract(pt.data, '$.type') = 'tool') AS tool_count
  FROM session s
  LEFT JOIN project p ON p.id = s.project_id
`;

export function cutoffForDays(days: number | null | undefined): number | null {
  if (days && days > 0) return Date.now() - days * 86400000;
  return null;
}

export function getRecentSessions(
  limit = 8,
  days: number | null = null
): SessionSummary[] {
  const db = getDb();
  const cutoff = cutoffForDays(days);
  if (cutoff !== null) {
    const rows = db
      .prepare(
        `${SESSION_SELECT} WHERE s.time_created >= ? ORDER BY s.time_created DESC LIMIT ?`
      )
      .all(cutoff, limit) as Row[];
    return rows.map(toSession);
  }
  const rows = db
    .prepare(`${SESSION_SELECT} ORDER BY s.time_created DESC LIMIT ?`)
    .all(limit) as Row[];
  return rows.map(toSession);
}

export function getAllSessions(days: number | null = null): SessionSummary[] {
  const db = getDb();
  const cutoff = cutoffForDays(days);
  if (cutoff !== null) {
    const rows = db
      .prepare(`${SESSION_SELECT} WHERE s.time_created >= ? ORDER BY s.time_created DESC`)
      .all(cutoff) as Row[];
    return rows.map(toSession);
  }
  const rows = db
    .prepare(`${SESSION_SELECT} ORDER BY s.time_created DESC`)
    .all() as Row[];
  return rows.map(toSession);
}

export function getTopSessions(
  limit = 8,
  days: number | null = null
): SessionSummary[] {
  const db = getDb();
  const cutoff = cutoffForDays(days);
  const sql = `${SESSION_SELECT} ${
    cutoff !== null ? "WHERE s.time_created >= ?" : ""
  } ORDER BY (s.tokens_input + s.tokens_output) DESC LIMIT ?`;
  const rows = (
    cutoff !== null
      ? db.prepare(sql).all(cutoff, limit)
      : db.prepare(sql).all(limit)
  ) as Row[];
  return rows.map(toSession);
}

export function getSessionById(id: string): SessionSummary | null {
  const db = getDb();
  const row = db
    .prepare(`${SESSION_SELECT} WHERE s.id = ?`)
    .get(id) as Row | undefined;
  return row ? toSession(row) : null;
}

export function getOverviewStats(days: number | null = null): OverviewStats {
  const db = getDb();
  const sessions = getAllSessions(days);
  const cutoff = cutoffForDays(days);

  const totalTokens = (
    key:
      | "tokensInput"
      | "tokensOutput"
      | "tokensReasoning"
      | "tokensCacheRead"
      | "tokensCacheWrite"
      | "cost"
  ) => sessions.reduce((acc, s) => acc + s[key], 0);

  const tokensPerSession = sessions.map(
    (s) =>
      s.tokensInput +
      s.tokensOutput +
      s.tokensReasoning +
      s.tokensCacheRead
  );
  tokensPerSession.sort((a, b) => a - b);
  const mid = Math.floor(tokensPerSession.length / 2);
  const median =
    tokensPerSession.length === 0
      ? 0
      : tokensPerSession.length % 2
        ? tokensPerSession[mid]
        : (tokensPerSession[mid - 1] + tokensPerSession[mid]) / 2;

  const dayRows = db
    .prepare(
      `SELECT COUNT(DISTINCT substr(date(time_created / 1000, 'unixepoch'), 1, 10)) AS days,
              MIN(time_created) AS min_ts, MAX(time_created) AS max_ts FROM session`
    )
    .get() as Row;
  const minTs = Number(dayRows.min_ts ?? Date.now());
  const maxTs = Number(dayRows.max_ts ?? minTs);
  const spanDays = Math.max(1, Math.round((maxTs - minTs) / 86400000) + 1);
  const daysActive = sessions.length
    ? new Set(sessions.map((s) => dayKey(s.createdAt))).size
    : 0;

  const timeFilter = cutoff !== null ? "time_created >= ?" : "1=1";
  const tp = cutoff !== null ? [cutoff] : [];

  const msgCounts = db
    .prepare(
      `SELECT
        SUM(CASE WHEN json_extract(data, '$.role') = 'user' THEN 1 ELSE 0 END) AS users,
        SUM(CASE WHEN json_extract(data, '$.role') = 'assistant' THEN 1 ELSE 0 END) AS assistants
       FROM message WHERE ${timeFilter}`
    )
    .get(...tp) as Row;

  const patchRow = db
    .prepare(
      `SELECT
        COUNT(*) AS patches,
        COALESCE(SUM(json_array_length(json_extract(data, '$.files'))), 0) AS files
       FROM part WHERE json_extract(data, '$.type') = 'patch' AND ${timeFilter}`
    )
    .get(...tp) as Row;

  const toolRow = db
    .prepare(
      `SELECT
        COUNT(*) AS calls,
        SUM(CASE WHEN json_extract(data, '$.state.status') = 'error' THEN 1 ELSE 0 END) AS errors
       FROM part WHERE json_extract(data, '$.type') = 'tool' AND ${timeFilter}`
    )
    .get(...tp) as Row;

  const todoRow = db
    .prepare(
      `SELECT COUNT(*) AS total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM todo WHERE ${timeFilter}`
    )
    .get(...tp) as Row;

  return {
    sessions: sessions.length,
    messages: Number(
      (
        db
          .prepare(`SELECT COUNT(*) AS n FROM message WHERE ${timeFilter}`)
          .get(...tp) as Row
      ).n
    ),
    parts: Number(
      (
        db
          .prepare(`SELECT COUNT(*) AS n FROM part WHERE ${timeFilter}`)
          .get(...tp) as Row
      ).n
    ),
    daysActive,
    spanDays,
    tokensInput: totalTokens("tokensInput"),
    tokensOutput: totalTokens("tokensOutput"),
    tokensReasoning: totalTokens("tokensReasoning"),
    tokensCacheRead: totalTokens("tokensCacheRead"),
    tokensCacheWrite: totalTokens("tokensCacheWrite"),
    cost: totalTokens("cost"),
    avgTokensPerSession:
      sessions.length > 0
        ? (totalTokens("tokensInput") +
            totalTokens("tokensOutput") +
            totalTokens("tokensReasoning") +
            totalTokens("tokensCacheRead")) /
          sessions.length
        : 0,
    medianTokensPerSession: median,
    userMessages: Number(msgCounts.users ?? 0),
    assistantMessages: Number(msgCounts.assistants ?? 0),
    patches: Number(patchRow.patches ?? 0),
    filesTouched: Number(patchRow.files ?? 0),
    todosTotal: Number(todoRow.total ?? 0),
    todosCompleted: Number(todoRow.completed ?? 0),
    toolCalls: Number(toolRow.calls ?? 0),
    toolErrors: Number(toolRow.errors ?? 0),
  };
}

export function getDailyActivity(days: number | null): DailyPoint[] {
  const db = getDb();
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const minRow = db
    .prepare("SELECT MIN(time_created) AS m FROM session")
    .get() as Row;
  const start = new Date(Number(minRow.m ?? end.getTime()));
  start.setHours(0, 0, 0, 0);
  const totalDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  );
  const range = days && days > 0 && days < totalDays ? days : totalDays;
  const from = end.getTime() - (range - 1) * 86400000;

  const map = new Map<string, DailyPoint>();
  for (let i = 0; i < range; i++) {
    const t = from + i * 86400000;
    const d = new Date(t);
    const key = dayKey(t);
    map.set(key, {
      date: key,
      label: `${MONTHS[d.getMonth()]} ${d.getDate()}`,
      sessions: 0,
      messages: 0,
      tokensInput: 0,
      tokensOutput: 0,
      tokensReasoning: 0,
      tokensCacheRead: 0,
      tokensTotal: 0,
    });
  }

  const sessionRows = db
    .prepare(
      "SELECT time_created, tokens_input, tokens_output, tokens_reasoning, tokens_cache_read FROM session"
    )
    .all() as Row[];
  for (const r of sessionRows) {
    const p = map.get(dayKey(Number(r.time_created)));
    if (p) {
      p.sessions += 1;
      p.tokensInput += Number(r.tokens_input ?? 0);
      p.tokensOutput += Number(r.tokens_output ?? 0);
      p.tokensReasoning += Number(r.tokens_reasoning ?? 0);
      p.tokensCacheRead += Number(r.tokens_cache_read ?? 0);
    }
  }

  const msgRows = db
    .prepare("SELECT time_created FROM message")
    .all() as Row[];
  for (const r of msgRows) {
    const p = map.get(dayKey(Number(r.time_created)));
    if (p) p.messages += 1;
  }

  const out: DailyPoint[] = [];
  for (const p of map.values()) {
    p.tokensTotal = p.tokensInput + p.tokensOutput;
    out.push(p);
  }
  return out;
}

export function getHourlyActivity(days: number | null = null): HourPoint[] {
  const db = getDb();
  const cutoff = cutoffForDays(days);
  const sql = cutoff !== null
    ? `SELECT CAST(strftime('%H', time_created / 1000, 'unixepoch', 'localtime') AS INTEGER) AS h, COUNT(*) AS c
       FROM message WHERE time_created >= ? GROUP BY h`
    : `SELECT CAST(strftime('%H', time_created / 1000, 'unixepoch', 'localtime') AS INTEGER) AS h, COUNT(*) AS c
       FROM message GROUP BY h`;
  const rows = (cutoff !== null ? db.prepare(sql).all(cutoff) : db.prepare(sql).all()) as Row[];

  const buckets = new Map<number, number>();
  for (const r of rows) buckets.set(Number(r.h), Number(r.c));

  const out: HourPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const ampm = h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;
    out.push({
      hour: h,
      label: ampm,
      count: buckets.get(h) ?? 0,
    });
  }
  return out;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function getModelBreakdown(days: number | null = null): ModelBreakdown[] {
  const db = getDb();
  const cutoff = cutoffForDays(days);
  const sql = cutoff !== null
    ? `SELECT model, COUNT(*) AS sessions,
        SUM(tokens_input) AS ti, SUM(tokens_output) AS to_,
        SUM(tokens_reasoning) AS tr, SUM(tokens_cache_read) AS tcr,
        SUM(cost) AS cost, MAX(time_updated) AS last_active
       FROM session WHERE time_created >= ? GROUP BY model ORDER BY sessions DESC`
    : `SELECT model, COUNT(*) AS sessions,
        SUM(tokens_input) AS ti, SUM(tokens_output) AS to_,
        SUM(tokens_reasoning) AS tr, SUM(tokens_cache_read) AS tcr,
        SUM(cost) AS cost, MAX(time_updated) AS last_active
       FROM session GROUP BY model ORDER BY sessions DESC`;
  const rows = (cutoff !== null ? db.prepare(sql).all(cutoff) : db.prepare(sql).all()) as Row[];
  return rows.map((r) => {
    const m = parseModelJson(r.model as string | null | undefined);
    return {
      modelId: m.modelId,
      providerId: m.providerId,
      sessions: Number(r.sessions ?? 0),
      messages: 0,
      tokensInput: Number(r.ti ?? 0),
      tokensOutput: Number(r.to_ ?? 0),
      tokensReasoning: Number(r.tr ?? 0),
      tokensCacheRead: Number(r.tcr ?? 0),
      cost: Number(r.cost ?? 0),
      lastActive: Number(r.last_active ?? 0),
    };
  });
}

export function getProjectBreakdown(days: number | null = null): ProjectBreakdown[] {
  const db = getDb();
  const cutoff = cutoffForDays(days);
  const base = `SELECT
        s.project_id AS project_id, p.name AS project_name, p.worktree AS worktree,
        MIN(s.directory) AS directory,
        COUNT(*) AS sessions,
        SUM(s.tokens_input) AS ti, SUM(s.tokens_output) AS to_,
        SUM(s.tokens_cache_read) AS tcr, SUM(s.cost) AS cost,
        SUM(s.summary_additions) AS adds, SUM(s.summary_deletions) AS dels,
        SUM(s.summary_files) AS files,
        MAX(s.time_updated) AS last_active,
        (SELECT COUNT(*) FROM message m WHERE m.session_id IN
          (SELECT id FROM session s2 WHERE s2.project_id = s.project_id${
            cutoff !== null ? " AND s2.time_created >= ?" : ""
          })) AS messages
       FROM session s
       LEFT JOIN project p ON p.id = s.project_id
       ${cutoff !== null ? "WHERE s.time_created >= ?" : ""}
       GROUP BY s.project_id ORDER BY sessions DESC`;
  const rows = (
    cutoff !== null
      ? db.prepare(base).all(cutoff, cutoff)
      : db.prepare(base).all()
  ) as Row[];
  return rows.map((r) => ({
    projectId: String(r.project_id ?? "unknown"),
    projectName: String(r.project_name ?? ""),
    worktree: String(r.worktree ?? ""),
    directory: String(r.directory ?? ""),
    sessions: Number(r.sessions ?? 0),
    messages: Number(r.messages ?? 0),
    tokensInput: Number(r.ti ?? 0),
    tokensOutput: Number(r.to_ ?? 0),
    tokensCacheRead: Number(r.tcr ?? 0),
    cost: Number(r.cost ?? 0),
    additions: Number(r.adds ?? 0),
    deletions: Number(r.dels ?? 0),
    filesChanged: Number(r.files ?? 0),
    lastActive: Number(r.last_active ?? 0),
  }));
}

export function getToolBreakdown(days: number | null = null): ToolBreakdown[] {
  const db = getDb();
  const cutoff = cutoffForDays(days);
  const sql = cutoff !== null
    ? `SELECT
        json_extract(data, '$.tool') AS tool,
        COUNT(*) AS calls,
        SUM(CASE WHEN json_extract(data, '$.state.status') = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN json_extract(data, '$.state.status') = 'error' THEN 1 ELSE 0 END) AS error
       FROM part
       WHERE json_extract(data, '$.type') = 'tool' AND time_created >= ?
       GROUP BY tool ORDER BY calls DESC`
    : `SELECT
        json_extract(data, '$.tool') AS tool,
        COUNT(*) AS calls,
        SUM(CASE WHEN json_extract(data, '$.state.status') = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN json_extract(data, '$.state.status') = 'error' THEN 1 ELSE 0 END) AS error
       FROM part
       WHERE json_extract(data, '$.type') = 'tool'
       GROUP BY tool ORDER BY calls DESC`;
  const rows = (cutoff !== null ? db.prepare(sql).all(cutoff) : db.prepare(sql).all()) as Row[];
  return rows.map((r) => {
    const calls = Number(r.calls ?? 0);
    const completed = Number(r.completed ?? 0);
    const error = Number(r.error ?? 0);
    return {
      tool: String(r.tool ?? "unknown"),
      calls,
      completed,
      error,
      pending: Math.max(0, calls - completed - error),
    };
  });
}

export function getDistinctTools(): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT DISTINCT json_extract(data, '$.tool') AS tool
       FROM part WHERE json_extract(data, '$.type') = 'tool'
       ORDER BY tool`
    )
    .all() as Row[];
  return rows.map((r) => String(r.tool ?? "unknown"));
}

export function getToolCalls(opts: {
  tool?: string;
  status?: string;
  page: number;
  pageSize: number;
}): { calls: ToolCall[]; total: number } {
  const db = getDb();
  const where: string[] = ["json_extract(data, '$.type') = 'tool'"];
  const params: Array<string | number> = [];
  if (opts.tool && opts.tool !== "all") {
    where.push("json_extract(data, '$.tool') = ?");
    params.push(opts.tool);
  }
  if (opts.status && opts.status !== "all") {
    where.push("json_extract(data, '$.state.status') = ?");
    params.push(opts.status);
  }
  const whereSql = where.join(" AND ");

  const total = Number(
    (
      db
        .prepare(`SELECT COUNT(*) AS n FROM part WHERE ${whereSql}`)
        .get(...params) as Row
    ).n ?? 0
  );

  const rows = db
    .prepare(
      `SELECT id, message_id, session_id, time_created, data
       FROM part WHERE ${whereSql}
       ORDER BY time_created DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, opts.pageSize, (opts.page - 1) * opts.pageSize) as Row[];

  const sessionTitles = new Map<string, string>();
  for (const s of getRecentSessions(500)) sessionTitles.set(s.id, s.title);

  const calls: ToolCall[] = rows.map((r) => {
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(String(r.data)) as Record<string, unknown>;
    } catch {
      data = {};
    }
    const state = (data.state ?? {}) as Record<string, unknown>;
    const sessionId = String(r.session_id ?? "");
    return {
      id: String(r.id ?? ""),
      sessionId,
      sessionTitle: sessionTitles.get(sessionId) ?? "Unknown session",
      messageId: String(r.message_id ?? ""),
      tool: String(data.tool ?? "unknown"),
      status: String(state.status ?? "unknown"),
      timeCreated: Number(r.time_created ?? 0),
      inputPreview: previewInput(data.tool as string, state.input),
      outputPreview: previewOutput(state.output),
    };
  });

  return { calls, total };
}

function previewInput(tool: string, input: unknown): string {
  if (input == null) return "";
  if (typeof input === "string") return input.slice(0, 300);
  const obj = input as Record<string, unknown>;
  const candidates: string[] = [];
  for (const key of ["command", "filePath", "pattern", "query", "prompt", "url", "content"]) {
    if (typeof obj[key] === "string" && obj[key]) candidates.push(String(obj[key]));
  }
  if (candidates.length > 0) return candidates.join(" | ").slice(0, 300);
  try {
    return JSON.stringify(input).slice(0, 300);
  } catch {
    return String(input).slice(0, 300);
  }
}

function previewOutput(output: unknown): string {
  if (output == null) return "";
  if (typeof output === "string") return output.slice(0, 300);
  try {
    return JSON.stringify(output).slice(0, 300);
  } catch {
    return String(output).slice(0, 300);
  }
}

export function getSessionMessages(sessionId: string): SessionMessage[] {
  const db = getDb();
  const msgRows = db
    .prepare(
      "SELECT id, time_created, time_updated, data FROM message WHERE session_id = ? ORDER BY time_created ASC"
    )
    .all(sessionId) as Row[];
  const partRows = db
    .prepare(
      "SELECT id, message_id, time_created, data FROM part WHERE session_id = ? ORDER BY time_created ASC"
    )
    .all(sessionId) as Row[];

  const partsByMessage = new Map<string, MessagePart[]>();
  for (const r of partRows) {
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(String(r.data)) as Record<string, unknown>;
    } catch {
      data = {};
    }
    const part: MessagePart = {
      id: String(r.id ?? ""),
      type: String(data.type ?? "unknown"),
      timeCreated: Number(r.time_created ?? 0),
      text: typeof data.text === "string" ? data.text : undefined,
      tool: typeof data.tool === "string" ? data.tool : undefined,
      toolStatus: (data.state as Record<string, unknown> | undefined)?.status as
        | string
        | undefined,
      toolInput: data.type === "tool" ? previewInput(String(data.tool ?? ""), (data.state as Record<string, unknown>)?.input) : undefined,
      toolOutput: data.type === "tool" ? previewOutput((data.state as Record<string, unknown>)?.output) : undefined,
      files: Array.isArray(data.files) ? (data.files as string[]) : undefined,
      truncatable:
        data.type === "text" || data.type === "reasoning" || data.type === "tool",
    };
    const key = String(r.message_id ?? "");
    if (!partsByMessage.has(key)) partsByMessage.set(key, []);
    partsByMessage.get(key)!.push(part);
  }

  const messages: SessionMessage[] = [];
  for (const r of msgRows) {
    let data: Record<string, unknown> = {};
    try {
      data = JSON.parse(String(r.data)) as Record<string, unknown>;
    } catch {
      data = {};
    }
    const tokens = (data.tokens ?? {}) as Record<string, unknown>;
    const model = (data.model ?? {}) as Record<string, unknown>;
    const time = (data.time ?? {}) as Record<string, unknown>;
    messages.push({
      id: String(r.id ?? ""),
      sessionId,
      role: String(data.role ?? "unknown"),
      agent: String(data.agent ?? "build"),
      modelId: String(model.modelID ?? model.id ?? "unknown"),
      cost: Number(data.cost ?? 0),
      tokensTotal: Number(tokens.total ?? 0),
      tokensInput: Number(tokens.input ?? 0),
      tokensOutput: Number(tokens.output ?? 0),
      tokensReasoning: Number(tokens.reasoning ?? 0),
      finish: String(data.finish ?? ""),
      timeCreated: Number(time.created ?? r.time_created ?? 0),
      timeCompleted: Number(time.completed ?? r.time_updated ?? r.time_created ?? 0),
      parts: partsByMessage.get(String(r.id)) ?? [],
    });
  }
  return messages;
}

export function getSessionTodos(sessionId: string): Array<{
  content: string;
  status: string;
  priority: string;
}> {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT content, status, priority FROM todo WHERE session_id = ? ORDER BY position"
    )
    .all(sessionId) as Row[];
  return rows.map((r) => ({
    content: String(r.content ?? ""),
    status: String(r.status ?? "unknown"),
    priority: String(r.priority ?? "unknown"),
  }));
}

export function getSidebarStats(): {
  sessions7d: number;
  tokensToday: number;
  lastActive: number;
} {
  const db = getDb();
  const weekAgo = Date.now() - 7 * 86400000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const row = db
    .prepare(
      `SELECT
        SUM(CASE WHEN time_created >= ? THEN 1 ELSE 0 END) AS s7,
        SUM(CASE WHEN time_created >= ? THEN
          tokens_input + tokens_output + tokens_reasoning + tokens_cache_read
        ELSE 0 END) AS today,
        MAX(time_updated) AS last_active
       FROM session`
    )
    .get(weekAgo, startOfToday.getTime()) as Row;

  return {
    sessions7d: Number(row.s7 ?? 0),
    tokensToday: Number(row.today ?? 0),
    lastActive: Number(row.last_active ?? 0),
  };
}

export type TodoRow = {
  sessionId: string;
  sessionTitle: string;
  content: string;
  status: string;
  priority: string;
  position: number;
  timeCreated: number;
  timeUpdated: number;
};

export function getTodos(): TodoRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT t.session_id, t.content, t.status, t.priority, t.position,
              t.time_created, t.time_updated,
              s.title AS session_title
       FROM todo t
       LEFT JOIN session s ON s.id = t.session_id
       ORDER BY t.time_updated DESC`
    )
    .all() as Row[];
  return rows.map((r) => ({
    sessionId: String(r.session_id ?? ""),
    sessionTitle: String(r.session_title ?? "Untitled session"),
    content: String(r.content ?? ""),
    status: String(r.status ?? "unknown"),
    priority: String(r.priority ?? "unknown"),
    position: Number(r.position ?? 0),
    timeCreated: Number(r.time_created ?? 0),
    timeUpdated: Number(r.time_updated ?? 0),
  }));
}

export function getFileBreakdown(limit = 30): Array<{
  path: string;
  edits: number;
  projectId: string;
  projectName: string;
}> {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT json_extract(data, '$.files') AS files, session_id
       FROM part
       WHERE json_extract(data, '$.type') = 'patch'`
    )
    .all() as Row[];

  // One query for all session -> project mappings.
  const sessionIds = [...new Set(rows.map((r) => String(r.session_id ?? "")))];
  const projectOf = new Map<string, string>();
  if (sessionIds.length > 0) {
    const ph = sessionIds.map(() => "?").join(",");
    const projRows = db
      .prepare(`SELECT id, project_id FROM session WHERE id IN (${ph})`)
      .all(...sessionIds) as Row[];
    for (const r of projRows) {
      projectOf.set(String(r.id), String(r.project_id ?? ""));
    }
  }

  const projectNames = new Map<string, string>();
  const nameRows = db
    .prepare(
      `SELECT s.project_id, MIN(s.directory) AS directory, p.name AS project_name, p.worktree AS worktree
       FROM session s LEFT JOIN project p ON p.id = s.project_id
       GROUP BY s.project_id`
    )
    .all() as Row[];
  for (const r of nameRows) {
    const worktree = r.worktree && r.worktree !== "/" ? String(r.worktree) : "";
    projectNames.set(
      String(r.project_id ?? ""),
      String(r.project_name ?? "") ||
        (worktree ? basename(worktree) : r.directory ? basename(String(r.directory)) : "Global")
    );
  }

  const counts = new Map<string, { edits: number; projectId: string }>();
  for (const r of rows) {
    const sessionId = String(r.session_id ?? "");
    const raw = r.files;
    if (typeof raw !== "string") continue;
    let files: string[];
    try {
      files = JSON.parse(raw) as string[];
    } catch {
      continue;
    }
    const pid = projectOf.get(sessionId) ?? "unknown";
    for (const f of files) {
      const cur = counts.get(f);
      if (cur) {
        cur.edits += 1;
      } else {
        counts.set(f, { edits: 1, projectId: pid });
      }
    }
  }
  return [...counts.entries()]
    .map(([path, { edits, projectId }]) => ({
      path,
      edits,
      projectId,
      projectName: projectNames.get(projectId) ?? projectId,
    }))
    .sort((a, b) => b.edits - a.edits)
    .slice(0, limit);
}

export function getAgentBreakdown(days: number | null = null): Array<{
  agent: string;
  sessions: number;
  messages: number;
  tokensInput: number;
  tokensOutput: number;
  tokensReasoning: number;
  tokensCacheRead: number;
  toolCalls: number;
}> {
  const db = getDb();
  const cutoff = cutoffForDays(days);
  const where = cutoff !== null ? "WHERE s.time_created >= ?" : "";
  const params: number[] = cutoff !== null ? [cutoff] : [];
  const rows = db
    .prepare(
      `SELECT s.agent,
        COUNT(*) AS sessions,
        (SELECT COUNT(*) FROM message m WHERE m.session_id = s.id) AS messages,
        SUM(s.tokens_input) AS ti, SUM(s.tokens_output) AS to_,
        SUM(s.tokens_reasoning) AS tr, SUM(s.tokens_cache_read) AS tcr,
        (SELECT COUNT(*) FROM part pt WHERE pt.session_id = s.id
          AND json_extract(pt.data, '$.type') = 'tool') AS tools
       FROM session s
       ${where}
       GROUP BY s.agent
       ORDER BY sessions DESC`
    )
    .all(...params) as Row[];
  return rows.map((r) => ({
    agent: String(r.agent ?? "unknown"),
    sessions: Number(r.sessions ?? 0),
    messages: Number(r.messages ?? 0),
    tokensInput: Number(r.ti ?? 0),
    tokensOutput: Number(r.to_ ?? 0),
    tokensReasoning: Number(r.tr ?? 0),
    tokensCacheRead: Number(r.tcr ?? 0),
    toolCalls: Number(r.tools ?? 0),
  }));
}
