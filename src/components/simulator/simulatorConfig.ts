import {
  makeNode,
  type NodeKind,
  type NodeStatus,
  type SimEdge,
  type SimNode,
} from "@/lib/simulator";

export const NODE_W = 208;
export const NODE_H = 116;

export const initialNodes: SimNode[] = [
  { ...makeNode("api_gateway", 80, 220), id: "n_gw", name: "Puerta de enlace API" },
  { ...makeNode("load_balancer", 320, 220), id: "n_lb", name: "Balanceador de carga" },
  { ...makeNode("app_service", 560, 220), id: "n_app", name: "Servicio de aplicación" },
  { ...makeNode("cache", 800, 220), id: "n_cache", name: "Caché" },
  { ...makeNode("database", 1040, 220), id: "n_db", name: "Base de datos" },
];

export const initialEdges: SimEdge[] = [
  { id: "e1", from: "n_gw", to: "n_lb" },
  { id: "e2", from: "n_lb", to: "n_app" },
  { id: "e3", from: "n_app", to: "n_cache" },
  { id: "e4", from: "n_cache", to: "n_db" },
];

export const STATUS_STYLES: Record<
  NodeStatus,
  { ring: string; glow: string; dot: string; label: string }
> = {
  healthy: {
    ring: "ring-[color:var(--neon-cyan)]/40",
    glow: "shadow-[var(--shadow-glow-cyan)]",
    dot: "bg-[color:var(--status-healthy)]",
    label: "Estable",
  },
  warning: {
    ring: "ring-[color:var(--status-warning)]/60",
    glow: "shadow-[var(--shadow-glow-warning)]",
    dot: "bg-[color:var(--status-warning)]",
    label: "Advertencia",
  },
  high_load: {
    ring: "ring-[color:var(--status-warning)]/70",
    glow: "shadow-[var(--shadow-glow-warning)]",
    dot: "bg-[color:var(--status-warning)]",
    label: "Alta carga",
  },
  saturated: {
    ring: "ring-[color:var(--status-saturated)]/70",
    glow: "shadow-[var(--shadow-glow-saturated)]",
    dot: "bg-[color:var(--status-saturated)]",
    label: "Saturado",
  },
  error: {
    ring: "ring-[color:var(--status-error)]/80",
    glow: "shadow-[var(--shadow-glow-saturated)]",
    dot: "bg-[color:var(--status-error)]",
    label: "Con errores",
  },
};

export const CATEGORIES: { name: string; kinds: NodeKind[] }[] = [
  {
    name: "Componentes",
    kinds: ["api_gateway", "load_balancer", "app_service", "cache", "database", "queue"],
  },
];
