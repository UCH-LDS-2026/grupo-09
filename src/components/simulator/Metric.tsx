import type { LucideIcon } from "lucide-react";

interface MetricProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: "cyan" | "amber" | "violet" | "warn";
}

export function Metric({ label, value, icon: Icon, accent }: MetricProps) {
  const color =
    accent === "cyan"
      ? "var(--neon-cyan)"
      : accent === "amber"
        ? "var(--neon-amber)"
        : accent === "violet"
          ? "var(--neon-violet)"
          : "var(--status-saturated)";

  return (
    <div className="min-h-24 rounded-lg border border-border/60 bg-card/60 p-3.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="min-w-0 break-words font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 shrink-0" style={{ color }} />
      </div>
      <div className="break-words font-mono text-xl font-semibold tracking-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
