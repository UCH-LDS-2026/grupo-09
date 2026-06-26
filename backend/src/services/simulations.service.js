import { normalizeSimulationPayload, simulate } from "../../../shared/simulator-core.js";

const TIPO_COMPONENTE_ES_A_SIMULADOR = {
  puerta_enlace_api: "api_gateway",
  balanceador_carga: "load_balancer",
  servicio_aplicacion: "app_service",
  cache: "cache",
  base_datos: "database",
  cola: "queue",
};

function mapNodePayloadToSimulator(node = {}) {
  return {
    id: node.id,
    kind: TIPO_COMPONENTE_ES_A_SIMULADOR[node.tipo],
    name: node.nombre,
    x: node.posicionX,
    y: node.posicionY,
    instances: node.instancias,
    capacity: node.capacidadRps,
    baseLatency: node.latenciaBaseMs,
    queueSize: node.tamanoCola,
    timeout: node.tiempoEsperaMs,
    costPerInstance: node.costoPorInstancia,
    bandwidthMbps: node.anchoBandaMbps,
  };
}

function mapEdgePayloadToSimulator(edge = {}) {
  return {
    id: edge.id,
    from: edge.origen,
    to: edge.destino,
    async: edge.esAsincrona,
  };
}

export function mapSimulationPayload(rawPayload = {}) {
  return {
    nodes: Array.isArray(rawPayload.nodos) ? rawPayload.nodos.map(mapNodePayloadToSimulator) : [],
    edges: Array.isArray(rawPayload.conexiones)
      ? rawPayload.conexiones.map(mapEdgePayloadToSimulator)
      : [],
    traffic: rawPayload.trafico,
    averageRequestSizeKb: rawPayload.averageRequestSizeKb,
    heavyRequestPercentage: rawPayload.heavyRequestPercentage,
    heavyRequestSizeKb: rawPayload.heavyRequestSizeKb,
  };
}

export function normalizeBackendSimulationPayload(rawPayload = {}) {
  return normalizeSimulationPayload(mapSimulationPayload(rawPayload));
}

export const simulationsService = {
  run(rawPayload) {
    const payload = normalizeBackendSimulationPayload(rawPayload);
    return simulate(payload.nodes, payload.edges, payload.traffic, {
      averageRequestSizeKb: payload.averageRequestSizeKb,
      heavyRequestPercentage: payload.heavyRequestPercentage,
      heavyRequestSizeKb: payload.heavyRequestSizeKb,
    });
  },
};
