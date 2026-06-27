import { AlertCircle, CheckCircle2, Clock3, LockKeyhole, PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type WorkspaceStateKind = "empty" | "loading" | "error" | "success" | "unauthorized" | "stale";

const ICONS = {
  empty: PackageOpen,
  loading: Clock3,
  error: AlertCircle,
  success: CheckCircle2,
  unauthorized: LockKeyhole,
  stale: Clock3,
};

export function WorkspaceState({
  kind,
  title,
  detail,
  action,
}: {
  kind: WorkspaceStateKind;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  const Icon = ICONS[kind];
  return (
    <div
      className={cn(
        "rounded-lg bg-card/45 p-4",
        kind === "error" && "bg-[color:var(--status-saturated)]/6",
        kind === "success" && "bg-card/70",
      )}
      role={kind === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground",
            kind === "error" && "text-[color:var(--status-saturated)]",
            kind === "success" && "text-[color:var(--neon-cyan)]",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground">{title}</div>
          {detail && <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}
