import type { MouseEvent } from "react";

interface ResizeHandleProps {
  onMouseDown: (event: MouseEvent) => void;
}

export function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
      className="group relative z-10 hidden w-1 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-[color:var(--neon-cyan)]/60 lg:block"
      title="Arrastrá para cambiar tamaño"
    >
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/30 group-hover:bg-[color:var(--neon-cyan)]" />
    </div>
  );
}
