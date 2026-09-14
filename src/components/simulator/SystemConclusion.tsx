import { Activity, CheckCircle2, ChevronDown, CircleAlert, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { SystemConclusionData } from "./systemConclusionLogic";

const SIGNAL_STYLES = {
  ok: { icon: CheckCircle2, className: "text-muted-foreground" },
  warning: { icon: TriangleAlert, className: "text-[color:var(--status-warning)]" },
  critical: { icon: CircleAlert, className: "text-[color:var(--status-saturated)]" },
};

export function SystemConclusion({ conclusion }: { conclusion: SystemConclusionData }) {
  const [expanded, setExpanded] = useState(false);
  const load = conclusion.signals.find((signal) => signal.label === "Carga")?.value ?? "--";
  const error = conclusion.signals.find((signal) => signal.label === "Error")?.value ?? "--";
  const stateLabel =
    conclusion.accent === "warn"
      ? "Saturado"
      : conclusion.accent === "amber"
        ? "Atención"
        : "Estable";

  return (
    <section className="shrink-0 border-t border-border/45 bg-panel/90">
      <div className="flex min-h-12 items-center gap-3 px-3 sm:px-4">
        <Activity
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground",
            conclusion.accent === "warn" && "text-[color:var(--status-saturated)]",
            conclusion.accent === "amber" && "text-[color:var(--status-warning)]",
          )}
        />
        <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground sm:text-sm">
          <span className="font-medium text-foreground">Conclusión: {stateLabel}</span>
          <span className="hidden sm:inline">
            {" "}
            · carga {load} · error {error}
          </span>
          <span className="hidden md:inline"> · cuello: {conclusion.bottleneckName}</span>
        </p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 shrink-0 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? "Ocultar análisis" : "Ver análisis completo"}
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
          />
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-border/40 px-3 py-3 sm:px-4">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm leading-5 text-foreground">{conclusion.summary}</p>
            {conclusion.signals.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                {conclusion.signals.map((signal) => {
                  const SignalIcon = SIGNAL_STYLES[signal.status].icon;
                  return (
                    <div key={signal.label} className="min-w-0">
                      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                        <SignalIcon
                          className={`h-3.5 w-3.5 ${SIGNAL_STYLES[signal.status].className}`}
                        />
                        {signal.label}
                      </div>
                      <div className="mt-1 truncate text-sm font-medium text-foreground">
                        {signal.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-3 grid gap-2 border-t border-border/40 pt-3 text-xs leading-5 text-muted-foreground md:grid-cols-2">
              <p>
                <span className="text-foreground">Causa:</span> {conclusion.primaryCause}
              </p>
              <p>
                <span className="text-foreground">Acción:</span> {conclusion.recommendation}
              </p>
              {conclusion.details.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
