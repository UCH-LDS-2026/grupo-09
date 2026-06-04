import type { AuthUser } from "@/models/auth";
import type { SimEdge, SimNode } from "@/lib/simulator";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export interface ProjectSummary {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  incomingTrafficRps: number;
  isRunning: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedProject extends ProjectSummary {
  nodes: SimNode[];
  edges: SimEdge[];
}

interface SaveProjectPayload {
  id: number | null;
  user: AuthUser;
  name: string;
  traffic: number;
  running: boolean;
  nodes: SimNode[];
  edges: SimEdge[];
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
    const message = body?.error?.message ?? "No se pudo completar la operación.";
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const projectService = {
  async list(userEmail: string): Promise<ProjectSummary[]> {
    const params = new URLSearchParams({ userEmail });
    const data = await requestJson<{ projects: ProjectSummary[] }>(`/projects?${params}`);
    return data.projects;
  },

  async get(id: number, userEmail: string): Promise<SavedProject> {
    const params = new URLSearchParams({ userEmail });
    const data = await requestJson<{ project: SavedProject }>(`/projects/${id}?${params}`);
    return data.project;
  },

  async save(payload: SaveProjectPayload): Promise<SavedProject> {
    const path = payload.id ? `/projects/${payload.id}` : "/projects";
    const method = payload.id ? "PUT" : "POST";
    const data = await requestJson<{ project: SavedProject }>(path, {
      method,
      body: JSON.stringify(payload),
    });

    return data.project;
  },

  async remove(id: number, userEmail: string): Promise<void> {
    const params = new URLSearchParams({ userEmail });
    await requestJson<{ deleted: true }>(`/projects/${id}?${params}`, {
      method: "DELETE",
    });
  },
};
