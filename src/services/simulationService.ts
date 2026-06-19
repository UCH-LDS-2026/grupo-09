import type { SimEdge, SimNode, SimResult } from "@/lib/simulator";
import { authService } from "@/services/authService";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

interface RunSimulationPayload {
  nodos: SimNode[];
  conexiones: SimEdge[];
  trafico: number;
}

const TIPO_COMPONENTE_A_BACK = {
  api_gateway: "puerta_enlace_api",
  load_balancer: "balanceador_carga",
  app_service: "servicio_aplicacion",
  cache: "cache",
  database: "base_datos",
  queue: "cola",
} as const;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = authService.getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? "No se pudo completar la simulación.";
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const simulationService = {
  async run(payload: RunSimulationPayload, signal?: AbortSignal): Promise<SimResult> {
    const data = await requestJson<{ result: SimResult }>("/simulaciones/ejecutar", {
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
        })),
        conexiones: payload.conexiones.map((conexion) => ({
          id: conexion.id,
          origen: conexion.from,
          destino: conexion.to,
          esAsincrona: conexion.async,
        })),
        trafico: payload.trafico,
      }),
      signal,
    });

    return data.result;
  },
};
