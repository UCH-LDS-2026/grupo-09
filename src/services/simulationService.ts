import type { SimEdge, SimNode, SimResult } from "@/lib/simulator";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

interface RunSimulationPayload {
  nodes: SimNode[];
  edges: SimEdge[];
  traffic: number;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
    const data = await requestJson<{ result: SimResult }>("/simulations/run", {
      method: "POST",
      body: JSON.stringify(payload),
      signal,
    });

    return data.result;
  },
};
