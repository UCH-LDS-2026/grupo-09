export type NodeKind =
  | "api_gateway"
  | "load_balancer"
  | "app_service"
  | "cache"
  | "database"
  | "queue";

export type NodeStatus = "healthy" | "warning" | "saturated" | "failed";

export interface SimNode {
  id: string;
  kind: NodeKind;
  name: string;
  x: number;
  y: number;
  instances: number;
  capacity: number;     // req/s per instance
  baseLatency: number;  // ms
  queueSize: number;
  timeout: number;      // ms
  costPerInstance: number; // $ / month
}

export interface SimEdge {
  id: string;
  from: string;
  to: string;
  async?: boolean;
}

export interface NodeMetrics {
  load: number;        // 0..>1 (utilization)
  throughput: number;  // req/s actually served
  latency: number;     // ms effective
  errorRate: number;   // 0..1
  status: NodeStatus;
  cost: number;        // monthly $
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

export const KIND_META: Record<
  NodeKind,
  { label: string; category: string; color: string; defaults: Omit<SimNode, "id" | "x" | "y" | "name" | "kind"> }
> = {
  api_gateway: {
    label: "API Gateway",
    category: "Traffic & Edge",
    color: "var(--neon-violet)",
    defaults: { instances: 2, capacity: 800, baseLatency: 8, queueSize: 100, timeout: 2000, costPerInstance: 25 },
  },
  load_balancer: {
    label: "Load Balancer",
    category: "Traffic & Edge",
    color: "var(--neon-cyan)",
    defaults: { instances: 2, capacity: 5000, baseLatency: 2, queueSize: 200, timeout: 1000, costPerInstance: 18 },
  },
  app_service: {
    label: "App Service",
    category: "Compute",
    color: "var(--neon-cyan)",
    defaults: { instances: 2, capacity: 400, baseLatency: 35, queueSize: 100, timeout: 3000, costPerInstance: 40 },
  },
  cache: {
    label: "Cache",
    category: "Storage",
    color: "var(--neon-pink)",
    defaults: { instances: 1, capacity: 8000, baseLatency: 1, queueSize: 500, timeout: 500, costPerInstance: 30 },
  },
  database: {
    label: "Database",
    category: "Storage",
    color: "var(--neon-amber)",
    defaults: { instances: 1, capacity: 600, baseLatency: 18, queueSize: 200, timeout: 5000, costPerInstance: 80 },
  },
  queue: {
    label: "Queue",
    category: "Messaging",
    color: "var(--neon-violet)",
    defaults: { instances: 1, capacity: 3000, baseLatency: 5, queueSize: 1000, timeout: 10000, costPerInstance: 20 },
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

export function statusFor(load: number): NodeStatus {
  if (load >= 1.25) return "failed";
  if (load >= 1.0) return "saturated";
  if (load >= 0.75) return "warning";
  return "healthy";
}

/**
 * Very simple flow simulation: traffic enters from nodes with no inbound
 * (sources). For each node, incoming offered load is divided across its
 * outgoing non-async edges. Async edges (queue) drain offered load instead of
 * propagating it downstream synchronously.
 */
export function simulate(
  nodes: SimNode[],
  edges: SimEdge[],
  trafficRps: number,
): SimResult {
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

  const sources = nodes.filter((n) => incoming[n.id].length === 0);
  const offered: Record<string, number> = {};
  nodes.forEach((n) => (offered[n.id] = 0));
  sources.forEach((n) => (offered[n.id] = trafficRps / Math.max(sources.length, 1)));

  // topological-ish propagation (BFS up to N iterations to handle simple cycles)
  for (let iter = 0; iter < nodes.length + 2; iter++) {
    nodes.forEach((n) => {
      const outs = outgoing[n.id];
      if (!outs.length) return;
      const syncOuts = outs.filter((e) => !e.async);
      const asyncOuts = outs.filter((e) => e.async);
      const totalCap = n.capacity * n.instances;
      const served = Math.min(offered[n.id], totalCap);
      // sync downstream get an even split of served traffic
      if (syncOuts.length) {
        const share = served / syncOuts.length;
        syncOuts.forEach((e) => {
          // accumulate but don't double count across iterations
          offered[e.to] = Math.max(offered[e.to], share);
        });
      }
      asyncOuts.forEach((e) => {
        offered[e.to] = Math.max(offered[e.to], served * 0.4);
      });
    });
  }

  const perNode: Record<string, NodeMetrics> = {};
  let weightedLatency = 0;
  let totalThroughput = 0;
  let totalErrors = 0;
  let totalCost = 0;
  let bottleneck: { id: string; name: string; load: number } | undefined;

  nodes.forEach((n) => {
    const totalCap = n.capacity * n.instances;
    const load = totalCap > 0 ? offered[n.id] / totalCap : 0;
    const throughput = Math.min(offered[n.id], totalCap);
    // latency grows quadratically as we approach saturation
    const latency = n.baseLatency * (1 + Math.pow(Math.min(load, 1.5), 2) * 6);
    const errorRate = load <= 1 ? 0 : Math.min((load - 1) / load, 0.95);
    const status = statusFor(load);
    const cost = n.costPerInstance * n.instances;

    perNode[n.id] = { load, throughput, latency, errorRate, status, cost };
    weightedLatency += latency * Math.max(throughput, 1);
    totalThroughput += throughput;
    totalErrors += errorRate * Math.max(offered[n.id], 0);
    totalCost += cost;

    if (!bottleneck || load > bottleneck.load) {
      bottleneck = { id: n.id, name: n.name, load };
    }
  });

  const avgLatency = totalThroughput > 0 ? weightedLatency / totalThroughput : 0;
  const errorRate = trafficRps > 0 ? Math.min(totalErrors / trafficRps, 1) : 0;

  return {
    perNode,
    totals: {
      avgLatency,
      errorRate,
      throughput: totalThroughput,
      cost: totalCost,
      bottleneck:
        bottleneck && bottleneck.load >= 0.75
          ? { id: bottleneck.id, name: bottleneck.name }
          : undefined,
    },
  };
}
