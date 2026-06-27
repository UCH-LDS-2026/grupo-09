import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ExecutiveSummary({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-l-2 border-[color:var(--neon-cyan)]/50 bg-card/50 px-3 py-2.5">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="mt-1 text-sm leading-5 text-foreground">{children}</div>
    </section>
  );
}

export function MetricDelta({
  label,
  value,
  direction = "neutral",
}: {
  label: string;
  value: string;
  direction?: "better" | "worse" | "neutral";
}) {
  return (
    <div className="rounded-lg bg-card/60 p-2.5">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-mono text-sm text-foreground",
          direction === "better" && "text-[color:var(--neon-cyan)]",
          direction === "worse" && "text-[color:var(--status-saturated)]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export function StructuralChanges({ children }: { children: ReactNode }) {
  return <div className="space-y-2 border-t border-border/40 pt-3">{children}</div>;
}

export function ModelLimitations({ children }: { children: ReactNode }) {
  return (
    <aside className="border-l-2 border-[color:var(--status-warning)]/35 bg-card/35 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
      {children}
    </aside>
  );
}
