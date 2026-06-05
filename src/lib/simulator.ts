export type NodeKind =
  | "api_gateway"
  | "load_balancer"
  | "app_service"
  | "cache"
  | "database"
  | "queue";

export type NodeStatus = "healthy" | "warning" | "high_load" | "saturated" | "error";

export interface SimNode {
  id: string;
  kind: NodeKind;
  name: string;
  x: number;
  y: number;
  instances: number;
  capacity: number; // req/s per instance
  baseLatency: number; // ms
  queueSize: number;
  timeout: number; // ms
  costPerInstance: number; // $ / month
}

export interface SimEdge {
  id: string;
  from: string;
  to: string;
  async?: boolean;
}

export interface NodeMetrics {
  incoming: number; // req/s offered to this node
  capacity: number; // req/s total installed capacity
  load: number; // 0..>1 (utilization)
  throughput: number; // req/s actually served
  latency: number; // ms effective
  errorRate: number; // 0..1
  status: NodeStatus;
  cost: number; // monthly $
}

export interface SimResult {
  perNode: Record<string, NodeMetrics>;
  totals: {
    avgLatency: number;
    errorRate: number;
    throughput: number;
    cost: number;
    bottleneck?: { id: string; name: string };
  };
}

export const ALLOWED_CONNECTIONS: Record<NodeKind, NodeKind[]> = {
  api_gateway: ["load_balancer", "app_service"],
  load_balancer: ["app_service"],
  app_service: ["app_service", "database", "queue"],
  queue: ["app_service"],
  cache: [],
  database: [],
};

export const KIND_META: Record<
  NodeKind,
  {
    label: string;
    category: string;
    color: string;
    defaults: Omit<SimNode, "id" | "x" | "y" | "name" | "kind">;
  }
> = {
  api_gateway: {
    label: "Puerta de enlace API",
    category: "Tráfico y entrada",
    color: "var(--neon-violet)",
    defaults: {
      instances: 2,
      capacity: 800,
      baseLatency: 8,
      queueSize: 100,
      timeout: 2000,
      costPerInstance: 25,
    },
  },
  load_balancer: {
    label: "Balanceador de carga",
    category: "Tráfico y entrada",
    color: "var(--neon-cyan)",
    defaults: {
      instances: 2,
      capacity: 5000,
      baseLatency: 2,
      queueSize: 200,
      timeout: 1000,
      costPerInstance: 18,
    },
  },
  app_service: {
    label: "Servicio de aplicación",
    category: "Cómputo",
    color: "var(--neon-cyan)",
    defaults: {
      instances: 2,
      capacity: 400,
      baseLatency: 35,
      queueSize: 100,
      timeout: 3000,
      costPerInstance: 40,
    },
  },
  cache: {
    label: "Caché",
    category: "Almacenamiento",
    color: "var(--neon-pink)",
    defaults: {
      instances: 1,
      capacity: 8000,
      baseLatency: 1,
      queueSize: 500,
      timeout: 500,
      costPerInstance: 30,
    },
  },
  database: {
    label: "Base de datos",
    category: "Almacenamiento",
    color: "var(--neon-amber)",
    defaults: {
      instances: 1,
      capacity: 600,
      baseLatency: 18,
      queueSize: 200,
      timeout: 5000,
      costPerInstance: 80,
    },
  },
  queue: {
    label: "Cola",
    category: "Mensajería",
    color: "var(--neon-violet)",
    defaults: {
      instances: 1,
      capacity: 3000,
      baseLatency: 5,
      queueSize: 1000,
      timeout: 10000,
      costPerInstance: 20,
    },
  },
};

export function makeNode(kind: NodeKind, x: number, y: number, idx = 1): SimNode {
  const meta = KIND_META[kind];
  return {
    id: `${kind}_${Math.random().toString(36).slice(2, 8)}`,
    kind,
    name: `${meta.label}${idx > 1 ? " " + idx : ""}`,
    x,
    y,
    ...meta.defaults,
  };
}

export function canConnect(sourceKind: NodeKind, targetKind: NodeKind): boolean {
  return ALLOWED_CONNECTIONS[sourceKind]?.includes(targetKind) ?? false;
}

function createsCycle(fromId: string, toId: string, edges: SimEdge[]): boolean {
  const outgoing: Record<string, string[]> = {};
  edges.forEach((edge) => {
    outgoing[edge.from] = [...(outgoing[edge.from] ?? []), edge.to];
  });
  outgoing[fromId] = [...(outgoing[fromId] ?? []), toId];

  const visited = new Set<string>();
  const stack = [toId];

  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    if (current === fromId) return true;
    if (visited.has(current)) continue;

    visited.add(current);
    stack.push(...(outgoing[current] ?? []));
  }

  return false;
}

export function validateConnection(
  source: SimNode | undefined,
  target: SimNode | undefined,
  edges: SimEdge[],
): { valid: true; isAsync: boolean } | { valid: false; message: string } {
  if (!source || !target) {
    return { valid: false, message: "Origen o destino inválido." };
  }

  if (source.id === target.id) {
    return { valid: false, message: "No se puede conectar un componente consigo mismo." };
  }

  const alreadyExists = edges.some((edge) => edge.from === source.id && edge.to === target.id);
  if (alreadyExists) {
    return { valid: false, message: "La conexión ya existe." };
  }

  if (!canConnect(source.kind, target.kind)) {
    return {
      valid: false,
      message: connectionErrorMessage(source.kind),
    };
  }

  if (createsCycle(source.id, target.id, edges)) {
    return { valid: false, message: "La conexión generaría un ciclo no válido para este MVP." };
  }

  return { valid: true, isAsync: source.kind === "app_service" && target.kind === "queue" };
}

function connectionErrorMessage(sourceKind: NodeKind): string {
  return sourceKind === "database"
    ? "Esta conexión no es válida para el MVP. La base de datos no puede ser origen de tráfico."
    : "Esta conexión no es válida para el MVP. El flujo debe ir desde entrada, distribución, procesamiento y almacenamiento.";
}

export function statusFor(load: number, errorRate = 0): NodeStatus {
  if (errorRate > 0) return "error";
  if (load >= 1.0) return "saturated";
  if (load >= 0.9) return "high_load";
  if (load >= 0.7) return "warning";
  return "healthy";
}

export function calculateLatency(baseLatency: number, load: number): number {
  if (load < 0.7) return baseLatency;
  if (load < 0.9) return Math.round(baseLatency * 1.5);
  if (load <= 1) return Math.round(baseLatency * 2);
  return Math.round(baseLatency * 3);
}

/**
 * MVP flow simulation: traffic starts at entry nodes, each node processes up to
 * its installed capacity, and processed traffic is divided across outgoing edges.
 */
export function simulate(nodes: SimNode[], edges: SimEdge[], trafficRps: number): SimResult {
  const incoming: Record<string, string[]> = {};
  const outgoing: Record<string, SimEdge[]> = {};
  nodes.forEach((n) => {
    incoming[n.id] = [];
    outgoing[n.id] = [];
  });
  edges.forEach((e) => {
    if (incoming[e.to]) incoming[e.to].push(e.from);
    if (outgoing[e.from]) outgoing[e.from].push(e);
  });

  const gatewaySources = nodes.filter((n) => n.kind === "api_gateway");
  const fallbackSources = nodes.filter((n) => incoming[n.id].length === 0);
  const sources = gatewaySources.length
    ? gatewaySources
    : fallbackSources.length
      ? fallbackSources
      : nodes.slice(0, 1);
  const offered: Record<string, number> = {};
  nodes.forEach((n) => (offered[n.id] = 0));
  sources.forEach((n) => (offered[n.id] = trafficRps / Math.max(sources.length, 1)));

  // topological-ish propagation (BFS up to N iterations to handle simple cycles)
  for (let iter = 0; iter < nodes.length + 2; iter++) {
    nodes.forEach((n) => {
      const outs = outgoing[n.id];
      if (!outs.length) return;
      const totalCap = n.capacity * n.instances;
      const served = Math.min(offered[n.id], totalCap);
      const share = served / outs.length;

      outs.forEach((e) => {
        offered[e.to] = Math.max(offered[e.to], share);
      });
    });
  }

  const perNode: Record<string, NodeMetrics> = {};
  let weightedLatency = 0;
  let totalCost = 0;
  let bottleneck: { id: string; name: string; load: number } | undefined;

  nodes.forEach((n) => {
    const totalCap = n.capacity * n.instances;
    const load = totalCap > 0 ? offered[n.id] / totalCap : 0;
    const throughput = Math.min(offered[n.id], totalCap);
    const errorRate = offered[n.id] > 0 ? Math.max(0, offered[n.id] - totalCap) / offered[n.id] : 0;
    const latency = calculateLatency(n.baseLatency, load);
    const status = statusFor(load, errorRate);
    const cost = n.costPerInstance * n.instances;

    perNode[n.id] = {
      incoming: offered[n.id],
      capacity: totalCap,
      load,
      throughput,
      latency,
      errorRate,
      status,
      cost,
    };
    if (offered[n.id] > 0) {
      weightedLatency += latency * Math.max(throughput, 1);
    }
    totalCost += cost;

    if (offered[n.id] > 0 && (!bottleneck || load > bottleneck.load)) {
      bottleneck = { id: n.id, name: n.name, load };
    }
  });

  const activeMetrics = Object.values(perNode).filter((metrics) => metrics.incoming > 0);
  const errorRate = activeMetrics.length
    ? Math.max(...activeMetrics.map((metrics) => metrics.errorRate))
    : 0;
  const throughput = trafficRps > 0 ? Math.min(trafficRps * (1 - errorRate), trafficRps) : 0;
  const avgLatency = activeMetrics.length
    ? weightedLatency /
      activeMetrics.reduce((total, metrics) => total + Math.max(metrics.throughput, 1), 0)
    : 0;

  return {
    perNode,
    totals: {
      avgLatency,
      errorRate,
      throughput,
      cost: totalCost,
      bottleneck: bottleneck ? { id: bottleneck.id, name: bottleneck.name } : undefined,
    },
  };
}
