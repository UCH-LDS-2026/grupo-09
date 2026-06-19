import type { UsuarioAutenticado } from "@/models/auth";
import type { SimEdge, SimNode } from "@/lib/simulator";
import { authService } from "@/services/authService";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export interface ProjectSummary {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  traficoEntranteRps: number;
  estaEjecutando: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface SavedProject extends ProjectSummary {
  nodos: SimNode[];
  conexiones: SimEdge[];
}

interface SaveProjectPayload {
  id: number | null;
  usuario: UsuarioAutenticado;
  nombre: string;
  trafico: number;
  estaEjecutando: boolean;
  nodos: SimNode[];
  conexiones: SimEdge[];
}

type TipoComponenteEspanol =
  | "puerta_enlace_api"
  | "balanceador_carga"
  | "servicio_aplicacion"
  | "cache"
  | "base_datos"
  | "cola";

const TIPO_COMPONENTE_A_FRONT = {
  puerta_enlace_api: "api_gateway",
  balanceador_carga: "load_balancer",
  servicio_aplicacion: "app_service",
  cache: "cache",
  base_datos: "database",
  cola: "queue",
} as const;

const TIPO_COMPONENTE_A_BACK = {
  api_gateway: "puerta_enlace_api",
  load_balancer: "balanceador_carga",
  app_service: "servicio_aplicacion",
  cache: "cache",
  database: "base_datos",
  queue: "cola",
} as const;

interface NodoDto {
  id: string;
  tipo: TipoComponenteEspanol;
  nombre: string;
  posicionX: number;
  posicionY: number;
  instancias: number;
  capacidadRps: number;
  latenciaBaseMs: number;
  tamanoCola: number;
  tiempoEsperaMs: number;
  costoPorInstancia: number;
}

interface ConexionDto {
  id: string;
  origen: string;
  destino: string;
  esAsincrona?: boolean;
}

interface ProyectoDto extends ProjectSummary {
  nodos?: NodoDto[];
  conexiones?: ConexionDto[];
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

function mapNodoDesdeDto(nodo: NodoDto): SimNode {
  return {
    id: nodo.id,
    kind: TIPO_COMPONENTE_A_FRONT[nodo.tipo],
    name: nodo.nombre,
    x: nodo.posicionX,
    y: nodo.posicionY,
    instances: nodo.instancias,
    capacity: nodo.capacidadRps,
    baseLatency: nodo.latenciaBaseMs,
    queueSize: nodo.tamanoCola,
    timeout: nodo.tiempoEsperaMs,
    costPerInstance: nodo.costoPorInstancia,
  };
}

function mapNodoParaDto(nodo: SimNode): NodoDto {
  return {
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
  };
}

function mapConexionDesdeDto(conexion: ConexionDto): SimEdge {
  return {
    id: conexion.id,
    from: conexion.origen,
    to: conexion.destino,
    async: conexion.esAsincrona,
  };
}

function mapConexionParaDto(conexion: SimEdge): ConexionDto {
  return {
    id: conexion.id,
    origen: conexion.from,
    destino: conexion.to,
    esAsincrona: conexion.async,
  };
}

function mapProyectoDesdeDto(proyecto: ProyectoDto): SavedProject {
  return {
    ...proyecto,
    nodos: (proyecto.nodos ?? []).map(mapNodoDesdeDto),
    conexiones: (proyecto.conexiones ?? []).map(mapConexionDesdeDto),
  };
}

export const projectService = {
  async list(): Promise<ProjectSummary[]> {
    const data = await requestJson<{ proyectos: ProjectSummary[] }>("/proyectos");
    return data.proyectos;
  },

  async get(id: number): Promise<SavedProject> {
    const data = await requestJson<{ proyecto: ProyectoDto }>(`/proyectos/${id}`);
    return mapProyectoDesdeDto(data.proyecto);
  },

  async save(payload: SaveProjectPayload): Promise<SavedProject> {
    const path = payload.id ? `/proyectos/${payload.id}` : "/proyectos";
    const method = payload.id ? "PUT" : "POST";
    const data = await requestJson<{ proyecto: ProyectoDto }>(path, {
      method,
      body: JSON.stringify({
        id: payload.id,
        usuario: payload.usuario,
        nombre: payload.nombre,
        trafico: payload.trafico,
        estaEjecutando: payload.estaEjecutando,
        nodos: payload.nodos.map(mapNodoParaDto),
        conexiones: payload.conexiones.map(mapConexionParaDto),
      }),
    });

    return mapProyectoDesdeDto(data.proyecto);
  },

  async remove(id: number): Promise<void> {
    await requestJson<{ eliminado: true }>(`/proyectos/${id}`, {
      method: "DELETE",
    });
  },
};
