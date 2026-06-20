export const NODE_KINDS = new Set([
  "api_gateway",
  "load_balancer",
  "app_service",
  "cache",
  "database",
  "queue",
]);

export const ALLOWED_CONNECTIONS = {
  api_gateway: ["load_balancer", "app_service"],
  load_balancer: ["app_service"],
  app_service: ["app_service", "cache", "database", "queue"],
  cache: ["database"],
  queue: ["app_service"],
  database: [],
};

export const KIND_META = {
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
      bandwidthMbps: 1000,
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
      bandwidthMbps: 1000,
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
      bandwidthMbps: 100,
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
      bandwidthMbps: 500,
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
      bandwidthMbps: 200,
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
      bandwidthMbps: 100,
    },
  },
};

export const SIMULATION_CYCLES = 6;
export const CACHE_HIT_RATE = 0.7;
export const DEFAULT_AVERAGE_REQUEST_SIZE_KB = 5;
export const DEFAULT_HEAVY_REQUEST_PERCENTAGE = 0;
export const DEFAULT_HEAVY_REQUEST_SIZE_KB = 50;
export const MAX_TRAFFIC_RPS = 1_000_000;
export const MAX_NODES = 40;
export const MAX_EDGES = 80;
export const MAX_NODE_ID_LENGTH = 80;
export const MAX_NODE_INSTANCES = 1_000;
export const MAX_NODE_CAPACITY_RPS = 1_000_000;
export const MAX_NODE_LATENCY_MS = 600_000;
export const MAX_NODE_QUEUE_SIZE = 1_000_000;
export const MAX_NODE_TIMEOUT_MS = 600_000;
export const MAX_NODE_COST = 1_000_000;
export const MAX_NODE_BANDWIDTH_MBPS = 1_000_000;
export const MAX_REQUEST_SIZE_KB = 1_000_000;

export function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeInteger(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Math.round(Number(value ?? fallback));
  const normalized = Math.max(min, Number.isFinite(parsed) ? parsed : fallback);
  return Math.min(max, normalized);
}

function normalizeNumber(value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number(value ?? fallback);
  const normalized = Math.max(min, Number.isFinite(parsed) ? parsed : fallback);
  return Math.min(max, normalized);
}

export function makeNode(kind, x, y, idx = 1) {
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

export function canConnect(sourceKind, targetKind) {
  return ALLOWED_CONNECTIONS[sourceKind]?.includes(targetKind) ?? false;
}

export function createsCycle(fromId, toId, edges) {
  const outgoing = {};

  edges.forEach((edge) => {
    outgoing[edge.from] = [...(outgoing[edge.from] ?? []), edge.to];
  });
  outgoing[fromId] = [...(outgoing[fromId] ?? []), toId];

  const visited = new Set();
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

export function assertAcyclic(edges) {
  const outgoing = new Map();

  for (const edge of edges) {
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
  }

  const visited = new Set();
  const visiting = new Set();

  function visit(nodeId) {
    if (visiting.has(nodeId)) return false;
    if (visited.has(nodeId)) return true;

    visiting.add(nodeId);

    for (const targetId of outgoing.get(nodeId) ?? []) {
      if (!visit(targetId)) return false;
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return true;
  }

  for (const nodeId of outgoing.keys()) {
    if (!visit(nodeId)) {
      throw createHttpError(400, "El proyecto no puede guardar conexiones con ciclos.");
    }
  }
}

export function validateConnection(source, target, edges) {
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

function connectionErrorMessage(sourceKind) {
  return sourceKind === "database"
    ? "Esta conexión no es válida para el MVP. La base de datos no puede ser origen de tráfico."
    : "Esta conexión no es válida para el MVP. El flujo debe ir desde entrada, distribución, procesamiento y almacenamiento.";
}

export function normalizeProjectGraph(rawNodes, rawEdges, options = {}) {
  const requirePosition = options.requirePosition ?? false;
  const nodesInput = Array.isArray(rawNodes) ? rawNodes : [];
  const edgesInput = Array.isArray(rawEdges) ? rawEdges : [];

  if (nodesInput.length > MAX_NODES) {
    throw createHttpError(400, `El proyecto no puede tener más de ${MAX_NODES} nodos.`);
  }

  if (edgesInput.length > MAX_EDGES) {
    throw createHttpError(400, `El proyecto no puede tener más de ${MAX_EDGES} conexiones.`);
  }

  const nodeIds = new Set();
  const nodes = nodesInput.map((node, index) => {
    const id = String(node.id ?? "").trim();
    const kind = String(node.kind ?? "").trim();
    const name = String(node.name ?? "Componente").trim() || "Componente";
    const x = Number(node.x ?? 0);
    const y = Number(node.y ?? 0);

    if (!id) {
      throw createHttpError(400, `El nodo ${index + 1} no tiene id.`);
    }

    if (id.length > MAX_NODE_ID_LENGTH) {
      throw createHttpError(400, `El id del nodo ${index + 1} es demasiado largo.`);
    }

    if (nodeIds.has(id)) {
      throw createHttpError(400, `El nodo ${id} está duplicado.`);
    }

    if (!NODE_KINDS.has(kind)) {
      throw createHttpError(400, `Tipo de componente inválido: ${kind || "sin tipo"}.`);
    }

    if (requirePosition && (!Number.isFinite(x) || !Number.isFinite(y))) {
      throw createHttpError(400, `El nodo ${id} tiene una posición inválida.`);
    }

    nodeIds.add(id);

    return {
      id,
      kind,
      name: name.slice(0, 120),
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      instances: normalizeInteger(node.instances, 1, 1, MAX_NODE_INSTANCES),
      capacity: normalizeInteger(node.capacity, 1, 1, MAX_NODE_CAPACITY_RPS),
      baseLatency: normalizeInteger(node.baseLatency, 0, 0, MAX_NODE_LATENCY_MS),
      queueSize: normalizeInteger(node.queueSize, 0, 0, MAX_NODE_QUEUE_SIZE),
      timeout: normalizeInteger(node.timeout, 0, 0, MAX_NODE_TIMEOUT_MS),
      costPerInstance: normalizeNumber(node.costPerInstance, 0, 0, MAX_NODE_COST),
      bandwidthMbps: normalizeNumber(
        node.bandwidthMbps,
        KIND_META[kind].defaults.bandwidthMbps,
        0,
        MAX_NODE_BANDWIDTH_MBPS,
      ),
    };
  });

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edgeIds = new Set();
  const edgePairs = new Set();
  const edges = edgesInput.map((edge, index) => {
    const id = String(edge.id ?? "").trim() || `edge-${index}`;
    const from = String(edge.from ?? "").trim();
    const to = String(edge.to ?? "").trim();

    if (id.length > MAX_NODE_ID_LENGTH) {
      throw createHttpError(400, `El id de la conexión ${index + 1} es demasiado largo.`);
    }

    if (edgeIds.has(id)) {
      throw createHttpError(400, `La conexión ${id} está duplicada.`);
    }

    if (!nodeById.has(from) || !nodeById.has(to)) {
      throw createHttpError(400, `La conexión ${id} referencia nodos inexistentes.`);
    }

    if (from === to) {
      throw createHttpError(400, `La conexión ${id} apunta al mismo nodo.`);
    }

    const pairKey = `${from}->${to}`;

    if (edgePairs.has(pairKey)) {
      throw createHttpError(400, `La conexión ${pairKey} está duplicada.`);
    }

    const sourceKind = nodeById.get(from).kind;
    const targetKind = nodeById.get(to).kind;

    if (!canConnect(sourceKind, targetKind)) {
      throw createHttpError(400, `La conexión ${sourceKind} -> ${targetKind} no es válida.`);
    }

    edgeIds.add(id);
    edgePairs.add(pairKey);

    return {
      id,
      from,
      to,
      async: Boolean(edge.async),
    };
  });

  assertAcyclic(edges);

  return { nodes, edges };
}

export function statusFor(load, errorRate = 0) {
  if (errorRate > 0) return "error";
  if (load >= 1.0) return "saturated";
  if (load >= 0.9) return "high_load";
  if (load >= 0.7) return "warning";
  return "healthy";
}

export function calculateLatency(baseLatency, load) {
  if (load < 0.7) return baseLatency;
  if (load < 0.9) return Math.round(baseLatency * 1.5);
  if (load <= 1) return Math.round(baseLatency * 2);
  return Math.round(baseLatency * 3);
}

export function calculateNodeCapacity(instances, capacityPerInstance) {
  return Math.max(0, Number(instances) || 0) * Math.max(0, Number(capacityPerInstance) || 0);
}

export function normalizeRequestProfile(profile = {}) {
  return {
    averageRequestSizeKb: normalizeNumber(
      profile.averageRequestSizeKb,
      DEFAULT_AVERAGE_REQUEST_SIZE_KB,
      0,
      MAX_REQUEST_SIZE_KB,
    ),
    heavyRequestPercentage: normalizeNumber(
      profile.heavyRequestPercentage,
      DEFAULT_HEAVY_REQUEST_PERCENTAGE,
      0,
      100,
    ),
    heavyRequestSizeKb: normalizeNumber(
      profile.heavyRequestSizeKb,
      DEFAULT_HEAVY_REQUEST_SIZE_KB,
      0,
      MAX_REQUEST_SIZE_KB,
    ),
  };
}

export function calculateEffectiveRequestSizeKb(profile = {}) {
  const normalized = normalizeRequestProfile(profile);
  const heavyFraction = normalized.heavyRequestPercentage / 100;

  return (
    normalized.averageRequestSizeKb * (1 - heavyFraction) +
    normalized.heavyRequestSizeKb * heavyFraction
  );
}

export function calculateTrafficMBps(trafficRps, requestSizeKb) {
  return (Math.max(0, Number(trafficRps) || 0) * Math.max(0, Number(requestSizeKb) || 0)) / 1024;
}

export function calculateBandwidthCapacityRps(bandwidthMbps, requestSizeKb) {
  const bandwidth = Math.max(0, Number(bandwidthMbps) || 0);
  const size = Math.max(0, Number(requestSizeKb) || 0);

  if (size === 0) return Number.POSITIVE_INFINITY;

  return (bandwidth / 8) * (1024 / size);
}

export function saturationReasonFor({ saturatedByRps, saturatedByBandwidth }) {
  if (saturatedByRps && saturatedByBandwidth) return "rps_and_bandwidth";
  if (saturatedByRps) return "rps";
  if (saturatedByBandwidth) return "bandwidth";
  return "none";
}

export function calculateNodeTrafficMetrics({
  trafficRps,
  instances,
  capacityPerInstance,
  bandwidthMbps = Number.POSITIVE_INFINITY,
  averageRequestSizeKb = DEFAULT_AVERAGE_REQUEST_SIZE_KB,
  heavyRequestPercentage = DEFAULT_HEAVY_REQUEST_PERCENTAGE,
  heavyRequestSizeKb = DEFAULT_HEAVY_REQUEST_SIZE_KB,
}) {
  const incoming = Math.max(0, Number(trafficRps) || 0);
  const capacity = calculateNodeCapacity(instances, capacityPerInstance);
  const effectiveRequestSizeKb = calculateEffectiveRequestSizeKb({
    averageRequestSizeKb,
    heavyRequestPercentage,
    heavyRequestSizeKb,
  });
  const incomingMBps = calculateTrafficMBps(incoming, effectiveRequestSizeKb);
  const throughputMbps = incomingMBps * 8;
  const bandwidthLimit = Math.max(0, Number(bandwidthMbps) || 0);
  const bandwidthCapacity = calculateBandwidthCapacityRps(bandwidthLimit, effectiveRequestSizeKb);
  const effectiveCapacity = Math.min(capacity, bandwidthCapacity);
  const throughput = Math.min(incoming, effectiveCapacity);
  const dropped = Math.max(0, incoming - throughput);
  const load = Math.max(
    capacity > 0 ? incoming / capacity : 0,
    bandwidthLimit > 0
      ? throughputMbps / bandwidthLimit
      : incoming > 0
        ? Number.POSITIVE_INFINITY
        : 0,
  );
  const errorRate = incoming > 0 ? dropped / incoming : 0;
  const saturatedByRps = incoming > capacity;
  const saturatedByBandwidth = throughputMbps > bandwidthLimit;
  const saturationReason = saturationReasonFor({ saturatedByRps, saturatedByBandwidth });

  return {
    incoming,
    capacity,
    bandwidthMbps: bandwidthLimit,
    bandwidthLoad: bandwidthLimit > 0 ? throughputMbps / bandwidthLimit : 0,
    incomingMBps,
    throughputMbps,
    effectiveRequestSizeKb,
    load,
    throughput,
    dropped,
    errorRate,
    saturationReason,
    status: statusFor(load, errorRate),
  };
}

export function recommendInstancesForTraffic(
  trafficRps,
  capacityPerInstance,
  currentInstances = 1,
) {
  const capacity = Math.max(1, Number(capacityPerInstance) || 1);
  const current = Math.max(1, Math.round(Number(currentInstances) || 1));
  const required = Math.max(1, Math.ceil(Math.max(0, Number(trafficRps) || 0) / capacity));

  return Math.max(current, required);
}

export function calculateCacheMissTraffic(throughputRps, hitRate = CACHE_HIT_RATE) {
  const throughput = Math.max(0, Number(throughputRps) || 0);
  const normalizedHitRate = Math.min(1, Math.max(0, Number(hitRate) || 0));

  return throughput * (1 - normalizedHitRate);
}

function buildFlowMaps(nodes, edges) {
  const incoming = {};
  const outgoing = {};

  nodes.forEach((node) => {
    incoming[node.id] = [];
    outgoing[node.id] = [];
  });

  edges.forEach((edge) => {
    if (incoming[edge.to]) incoming[edge.to].push(edge.from);
    if (outgoing[edge.from]) outgoing[edge.from].push(edge);
  });

  return { incoming, outgoing };
}

function findSourceNodes(nodes, incoming) {
  const gatewaySources = nodes.filter((node) => node.kind === "api_gateway");
  const fallbackSources = nodes.filter((node) => incoming[node.id]?.length === 0);

  return gatewaySources.length
    ? gatewaySources
    : fallbackSources.length
      ? fallbackSources
      : nodes.slice(0, 1);
}

export function simulate(nodes, edges, trafficRps, requestProfile = {}) {
  const normalizedRequestProfile = normalizeRequestProfile(requestProfile);
  const effectiveRequestSizeKb = calculateEffectiveRequestSizeKb(normalizedRequestProfile);
  const { incoming, outgoing } = buildFlowMaps(nodes, edges);
  const sources = findSourceNodes(nodes, incoming);
  const cycleCount = SIMULATION_CYCLES;
  const sourceTraffic = Math.max(0, trafficRps);
  const perCycleSourceTraffic = sourceTraffic / Math.max(sources.length, 1);
  const queued = {};
  const nextIncoming = {};
  const totalsByNode = {};

  nodes.forEach((node) => {
    queued[node.id] = 0;
    nextIncoming[node.id] = 0;
    totalsByNode[node.id] = { incoming: 0, throughput: 0, queued: 0, dropped: 0 };
  });

  const cycleSnapshots = [];

  for (let cycle = 1; cycle <= cycleCount; cycle += 1) {
    const cycleIncoming = {};
    const cycleThroughput = {};
    const cycleQueued = {};
    const cycleDropped = {};
    const propagated = {};

    nodes.forEach((node) => {
      cycleIncoming[node.id] = nextIncoming[node.id] ?? 0;
      cycleThroughput[node.id] = 0;
      cycleQueued[node.id] = 0;
      cycleDropped[node.id] = 0;
      propagated[node.id] = 0;
    });

    sources.forEach((node) => {
      cycleIncoming[node.id] += perCycleSourceTraffic;
    });

    nodes.forEach((node) => {
      const totalCapacity = Math.max(0, node.capacity * node.instances);
      const totalBandwidthMbps = Math.max(
        0,
        normalizeNumber(
          node.bandwidthMbps,
          KIND_META[node.kind]?.defaults.bandwidthMbps ?? 100,
          0,
          MAX_NODE_BANDWIDTH_MBPS,
        ) * node.instances,
      );
      const bandwidthCapacity = calculateBandwidthCapacityRps(
        totalBandwidthMbps,
        effectiveRequestSizeKb,
      );
      const effectiveCapacity = Math.min(totalCapacity, bandwidthCapacity);
      const totalOffered = cycleIncoming[node.id] + queued[node.id];
      const throughput = Math.min(totalOffered, effectiveCapacity);
      const excess = Math.max(0, totalOffered - throughput);
      const retained = Math.min(excess, Math.max(0, node.queueSize));
      const dropped = Math.max(0, excess - retained);
      const outs = outgoing[node.id] ?? [];
      const trafficToPropagate =
        node.kind === "cache" ? calculateCacheMissTraffic(throughput) : throughput;
      const share = outs.length ? trafficToPropagate / outs.length : 0;

      queued[node.id] = retained;
      cycleThroughput[node.id] = throughput;
      cycleQueued[node.id] = retained;
      cycleDropped[node.id] = dropped;

      totalsByNode[node.id].incoming += totalOffered;
      totalsByNode[node.id].throughput += throughput;
      totalsByNode[node.id].queued += retained;
      totalsByNode[node.id].dropped += dropped;

      outs.forEach((edge) => {
        propagated[edge.to] = (propagated[edge.to] ?? 0) + share;
      });
    });

    Object.keys(nextIncoming).forEach((nodeId) => {
      nextIncoming[nodeId] = propagated[nodeId] ?? 0;
    });

    cycleSnapshots.push({
      cycle,
      incoming: cycleIncoming,
      throughput: cycleThroughput,
      queued: cycleQueued,
      dropped: cycleDropped,
    });
  }

  const perNode = {};
  let weightedLatency = 0;
  let totalCost = 0;
  let totalDropped = 0;
  let bottleneck;

  nodes.forEach((node) => {
    const totalCap = Math.max(0, node.capacity * node.instances);
    const nodeTotals = totalsByNode[node.id];
    const averageIncoming = nodeTotals.incoming / cycleCount;
    const averageThroughput = nodeTotals.throughput / cycleCount;
    const averageQueued = nodeTotals.queued / cycleCount;
    const averageDropped = nodeTotals.dropped / cycleCount;
    const totalBandwidthMbps = Math.max(
      0,
      normalizeNumber(
        node.bandwidthMbps,
        KIND_META[node.kind]?.defaults.bandwidthMbps ?? 100,
        0,
        MAX_NODE_BANDWIDTH_MBPS,
      ) * node.instances,
    );
    const incomingMBps = calculateTrafficMBps(averageIncoming, effectiveRequestSizeKb);
    const throughputMBps = calculateTrafficMBps(averageThroughput, effectiveRequestSizeKb);
    const throughputMbps = throughputMBps * 8;
    const rpsLoad = totalCap > 0 ? averageIncoming / totalCap : 0;
    const bandwidthLoad =
      totalBandwidthMbps > 0
        ? (incomingMBps * 8) / totalBandwidthMbps
        : averageIncoming > 0
          ? Number.POSITIVE_INFINITY
          : 0;
    const load = Math.max(rpsLoad, bandwidthLoad);
    const errorRate =
      averageIncoming > 0 ? Math.max(0, averageDropped) / Math.max(averageIncoming, 1) : 0;
    const saturatedByRps = averageIncoming > totalCap;
    const saturatedByBandwidth = incomingMBps * 8 > totalBandwidthMbps;
    const saturationReason = saturationReasonFor({ saturatedByRps, saturatedByBandwidth });
    const latency = calculateLatency(node.baseLatency, load);
    const status = statusFor(load, errorRate);
    const cost = node.costPerInstance * node.instances;

    perNode[node.id] = {
      incoming: averageIncoming,
      capacity: totalCap,
      bandwidthMbps: totalBandwidthMbps,
      bandwidthLoad,
      incomingMBps,
      throughputMbps,
      effectiveRequestSizeKb,
      saturationReason,
      load,
      throughput: averageThroughput,
      queued: averageQueued,
      dropped: averageDropped,
      latency,
      errorRate,
      status,
      cost,
    };

    if (averageIncoming > 0) {
      weightedLatency += latency * Math.max(averageThroughput, 1);
    }

    totalCost += cost;
    totalDropped += nodeTotals.dropped;

    if (averageIncoming > 0 && (!bottleneck || load > bottleneck.load)) {
      const reason =
        load >= 1
          ? `recibe ${Math.round(averageIncoming)} req/s contra ${Math.round(totalCap)} req/s de capacidad`
          : `es el nodo activo con mayor carga (${Math.round(load * 100)}%)`;
      bottleneck = { id: node.id, name: node.name, load, reason };
    }
  });

  const activeMetrics = Object.values(perNode).filter((metrics) => metrics.incoming > 0);
  const totalSourceTraffic = sourceTraffic * cycleCount;
  const errorRate =
    totalSourceTraffic > 0 ? Math.min(1, Math.max(0, totalDropped / totalSourceTraffic)) : 0;
  const throughput = sourceTraffic > 0 ? Math.max(0, sourceTraffic * (1 - errorRate)) : 0;
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
      incomingMBps: calculateTrafficMBps(sourceTraffic, effectiveRequestSizeKb),
      throughputMbps: calculateTrafficMBps(throughput, effectiveRequestSizeKb) * 8,
      effectiveRequestSizeKb,
      cost: totalCost,
      cycles: cycleCount,
      bottleneck: bottleneck
        ? { id: bottleneck.id, name: bottleneck.name, reason: bottleneck.reason }
        : undefined,
    },
    cycles: cycleSnapshots,
  };
}

export function normalizeSimulationPayload(payload = {}) {
  const traffic = normalizeInteger(payload.traffic, 0, 0, MAX_TRAFFIC_RPS);
  const graph = normalizeProjectGraph(payload.nodes, payload.edges);
  const requestProfile = normalizeRequestProfile(payload);

  return {
    traffic,
    nodes: graph.nodes,
    edges: graph.edges,
    ...requestProfile,
  };
}
