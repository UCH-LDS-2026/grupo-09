import { useState } from "react";
import { ChevronDown, Link2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SimEdge, SimNode } from "@/lib/simulator";
import { cn } from "@/lib/utils";

interface ConnectionsPanelProps {
  nodes: SimNode[];
  edges: SimEdge[];
  selected: SimNode | null;
  connectingFromId: string | null;
  onStartConnection: () => void;
  onCancelConnection: () => void;
  onDeleteConnection: (edgeId: string) => void;
}

export function ConnectionsPanel({
  nodes,
  edges,
  selected,
  connectingFromId,
  onStartConnection,
  onCancelConnection,
  onDeleteConnection,
}: ConnectionsPanelProps) {
  const [showConnections, setShowConnections] = useState(false);
  const nodeNames = new Map(nodes.map((node) => [node.id, node.name]));
  const connectingNodeName = connectingFromId ? nodeNames.get(connectingFromId) : null;

  return (
    <div className="mt-auto space-y-3 border-t border-border/60 pt-3">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Conexiones
        </div>
        <p className="mt-1 text-xs text-muted-foreground/80">
          {connectingNodeName
            ? `Elegí destino para ${connectingNodeName}.`
            : selected
              ? `Origen: ${selected.name}`
              : "Seleccioná un componente."}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!selected}
          onClick={onStartConnection}
          className={cn(
            "flex-1 border-[color:var(--neon-cyan)]/45 bg-[color:var(--neon-cyan)]/5 text-[color:var(--neon-cyan)] hover:bg-[color:var(--neon-cyan)]/10 hover:text-[color:var(--neon-cyan)]",
            connectingFromId &&
              "border-[color:var(--neon-amber)]/65 bg-[color:var(--neon-amber)]/10 text-[color:var(--neon-amber)] hover:text-[color:var(--neon-amber)]",
          )}
        >
          <Link2 className="h-4 w-4" />
          {connectingFromId ? "Conectando" : "Conectar"}
        </Button>
        {connectingFromId && (
          <Button type="button" size="sm" variant="ghost" onClick={onCancelConnection}>
            Cancelar
          </Button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowConnections((value) => !value)}
        className="flex w-full items-center justify-between rounded-md bg-card/50 px-2.5 py-2 text-xs text-muted-foreground transition hover:bg-card/80 hover:text-foreground"
      >
        <span>Conexiones: {edges.length}</span>
        <span className="flex items-center gap-1">
          Ver conexiones
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", showConnections && "rotate-180")}
          />
        </span>
      </button>

      {showConnections && (
        <div className="max-h-40 space-y-1.5 overflow-y-auto">
          {edges.length ? (
            edges.map((edge) => (
              <div
                key={edge.id}
                className="flex items-center justify-between gap-2 rounded-md bg-card/60 px-2.5 py-2 text-xs"
              >
                <span className="min-w-0 flex-1 truncate">
                  {nodeNames.get(edge.from) ?? edge.from} → {nodeNames.get(edge.to) ?? edge.to}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteConnection(edge.id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[color:var(--status-saturated)] transition hover:bg-[color:var(--status-saturated)]/10"
                  title="Eliminar conexión"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-md bg-card/50 p-2 text-xs text-muted-foreground">
              Todavía no hay conexiones.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
