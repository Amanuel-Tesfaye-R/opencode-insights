import {
  ChevronDown,
  FileCode2,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import { StatusBadge, ModelBadge } from "@/components/ui/badge";
import { formatTime, formatTokens } from "@/lib/format";
import type { MessagePart, SessionMessage } from "@/lib/types";

export function SessionTimeline({ messages }: { messages: SessionMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
        No messages recorded in this session.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg, i) => (
        <article
          key={msg.id}
          className="rounded-xl border bg-card shadow-sm overflow-hidden animate__animated animate__fadeInUp"
          style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
        >
          <header className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-2.5">
            {msg.role === "user" ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                <User className="h-3.5 w-3.5 text-accent" />
                You
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {msg.agent}
              </span>
            )}
            <ModelBadge model={msg.modelId} index={0} />
            <span className="text-[11px] text-muted-foreground font-mono">
              {formatTime(msg.timeCreated)}
            </span>
            {msg.role !== "user" && (
              <span className="ml-auto text-[11px] text-muted-foreground font-mono">
                {formatTokens(msg.tokensTotal)} tokens
                {msg.tokensReasoning > 0 &&
                  ` (r:${formatTokens(msg.tokensReasoning)})`}
                {msg.finish && ` | ${msg.finish}`}
              </span>
            )}
          </header>

          <div className="space-y-3 p-4">
            {msg.parts.length === 0 && msg.role === "user" && (
              <p className="text-sm text-muted-foreground italic">
                (message with no visible content)
              </p>
            )}
            {msg.parts.map((part) => (
              <PartView key={part.id} part={part} />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function PartView({ part }: { part: MessagePart }) {
  switch (part.type) {
    case "text":
      return (
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {part.text}
        </div>
      );
    case "reasoning":
      return (
        <details className="group rounded-lg border bg-muted/20">
          <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground select-none list-none">
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            Reasoning
          </summary>
          <pre className="px-3 pb-3 text-xs font-mono whitespace-pre-wrap break-words text-muted-foreground max-h-64 overflow-auto">
            {part.text}
          </pre>
        </details>
      );
    case "tool":
      return (
        <div className="rounded-lg border">
          <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold font-mono">{part.tool}</span>
            {part.toolStatus && <StatusBadge status={part.toolStatus} />}
          </div>
          {part.toolInput && (
            <div className="border-b px-3 py-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Input
              </p>
              <pre className="text-xs font-mono whitespace-pre-wrap break-words max-h-48 overflow-auto">
                {part.toolInput}
              </pre>
            </div>
          )}
          {part.toolOutput && (
            <div className="px-3 py-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Output
              </p>
              <pre className="text-xs font-mono whitespace-pre-wrap break-words max-h-48 overflow-auto text-muted-foreground">
                {part.toolOutput}
              </pre>
            </div>
          )}
        </div>
      );
    case "patch":
      return (
        <div className="rounded-lg border bg-muted/10 px-3 py-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Files changed
          </p>
          <ul className="space-y-1">
            {(part.files ?? []).map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 text-xs font-mono text-muted-foreground truncate"
                title={f}
              >
                <FileCode2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
}
