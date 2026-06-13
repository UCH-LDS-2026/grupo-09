import type { AuthUser } from "@/models/auth";
import type { SimEdge, SimNode } from "@/lib/simulator";
import { authService } from "@/services/authService";

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
    const message = body?.error?.message ?? "No se pudo completar la operación.";
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const projectService = {
  async list(): Promise<ProjectSummary[]> {
    const data = await requestJson<{ projects: ProjectSummary[] }>("/projects");
    return data.projects;
  },

  async get(id: number): Promise<SavedProject> {
    const data = await requestJson<{ project: SavedProject }>(`/projects/${id}`);
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

  async remove(id: number): Promise<void> {
    await requestJson<{ deleted: true }>(`/projects/${id}`, {
      method: "DELETE",
    });
  },
};
