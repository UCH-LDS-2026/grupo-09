import { Activity, CheckCircle2, CircleAlert, TriangleAlert } from "lucide-react";

import type { SystemConclusionData } from "./systemConclusionLogic";

const SIGNAL_STYLES = {
  ok: { icon: CheckCircle2, className: "text-[color:var(--status-healthy)]" },
  warning: { icon: TriangleAlert, className: "text-[color:var(--neon-amber)]" },
  critical: { icon: CircleAlert, className: "text-[color:var(--status-saturated)]" },
};

export function SystemConclusion({ conclusion }: { conclusion: SystemConclusionData }) {
  const color =
    conclusion.accent === "cyan"
      ? "var(--neon-cyan)"
      : conclusion.accent === "amber"
        ? "var(--neon-amber)"
        : "var(--status-saturated)";

  return (
    <section className="border-t border-border/60 bg-panel/60 px-3 py-3">
      <div className="mx-auto max-w-6xl rounded-md border border-border/60 bg-card/55 p-3 sm:p-4">
        <div className="mb-1 flex min-w-0 items-center gap-2">
          <Activity className="h-4 w-4" style={{ color }} />
          <h3 className="min-w-0 break-words text-sm font-semibold" style={{ color }}>
            {conclusion.title}
          </h3>
        </div>
        <p className="break-words text-sm leading-5 text-foreground">{conclusion.summary}</p>
        {conclusion.signals.length > 0 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {conclusion.signals.map((signal) => {
              const SignalIcon = SIGNAL_STYLES[signal.status].icon;
              return (
                <div
                  key={signal.label}
                  className="min-h-16 rounded-md border border-border/50 bg-panel/45 p-2.5"
                >
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    <SignalIcon
                      className={`h-3.5 w-3.5 ${SIGNAL_STYLES[signal.status].className}`}
                    />
                    <span className="break-words">{signal.label}</span>
                  </div>
                  <div className="mt-1 break-words text-sm font-semibold text-foreground">
                    {signal.value}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="mt-3 rounded-md border border-border/50 bg-panel/35 p-2.5 text-xs leading-5 text-muted-foreground">
          <div className="break-words">
            <span className="text-foreground">Causa:</span> {conclusion.primaryCause}
          </div>
          <div className="break-words">
            <span className="text-foreground">Acción:</span> {conclusion.recommendation}
          </div>
        </div>
        <div className="mt-2 grid gap-1 text-xs leading-5 text-muted-foreground md:grid-cols-2">
          {conclusion.details.map((detail) => (
            <div className="break-words" key={detail}>
              {detail}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
