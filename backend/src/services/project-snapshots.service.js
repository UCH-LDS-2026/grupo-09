import {
  MAX_TRAFFIC_RPS,
  normalizeProjectGraph,
  normalizeRequestProfile,
} from "../../../shared/simulator-core.js";

const SNAPSHOT_SCHEMA_VERSION = 1;
const MAX_SNAPSHOT_BYTES = 900 * 1024;

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function cloneJson(value, fallback = null) {
  if (value === undefined) return fallback;

  try {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) return fallback;
    if (Buffer.byteLength(serialized, "utf8") > MAX_SNAPSHOT_BYTES) {
      throw createHttpError(413, "El snapshot supera el tamaño máximo permitido.");
    }
    return JSON.parse(serialized);
  } catch (error) {
    if (error?.statusCode) throw error;
    throw createHttpError(400, "El snapshot contiene datos que no se pueden guardar.");
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

export function normalizeVersionSnapshot(rawSnapshot = {}) {
  if (!rawSnapshot || typeof rawSnapshot !== "object" || Array.isArray(rawSnapshot)) {
    throw createHttpError(400, "El snapshot de la versión es obligatorio.");
  }

  const cloned = cloneJson(rawSnapshot, {});
  const graph = normalizeProjectGraph(cloned.nodes ?? [], cloned.edges ?? [], {
    requirePosition: true,
  });
  if (!graph.nodes.length) {
    throw createHttpError(400, "El snapshot debe tener al menos un nodo.");
  }
  const requestProfile = normalizeRequestProfile(cloned);
  const traffic = Math.min(
    MAX_TRAFFIC_RPS,
    Math.max(0, Math.round(Number(cloned.traffic ?? 0) || 0)),
  );
  const schemaVersion = Math.max(
    SNAPSHOT_SCHEMA_VERSION,
    Math.round(Number(cloned.schemaVersion ?? SNAPSHOT_SCHEMA_VERSION) || SNAPSHOT_SCHEMA_VERSION),
  );

  const snapshot = {
    ...cloned,
    schemaVersion,
    nodes: graph.nodes,
    edges: graph.edges,
    traffic,
    ...requestProfile,
    result: cloneJson(cloned.result, null),
  };

  cloneJson(snapshot);
  return deepFreeze(snapshot);
}

export function buildVersionSummary(snapshot) {
  const totals = snapshot.result?.totals ?? {};
  return {
    trafficRps: snapshot.traffic,
    nodeCount: snapshot.nodes.length,
    avgLatencyMs: Number.isFinite(Number(totals.avgLatency)) ? Number(totals.avgLatency) : null,
    errorRate: Number.isFinite(Number(totals.errorRate)) ? Number(totals.errorRate) : null,
    monthlyCost: Number.isFinite(Number(totals.cost)) ? Number(totals.cost) : null,
  };
}
