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
  capacity: number;
  baseLatency: number;
  queueSize: number;
  timeout: number;
  costPerInstance: number;
}

export interface SimEdge {
  id: string;
  from: string;
  to: string;
  async?: boolean;
}

export interface NodeMetrics {
  incoming: number;
  capacity: number;
  load: number;
  throughput: number;
  queued: number;
  dropped: number;
  latency: number;
  errorRate: number;
  status: NodeStatus;
  cost: number;
}

export interface CycleSnapshot {
  cycle: number;
  incoming: Record<string, number>;
  throughput: Record<string, number>;
  queued: Record<string, number>;
  dropped: Record<string, number>;
}

export interface SimResult {
  perNode: Record<string, NodeMetrics>;
  totals: {
    avgLatency: number;
    errorRate: number;
    throughput: number;
    cost: number;
    cycles: number;
    bottleneck?: { id: string; name: string; reason: string };
  };
  cycles: CycleSnapshot[];
}

export const NODE_KINDS: Set<NodeKind>;
export const ALLOWED_CONNECTIONS: Record<NodeKind, NodeKind[]>;
export const KIND_META: Record<
  NodeKind,
  {
    label: string;
    category: string;
    color: string;
    defaults: Omit<SimNode, "id" | "x" | "y" | "name" | "kind">;
  }
>;
export const SIMULATION_CYCLES: number;
export const CACHE_HIT_RATE: number;
export const MAX_TRAFFIC_RPS: number;
export const MAX_NODES: number;
export const MAX_EDGES: number;
export const MAX_NODE_ID_LENGTH: number;
export const MAX_NODE_INSTANCES: number;
export const MAX_NODE_CAPACITY_RPS: number;
export const MAX_NODE_LATENCY_MS: number;
export const MAX_NODE_QUEUE_SIZE: number;
export const MAX_NODE_TIMEOUT_MS: number;
export const MAX_NODE_COST: number;

export function createHttpError(
  statusCode: number,
  message: string,
): Error & { statusCode: number };
export function makeNode(kind: NodeKind, x: number, y: number, idx?: number): SimNode;
export function canConnect(sourceKind: NodeKind, targetKind: NodeKind): boolean;
export function createsCycle(fromId: string, toId: string, edges: SimEdge[]): boolean;
export function assertAcyclic(edges: SimEdge[]): void;
export function validateConnection(
  source: SimNode | undefined,
  target: SimNode | undefined,
  edges: SimEdge[],
): { valid: true; isAsync: boolean } | { valid: false; message: string };
export function normalizeProjectGraph(
  rawNodes: unknown,
  rawEdges: unknown,
  options?: { requirePosition?: boolean },
): { nodes: SimNode[]; edges: SimEdge[] };
export function statusFor(load: number, errorRate?: number): NodeStatus;
export function calculateLatency(baseLatency: number, load: number): number;
export function calculateNodeCapacity(instances: number, capacityPerInstance: number): number;
export function calculateNodeTrafficMetrics(input: {
  trafficRps: number;
  instances: number;
  capacityPerInstance: number;
}): {
  incoming: number;
  capacity: number;
  load: number;
  throughput: number;
  dropped: number;
  errorRate: number;
  status: NodeStatus;
};
export function calculateCacheMissTraffic(throughputRps: number, hitRate?: number): number;
export function recommendInstancesForTraffic(
  trafficRps: number,
  capacityPerInstance: number,
  currentInstances?: number,
): number;
export function simulate(nodes: SimNode[], edges: SimEdge[], trafficRps: number): SimResult;
export function normalizeSimulationPayload(payload?: unknown): {
  traffic: number;
  nodes: SimNode[];
  edges: SimEdge[];
};
