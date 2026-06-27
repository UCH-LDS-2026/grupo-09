import {
  makeNode,
  type NodeKind,
  type NodeStatus,
  type SimEdge,
  type SimNode,
} from "@/lib/simulator";

export const NODE_W = 208;
export const NODE_H = 92;

export const initialNodes: SimNode[] = [
  { ...makeNode("api_gateway", 40, 180), id: "n_gw", name: "Puerta de enlace API" },
  { ...makeNode("load_balancer", 280, 180), id: "n_lb", name: "Balanceador de carga" },
  { ...makeNode("app_service", 520, 180), id: "n_app", name: "Servicio de aplicación" },
  { ...makeNode("cache", 280, 340), id: "n_cache", name: "Caché" },
  { ...makeNode("database", 520, 340), id: "n_db", name: "Base de datos" },
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
    ring: "ring-border/70",
    glow: "",
    dot: "bg-[color:var(--status-healthy)]",
    label: "Estable",
  },
  warning: {
    ring: "ring-[color:var(--status-warning)]/60",
    glow: "",
    dot: "bg-[color:var(--status-warning)]",
    label: "Advertencia",
  },
  high_load: {
    ring: "ring-[color:var(--status-warning)]/70",
    glow: "",
    dot: "bg-[color:var(--status-warning)]",
    label: "Alta carga",
  },
  saturated: {
    ring: "ring-[color:var(--status-saturated)]/70",
    glow: "",
    dot: "bg-[color:var(--status-saturated)]",
    label: "Saturado",
  },
  error: {
    ring: "ring-[color:var(--status-error)]/80",
    glow: "",
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
