export interface SessionSummary {
  id: string;
  title: string;
  directory: string;
  directoryName: string;
  projectId: string;
  projectName: string;
  agent: string;
  modelId: string;
  providerId: string;
  cost: number;
  tokensInput: number;
  tokensOutput: number;
  tokensReasoning: number;
  tokensCacheRead: number;
  tokensCacheWrite: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  messageCount: number;
  toolCount: number;
  createdAt: number;
  updatedAt: number;
  archivedAt: number | null;
  durationMs: number;
}

export interface ModelBreakdown {
  modelId: string;
  providerId: string;
  sessions: number;
  messages: number;
  tokensInput: number;
  tokensOutput: number;
  tokensReasoning: number;
  tokensCacheRead: number;
  cost: number;
  lastActive: number;
}

export interface ProjectBreakdown {
  projectId: string;
  projectName: string;
  worktree: string;
  directory: string;
  sessions: number;
  messages: number;
  tokensInput: number;
  tokensOutput: number;
  tokensCacheRead: number;
  cost: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  lastActive: number;
}

export interface ToolBreakdown {
  tool: string;
  calls: number;
  completed: number;
  error: number;
  pending: number;
}

export interface DailyPoint {
  date: string;
  label: string;
  sessions: number;
  messages: number;
  tokensInput: number;
  tokensOutput: number;
  tokensReasoning: number;
  tokensCacheRead: number;
  tokensTotal: number;
}

export interface HourPoint {
  hour: number;
  label: string;
  count: number;
}

export interface OverviewStats {
  sessions: number;
  messages: number;
  parts: number;
  daysActive: number;
  spanDays: number;
  tokensInput: number;
  tokensOutput: number;
  tokensReasoning: number;
  tokensCacheRead: number;
  tokensCacheWrite: number;
  cost: number;
  avgTokensPerSession: number;
  medianTokensPerSession: number;
  userMessages: number;
  assistantMessages: number;
  patches: number;
  filesTouched: number;
  todosTotal: number;
  todosCompleted: number;
  toolCalls: number;
  toolErrors: number;
}

export interface ToolCall {
  id: string;
  sessionId: string;
  sessionTitle: string;
  messageId: string;
  tool: string;
  status: string;
  timeCreated: number;
  inputPreview: string;
  outputPreview: string;
}

export interface SessionMessage {
  id: string;
  sessionId: string;
  role: string;
  agent: string;
  modelId: string;
  cost: number;
  tokensTotal: number;
  tokensInput: number;
  tokensOutput: number;
  tokensReasoning: number;
  finish: string;
  timeCreated: number;
  timeCompleted: number;
  parts: MessagePart[];
}

export interface MessagePart {
  id: string;
  type: string;
  timeCreated: number;
  text?: string;
  tool?: string;
  toolStatus?: string;
  toolInput?: string;
  toolOutput?: string;
  files?: string[];
  truncatable?: boolean;
}

export interface TodoRow {
  sessionId: string;
  sessionTitle: string;
  content: string;
  status: string;
  priority: string;
  position: number;
  timeCreated: number;
  timeUpdated: number;
}

export interface AgentRow {
  agent: string;
  sessions: number;
  messages: number;
  tokensInput: number;
  tokensOutput: number;
  tokensReasoning: number;
  tokensCacheRead: number;
  toolCalls: number;
}

export interface FileRow {
  path: string;
  edits: number;
  projectId: string;
  projectName: string;
}
