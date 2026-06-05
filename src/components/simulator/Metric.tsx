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
    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <div className="font-mono text-lg font-semibold tracking-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
