import { Activity } from "lucide-react";

import type { SystemConclusionData } from "./systemConclusionLogic";

export function SystemConclusion({ conclusion }: { conclusion: SystemConclusionData }) {
  const color =
    conclusion.accent === "cyan"
      ? "var(--neon-cyan)"
      : conclusion.accent === "amber"
        ? "var(--neon-amber)"
        : "var(--status-saturated)";

  return (
    <section className="border-t border-border/60 bg-panel/60 px-3 py-3">
      <div className="mx-auto max-w-6xl rounded-lg border border-border/60 bg-card/55 p-3">
        <div className="mb-1 flex items-center gap-2">
          <Activity className="h-4 w-4" style={{ color }} />
          <h3 className="text-sm font-semibold" style={{ color }}>
            {conclusion.title}
          </h3>
        </div>
        <p className="text-sm text-foreground">{conclusion.summary}</p>
        <div className="mt-2 grid gap-1 text-xs leading-5 text-muted-foreground md:grid-cols-2">
          {conclusion.details.map((detail) => (
            <div key={detail}>{detail}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
