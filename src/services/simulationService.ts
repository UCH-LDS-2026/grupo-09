import type { SimEdge, SimNode, SimResult } from "@/lib/simulator";
import { requestJson } from "@/services/httpClient";

interface RunSimulationPayload {
  nodos: SimNode[];
  conexiones: SimEdge[];
  trafico: number;
  averageRequestSizeKb: number;
  heavyRequestPercentage: number;
  heavyRequestSizeKb: number;
}

const TIPO_COMPONENTE_A_BACK = {
  api_gateway: "puerta_enlace_api",
  load_balancer: "balanceador_carga",
  app_service: "servicio_aplicacion",
  cache: "cache",
  database: "base_datos",
  queue: "cola",
} as const;

export const simulationService = {
  async run(payload: RunSimulationPayload, signal?: AbortSignal): Promise<SimResult> {
    const data = await requestJson<{ result: SimResult }>(
      "/simulaciones/ejecutar",
      {
        method: "POST",
        body: JSON.stringify({
          nodos: payload.nodos.map((nodo) => ({
            id: nodo.id,
            tipo: TIPO_COMPONENTE_A_BACK[nodo.kind],
            nombre: nodo.name,
            posicionX: nodo.x,
            posicionY: nodo.y,
            instancias: nodo.instances,
            capacidadRps: nodo.capacity,
            latenciaBaseMs: nodo.baseLatency,
            tamanoCola: nodo.queueSize,
            tiempoEsperaMs: nodo.timeout,
            costoPorInstancia: nodo.costPerInstance,
            anchoBandaMbps: nodo.bandwidthMbps,
          })),
          conexiones: payload.conexiones.map((conexion) => ({
            id: conexion.id,
            origen: conexion.from,
            destino: conexion.to,
            esAsincrona: conexion.async,
          })),
          trafico: payload.trafico,
          averageRequestSizeKb: payload.averageRequestSizeKb,
          heavyRequestPercentage: payload.heavyRequestPercentage,
          heavyRequestSizeKb: payload.heavyRequestSizeKb,
        }),
        signal,
      },
      "No se pudo completar la simulación.",
    );

    return data.result;
  },
};
