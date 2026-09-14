import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_AVERAGE_REQUEST_SIZE_KB,
  DEFAULT_HEAVY_REQUEST_PERCENTAGE,
  DEFAULT_HEAVY_REQUEST_SIZE_KB,
  KIND_META,
  makeNode,
  simulate,
  validateConnection,
  type NodeKind,
  type SimEdge,
  type SimNode,
  type RequestProfile,
  type SimResult,
} from "@/lib/simulator";
import { NODE_ICON } from "@/lib/node-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Save,
  Activity,
  Zap,
  Plus,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  FolderX,
  MoreVertical,
  LogOut,
  Eye,
  FileText,
  GitCompareArrows,
  History,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UsuarioAutenticado } from "@/models/auth";
import {
  projectService,
  type ProjectSummary,
  type ScenarioVersionSummary,
  type VersionSnapshot,
} from "@/services/projectService";
import { simulationService } from "@/services/simulationService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectionsPanel } from "@/components/simulator/ConnectionsPanel";
import { PropertiesPanel } from "@/components/simulator/PropertiesPanel";
import { ResizeHandle } from "@/components/simulator/ResizeHandle";
import { SystemConclusion } from "@/components/simulator/SystemConclusion";
import { buildSystemConclusion } from "@/components/simulator/systemConclusionLogic";
import { ModelLimitations } from "@/components/simulator/DecisionBlocks";
import { VersionHistoryPanel } from "@/components/simulator/VersionHistoryPanel";
import { WorkspaceState } from "@/components/simulator/WorkspaceState";
import {
  CATEGORIES,
  initialEdges,
  initialNodes,
  NODE_H,
  NODE_W,
  STATUS_STYLES,
} from "@/components/simulator/simulatorConfig";

interface SimulatorDashboardProps {
  user?: UsuarioAutenticado;
  onLogout?: () => void | Promise<void>;
}

type WorkspaceTab = "properties" | "versions" | "compare" | "report";
type SimulationState = "loading" | "backend" | "local" | "snapshot";

interface DraftState {
  nodes: SimNode[];
  edges: SimEdge[];
  traffic: number;
  requestProfile: RequestProfile;
  selectedId: string | null;
  backendResult: SimResult | null;
}

function makeRequestProfile(
  averageRequestSizeKb = DEFAULT_AVERAGE_REQUEST_SIZE_KB,
  heavyRequestPercentage = DEFAULT_HEAVY_REQUEST_PERCENTAGE,
  heavyRequestSizeKb = DEFAULT_HEAVY_REQUEST_SIZE_KB,
): RequestProfile {
  return {
    averageRequestSizeKb,
    heavyRequestPercentage,
    heavyRequestSizeKb,
  };
}

function formatRequestSize(sizeKb: number) {
  if (sizeKb >= 1024) {
    const value = sizeKb / 1024;
    return value.toFixed(Number.isInteger(value) ? 0 : 1) + " MB";
  }

  return Math.round(sizeKb) + " KB";
}

function CompactSlider({
  label,
  value,
  sliderValue,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  sliderValue: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5 px-1 py-1">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <Label className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {label}
        </Label>
        <span className="shrink-0 font-mono text-[11px] text-[color:var(--neon-cyan)]">
          {value}
        </span>
      </div>
      <Slider
        value={[sliderValue]}
        onValueChange={(nextValue) => onChange(nextValue[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  );
}

export default function SimulatorDashboard({ user, onLogout }: SimulatorDashboardProps) {
  const [nodes, setNodes] = useState<SimNode[]>(initialNodes);
  const [edges, setEdges] = useState<SimEdge[]>(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>("n_app");
  const [traffic, setTraffic] = useState(600);
  const [requestProfile, setRequestProfile] = useState<RequestProfile>(() => makeRequestProfile());
  const [proyectoId, setProyectoId] = useState<number | null>(null);
  const [nombreProyecto, setNombreProyecto] = useState("plataforma-checkout.v1");
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [proyectosGuardados, setProyectosGuardados] = useState<ProjectSummary[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [backendResult, setBackendResult] = useState<SimResult | null>(null);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("properties");
  const [versions, setVersions] = useState<ScenarioVersionSummary[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [previewVersionId, setPreviewVersionId] = useState<number | null>(null);
  const [simulationState, setSimulationState] = useState<SimulationState>("loading");
  const [leftWidth, setLeftWidth] = useState(224);
  const [rightWidth, setRightWidth] = useState(336);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; offX: number; offY: number } | null>(null);
  const pendingDragRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const resizeRef = useRef<{ side: "left" | "right"; startX: number; startW: number } | null>(null);
  const draftBeforePreviewRef = useRef<DraftState | null>(null);
  const canManageProjects = Boolean(user && user.rol !== "lector");
  const canEdit = canManageProjects && !previewVersionId;
  const roleLabel =
    user?.rol === "lector" ? "Lector" : user?.rol === "administrador" ? "Admin" : "Arquitecto";

  useEffect(() => {
    return () => {
      if (dragFrameRef.current) {
        window.cancelAnimationFrame(dragFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!persistenceMessage && !persistenceError) return;

    const timeoutId = window.setTimeout(() => {
      setPersistenceMessage(null);
      setPersistenceError(null);
    }, 10000);

    return () => window.clearTimeout(timeoutId);
  }, [persistenceMessage, persistenceError]);

  // Sidebar resize handlers (window-level so it keeps working over the canvas)
  const startResize = (side: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = {
      side,
      startX: e.clientX,
      startW: side === "left" ? leftWidth : rightWidth,
    };
    const onMove = (ev: MouseEvent) => {
      const r = resizeRef.current;
      if (!r) return;
      const delta = ev.clientX - r.startX;
      if (r.side === "left") {
        setLeftWidth(Math.max(160, Math.min(480, r.startW + delta)));
      } else {
        setRightWidth(Math.max(320, Math.min(560, r.startW - delta)));
      }
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const localResult = useMemo(
    () => simulate(nodes, edges, traffic, requestProfile),
    [nodes, edges, traffic, requestProfile],
  );
  const result = backendResult ?? localResult;
  const selected = nodes.find((n) => n.id === selectedId) ?? null;
  const conclusion = useMemo(
    () => buildSystemConclusion(nodes, result, traffic),
    [nodes, result, traffic],
  );

  const refreshProjects = useCallback(async () => {
    if (!user?.email) return;

    setIsLoadingProjects(true);
    try {
      const proyectos = await projectService.list();
      setProyectosGuardados(proyectos);
    } catch (error) {
      setPersistenceError(
        error instanceof Error ? error.message : "No se pudieron listar proyectos.",
      );
    } finally {
      setIsLoadingProjects(false);
    }
  }, [user?.email]);

  useEffect(() => {
    void refreshProjects();
  }, [refreshProjects]);

  const refreshVersions = useCallback(
    async (projectId: number | null) => {
      if (!projectId || !user?.email) {
        setVersions([]);
        setVersionsError(null);
        return;
      }

      setIsLoadingVersions(true);
      setVersionsError(null);
      try {
        setVersions(await projectService.listVersions(projectId));
      } catch (error) {
        setVersionsError(
          error instanceof Error ? error.message : "No se pudieron listar versiones.",
        );
      } finally {
        setIsLoadingVersions(false);
      }
    },
    [user?.email],
  );

  useEffect(() => {
    void refreshVersions(proyectoId);
  }, [proyectoId, refreshVersions]);

  useEffect(() => {
    if (previewVersionId) {
      setSimulationState("snapshot");
      return;
    }

    const controller = new AbortController();
    setBackendResult(null);
    setSimulationState("loading");
    const timeoutId = window.setTimeout(() => {
      simulationService
        .run(
          {
            nodos: nodes,
            conexiones: edges,
            trafico: traffic,
            ...requestProfile,
          },
          controller.signal,
        )
        .then((nextResult) => {
          setBackendResult(nextResult);
          setSimulationState("backend");
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setBackendResult(null);
          setSimulationState("local");
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [nodes, edges, traffic, requestProfile, previewVersionId]);

  // ---------- Drag nodes on canvas ----------
  const onNodeMouseDown = (e: React.MouseEvent, n: SimNode) => {
    setSelectedId(n.id);

    if (!canEdit) return;

    if (connectingFromId) {
      e.preventDefault();
      if (connectingFromId === n.id) {
        setConnectingFromId(null);
        setPersistenceMessage("Conexión cancelada.");
        return;
      }

      connectNodes(connectingFromId, n.id);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    draggingRef.current = {
      id: n.id,
      offX: e.clientX - rect.left - n.x,
      offY: e.clientY - rect.top - n.y,
    };
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    const drag = draggingRef.current;
    if (!drag) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(8, Math.min(rect.width - NODE_W - 8, e.clientX - rect.left - drag.offX));
    const y = Math.max(8, Math.min(rect.height - NODE_H - 8, e.clientY - rect.top - drag.offY));
    pendingDragRef.current = { id: drag.id, x, y };

    if (dragFrameRef.current) return;

    dragFrameRef.current = window.requestAnimationFrame(() => {
      const pending = pendingDragRef.current;
      dragFrameRef.current = null;
      if (!pending) return;

      setNodes((prev) =>
        prev.map((n) => (n.id === pending.id ? { ...n, x: pending.x, y: pending.y } : n)),
      );
    });
  };
  const stopDrag = () => {
    draggingRef.current = null;
    pendingDragRef.current = null;
  };

  // ---------- Library drag & drop (HTML5) ----------
  const onLibDragStart = (e: React.DragEvent, kind: NodeKind) => {
    if (!canEdit) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData("application/x-node-kind", kind);
    e.dataTransfer.effectAllowed = "copy";
  };

  const addNodeToCanvas = (kind: NodeKind, position?: { x: number; y: number }) => {
    if (!canEdit) return;

    const idx = nodes.filter((n) => n.kind === kind).length + 1;
    const fallbackOffset = Math.min(idx - 1, 5) * 28;
    const node = {
      ...makeNode(
        kind,
        position?.x ?? 96 + fallbackOffset,
        position?.y ?? 120 + fallbackOffset,
        idx,
      ),
    };

    setNodes((prev) => [...prev, node]);
    setSelectedId(node.id);
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const kind = e.dataTransfer.getData("application/x-node-kind") as NodeKind;
    if (!kind || !KIND_META[kind]) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - NODE_W / 2;
    const y = e.clientY - rect.top - NODE_H / 2;
    addNodeToCanvas(kind, { x, y });
  };

  const updateSelected = (patch: Partial<SimNode>) => {
    if (!selected || !canEdit) return;
    setNodes((prev) => prev.map((n) => (n.id === selected.id ? { ...n, ...patch } : n)));
  };

  const connectNodes = (fromId: string, toId: string) => {
    if (!canEdit) return;

    const fromNode = nodes.find((node) => node.id === fromId);
    const toNode = nodes.find((node) => node.id === toId);

    if (!fromNode || !toNode || fromId === toId) {
      setConnectingFromId(null);
      return;
    }

    const validation = validateConnection(fromNode, toNode, edges);
    if (!validation.valid) {
      setConnectingFromId(null);
      setPersistenceError(validation.message);
      return;
    }

    const edge: SimEdge = {
      id: `e_${fromId}_${toId}_${Date.now().toString(36)}`,
      from: fromId,
      to: toId,
      async: validation.isAsync,
    };

    setEdges((prev) => [...prev, edge]);
    setSelectedId(toId);
    setConnectingFromId(null);
    setPersistenceMessage(`${fromNode.name} conectado con ${toNode.name}.`);
    setPersistenceError(null);
  };

  const loadProject = async (id: number) => {
    draftBeforePreviewRef.current = null;
    setPreviewVersionId(null);
    setPersistenceError(null);
    setPersistenceMessage(null);

    try {
      if (!user?.email) {
        setPersistenceError("Iniciá sesión para cargar proyectos.");
        return;
      }

      const proyecto = await projectService.get(id);
      setProyectoId(proyecto.id);
      setNombreProyecto(proyecto.nombre);
      setTraffic(proyecto.traficoEntranteRps);
      setRequestProfile(
        makeRequestProfile(
          proyecto.averageRequestSizeKb,
          proyecto.heavyRequestPercentage,
          proyecto.heavyRequestSizeKb,
        ),
      );
      setNodes(proyecto.nodos);
      setEdges(proyecto.conexiones);
      setSelectedId(proyecto.nodos[0]?.id ?? null);
      setConnectingFromId(null);
      setPersistenceMessage("Proyecto cargado.");
    } catch (error) {
      setPersistenceError(
        error instanceof Error ? error.message : "No se pudo cargar el proyecto.",
      );
    }
  };

  const startNewProject = () => {
    if (!canManageProjects) {
      setPersistenceError("El rol lector solo puede ver proyectos guardados.");
      return;
    }

    draftBeforePreviewRef.current = null;
    setPreviewVersionId(null);
    setWorkspaceTab("properties");
    setProyectoId(null);
    setNombreProyecto("nuevo-proyecto");
    setNodes([]);
    setEdges([]);
    setTraffic(600);
    setRequestProfile(makeRequestProfile());
    setSelectedId(null);
    setConnectingFromId(null);
    setPersistenceMessage("Nuevo proyecto listo.");
    setPersistenceError(null);
    draggingRef.current = null;
  };

  const saveProject = async () => {
    if (!canEdit) {
      setPersistenceError("El rol lector no puede guardar cambios.");
      return;
    }

    if (!user) {
      setPersistenceError("Iniciá sesión para guardar proyectos.");
      return;
    }

    setIsSaving(true);
    setPersistenceError(null);
    setPersistenceMessage(null);

    try {
      const nombreProyectoNormalizado = nombreProyecto.trim();

      if (!nombreProyectoNormalizado) {
        setPersistenceError("Poné un nombre para guardar el proyecto.");
        return;
      }

      if (!nodes.length) {
        setPersistenceError("Agregá al menos un componente antes de guardar.");
        return;
      }

      const proyecto = await projectService.save({
        id: proyectoId,
        usuario: user,
        nombre: nombreProyectoNormalizado,
        trafico: traffic,
        ...requestProfile,
        estaEjecutando: true,
        nodos: nodes,
        conexiones: edges,
      });

      setProyectoId(proyecto.id);
      setNombreProyecto(proyecto.nombre);
      setPersistenceMessage("Proyecto guardado.");
      await refreshProjects();
    } catch (error) {
      setPersistenceError(
        error instanceof Error ? error.message : "No se pudo guardar el proyecto.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCurrentProject = async () => {
    if (!canEdit) {
      setPersistenceError("El rol lector no puede borrar proyectos.");
      return;
    }

    if (!user?.email || !proyectoId) return;
    if (
      !window.confirm(`Borrar ${nombreProyecto}? También se eliminará su historial de versiones.`)
    )
      return;

    setIsSaving(true);
    setPersistenceError(null);
    setPersistenceMessage(null);

    try {
      await projectService.remove(proyectoId);
      setProyectoId(null);
      setNombreProyecto("nuevo-proyecto");
      setNodes([]);
      setEdges([]);
      setSelectedId(null);
      setConnectingFromId(null);
      setPersistenceMessage("Proyecto eliminado.");
      await refreshProjects();
    } catch (error) {
      setPersistenceError(
        error instanceof Error ? error.message : "No se pudo eliminar el proyecto.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSelected = () => {
    if (!selected || !canEdit) return;
    if (!window.confirm(`Eliminar ${selected.name}? También se quitarán sus conexiones.`)) return;
    const selectedNodeId = selected.id;

    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) => prev.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId));
    setSelectedId(null);
    setConnectingFromId((value) => (value === selectedNodeId ? null : value));
    draggingRef.current = null;
  };

  const createVersion = async (name: string, description: string) => {
    if (!proyectoId || !canManageProjects || previewVersionId) return false;

    setIsCreatingVersion(true);
    setVersionsError(null);
    try {
      const snapshot: VersionSnapshot = {
        schemaVersion: 1,
        nodes,
        edges,
        traffic,
        ...requestProfile,
        result,
      };
      await projectService.createVersion(proyectoId, { name, description, snapshot });
      await refreshVersions(proyectoId);
      setPersistenceMessage("Versión guardada sin modificar el proyecto actual.");
      return true;
    } catch (error) {
      setVersionsError(error instanceof Error ? error.message : "No se pudo guardar la versión.");
      return false;
    } finally {
      setIsCreatingVersion(false);
    }
  };

  const openVersion = async (versionId: number) => {
    if (!proyectoId) return;

    setVersionsError(null);
    setIsLoadingVersions(true);
    try {
      const version = await projectService.getVersion(proyectoId, versionId);
      if (!draftBeforePreviewRef.current) {
        draftBeforePreviewRef.current = {
          nodes,
          edges,
          traffic,
          requestProfile,
          selectedId,
          backendResult,
        };
      }
      setNodes(version.snapshot.nodes);
      setEdges(version.snapshot.edges);
      setTraffic(version.snapshot.traffic);
      setRequestProfile(
        makeRequestProfile(
          version.snapshot.averageRequestSizeKb,
          version.snapshot.heavyRequestPercentage,
          version.snapshot.heavyRequestSizeKb,
        ),
      );
      setSelectedId(version.snapshot.nodes[0]?.id ?? null);
      setBackendResult(version.snapshot.result);
      setPreviewVersionId(version.id);
      setPersistenceMessage(`Versión ${version.name} abierta en modo lectura.`);
    } catch (error) {
      setVersionsError(error instanceof Error ? error.message : "No se pudo abrir la versión.");
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const closeVersionPreview = () => {
    const draft = draftBeforePreviewRef.current;
    if (!draft) return;
    setNodes(draft.nodes);
    setEdges(draft.edges);
    setTraffic(draft.traffic);
    setRequestProfile(draft.requestProfile);
    setSelectedId(draft.selectedId);
    setBackendResult(draft.backendResult);
    draftBeforePreviewRef.current = null;
    setPreviewVersionId(null);
    setPersistenceMessage("Volviste al estado actual del proyecto.");
  };

  const renderWorkspacePanel = () => {
    if (workspaceTab === "versions") {
      return (
        <VersionHistoryPanel
          projectId={proyectoId}
          versions={versions}
          loading={isLoadingVersions}
          creating={isCreatingVersion}
          error={versionsError}
          canCreate={canManageProjects && !previewVersionId}
          previewVersionId={previewVersionId}
          onCreate={createVersion}
          onOpen={(versionId) => void openVersion(versionId)}
          onClosePreview={closeVersionPreview}
        />
      );
    }

    if (workspaceTab === "compare") {
      return (
        <WorkspaceState
          kind="empty"
          title="Comparación preparada"
          detail="La siguiente fase permitirá seleccionar dos versiones del mismo proyecto y ver deltas técnicos y estructurales."
        />
      );
    }

    if (workspaceTab === "report") {
      return (
        <div className="space-y-3">
          <WorkspaceState
            kind="empty"
            title="Informe en la fase posterior"
            detail="El informe imprimible se habilitará después de completar la comparación."
          />
          <ModelLimitations>
            Stressflow es un modelo educativo de diseño temprano. El informe explicará supuestos y
            no presentará estos resultados como mediciones de producción.
          </ModelLimitations>
        </div>
      );
    }

    return selected ? (
      <PropertiesPanel
        node={selected}
        onChange={updateSelected}
        onDelete={deleteSelected}
        metrics={result.perNode[selected.id]}
        readOnly={!canEdit}
      />
    ) : (
      <WorkspaceState
        kind="empty"
        title="Seleccioná un componente"
        detail="Elegí un nodo del canvas para revisar configuración y resultado."
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:h-screen">
      {/* ---------- Barra superior ---------- */}
      <header className="flex shrink-0 flex-col gap-3 border-b border-border/50 bg-panel px-3 py-2.5 lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:px-4">
        <div className="flex min-w-0 items-center gap-3 lg:flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-muted-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">Simulador</div>
            <div className="mt-1 flex min-w-0 flex-col gap-1.5 font-mono text-[11px] text-muted-foreground sm:mt-0.5 sm:flex-row sm:items-center sm:gap-2">
              <span className="shrink-0">Proyecto actual:</span>
              <Input
                value={nombreProyecto}
                onChange={(event) => setNombreProyecto(event.target.value)}
                readOnly={!canEdit}
                className="h-7 min-w-0 border-border/50 bg-card/50 px-2 font-mono text-[11px] sm:w-56"
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
          {user?.email && (
            <span className="hidden max-w-44 shrink-0 truncate font-mono text-[11px] text-muted-foreground sm:block">
              {user.email}
            </span>
          )}
          {user && (
            <span
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border/60 px-2 font-mono text-[11px] text-muted-foreground",
                !canManageProjects && "text-[color:var(--status-warning)]",
              )}
              title={canManageProjects ? "Puede editar proyectos" : "Solo lectura"}
            >
              {!canManageProjects && <Eye className="h-3.5 w-3.5" />}
              {roleLabel}
            </span>
          )}
          <select
            value={proyectoId ?? ""}
            onChange={(event) => {
              const nextProjectId = Number(event.target.value);
              if (nextProjectId) void loadProject(nextProjectId);
            }}
            disabled={isLoadingProjects || !proyectosGuardados.length}
            className="h-8 min-w-0 max-w-full shrink rounded-md border border-border/60 bg-card px-2 font-mono text-[11px] text-foreground outline-none transition hover:border-white/15 focus:border-[color:var(--neon-cyan)]/45 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-48"
            title="Cargar proyecto guardado"
          >
            <option value="">Proyectos guardados</option>
            {proyectosGuardados.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="ghost"
            onClick={startNewProject}
            disabled={!canEdit}
            className="shrink-0"
          >
            <FilePlus2 className="mr-1.5 h-3.5 w-3.5" /> Nuevo
          </Button>
          <Button
            size="sm"
            onClick={saveProject}
            disabled={isSaving || !canEdit}
            className="shrink-0"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" /> {isSaving ? "Guardando..." : "Guardar"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 shrink-0 px-0"
                aria-label="Abrir acciones del proyecto"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={deleteCurrentProject}
                disabled={!proyectoId || isSaving || !canEdit}
                className="text-[color:var(--status-saturated)] focus:text-[color:var(--status-saturated)]"
              >
                <FolderX className="h-4 w-4" />
                Borrar proyecto
              </DropdownMenuItem>
              {onLogout && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <nav
        className="flex shrink-0 items-center gap-3 overflow-x-auto border-b border-border/45 bg-panel px-3"
        aria-label="Herramientas del escenario"
      >
        {[
          { id: "properties" as const, label: "Propiedades", icon: SlidersHorizontal },
          { id: "versions" as const, label: "Versiones", icon: History },
          { id: "compare" as const, label: "Comparar", icon: GitCompareArrows },
          { id: "report" as const, label: "Informe", icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setWorkspaceTab(id);
              setRightOpen(true);
            }}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 border-b-2 border-transparent px-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground transition hover:text-foreground",
              workspaceTab === id && "border-[color:var(--neon-cyan)] text-foreground",
            )}
            aria-current={workspaceTab === id ? "page" : undefined}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
        <div className="ml-auto flex shrink-0 items-center gap-2 border-l border-border/60 pl-3 font-mono text-[10px] text-muted-foreground">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              simulationState === "backend" && "bg-muted-foreground",
              simulationState === "local" && "bg-[color:var(--neon-amber)]",
              simulationState === "snapshot" && "bg-[color:var(--neon-violet)]",
              simulationState === "loading" && "animate-pulse bg-muted-foreground",
            )}
          />
          {simulationState === "backend" && "Motor backend"}
          {simulationState === "local" && "Cálculo local"}
          {simulationState === "snapshot" && "Snapshot histórico"}
          {simulationState === "loading" && "Recalculando"}
        </div>
      </nav>

      {(persistenceMessage || persistenceError) && (
        <div className="pointer-events-none fixed inset-x-3 bottom-6 z-50 flex justify-center">
          <div
            className={cn(
              "max-w-[min(92vw,520px)] rounded-lg border px-4 py-3 text-center text-sm shadow-lg backdrop-blur",
              persistenceError
                ? "border-[color:var(--status-saturated)]/50 bg-[color:var(--status-saturated)]/15 text-[color:var(--status-saturated)]"
                : "border-border/70 bg-panel/95 text-foreground",
            )}
            role={persistenceError ? "alert" : "status"}
          >
            {persistenceError ?? persistenceMessage}
          </div>
        </div>
      )}

      {/* ---------- Layout principal ---------- */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Panel lateral */}
        {leftOpen && (
          <>
            <aside
              style={{ width: leftWidth }}
              className="relative hidden shrink-0 flex-col gap-3 overflow-y-auto border-r border-border/45 bg-panel p-3 lg:flex"
            >
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Biblioteca de componentes
                </div>
                <p className="mt-1 text-xs text-muted-foreground/80">Arrastrá al lienzo</p>
              </div>
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {cat.name}
                  </div>
                  <div className="space-y-1.5">
                    {cat.kinds.map((kind) => {
                      const meta = KIND_META[kind];
                      const Icon = NODE_ICON[kind];
                      return (
                        <div
                          key={kind}
                          draggable={canEdit}
                          role="button"
                          tabIndex={canEdit ? 0 : -1}
                          aria-label={`Agregar ${meta.label} al canvas`}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              addNodeToCanvas(kind);
                            }
                          }}
                          onDragStart={(e) => onLibDragStart(e, kind)}
                          className={cn(
                            "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition",
                            canEdit
                              ? "cursor-grab hover:bg-card hover:text-foreground active:cursor-grabbing"
                              : "cursor-not-allowed opacity-60",
                          )}
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-card text-muted-foreground">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="flex-1 truncate">{meta.label}</span>
                          <Plus className="h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <ConnectionsPanel
                nodes={nodes}
                edges={edges}
                selected={selected}
                connectingFromId={connectingFromId}
                onStartConnection={() => {
                  if (!canEdit) {
                    setPersistenceError("El rol lector no puede crear conexiones.");
                    return;
                  }

                  if (!selected) return;
                  setConnectingFromId(selected.id);
                  setPersistenceMessage(
                    `Elegí el componente destino para conectar ${selected.name}.`,
                  );
                  setPersistenceError(null);
                }}
                onCancelConnection={() => {
                  setConnectingFromId(null);
                  setPersistenceMessage("Conexión cancelada.");
                }}
                onDeleteConnection={(edgeId) => {
                  if (!canEdit) {
                    setPersistenceError("El rol lector no puede eliminar conexiones.");
                    return;
                  }

                  setEdges((prev) => prev.filter((edge) => edge.id !== edgeId));
                  setPersistenceMessage("Conexión eliminada.");
                  setPersistenceError(null);
                }}
              />
            </aside>
            {/* Control de tamaño izquierdo */}
            <ResizeHandle onMouseDown={startResize("left")} />
          </>
        )}

        {/* Lienzo + métricas inferiores */}
        <main className="relative flex min-h-[680px] min-w-0 flex-1 flex-col overflow-x-auto lg:min-h-0 lg:overflow-x-visible">
          <div className="border-b border-border/60 bg-panel/45 p-2 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.flatMap((cat) => cat.kinds).map((kind) => {
                const meta = KIND_META[kind];
                const Icon = NODE_ICON[kind];
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => addNodeToCanvas(kind)}
                    disabled={!canEdit}
                    className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-card px-3 text-xs text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="max-w-28 truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            ref={canvasRef}
            role="region"
            aria-label="Canvas de arquitectura del sistema"
            onMouseMove={onCanvasMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={onCanvasDrop}
            className="canvas-grid relative min-h-[520px] min-w-[1080px] flex-1 overflow-hidden lg:min-h-0 lg:min-w-0"
          >
            {/* Conexiones SVG */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <defs>
                <marker
                  id="arrow-cyan"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M0,0 L10,5 L0,10 z" fill="var(--neon-cyan)" />
                </marker>
                <marker
                  id="arrow-warn"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M0,0 L10,5 L0,10 z" fill="var(--status-saturated)" />
                </marker>
              </defs>
              {edges.map((e) => {
                const a = nodes.find((n) => n.id === e.from);
                const b = nodes.find((n) => n.id === e.to);
                if (!a || !b) return null;
                const x1 = a.x + NODE_W;
                const y1 = a.y + NODE_H / 2;
                const x2 = b.x;
                const y2 = b.y + NODE_H / 2;
                const mx = (x1 + x2) / 2;
                const path = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
                const downstreamLoad = result.perNode[e.to]?.load ?? 0;
                const hot = downstreamLoad >= 1;
                const color = hot ? "var(--status-saturated)" : "var(--neon-cyan)";
                return (
                  <g key={e.id}>
                    <path
                      d={path}
                      stroke={color}
                      strokeOpacity={0.25}
                      strokeWidth={2}
                      fill="none"
                    />
                    <path
                      d={path}
                      stroke={color}
                      strokeWidth={2}
                      fill="none"
                      strokeLinecap="round"
                      className={cn("flow-line", hot && "fast", e.async && "slow")}
                      markerEnd={hot ? "url(#arrow-warn)" : "url(#arrow-cyan)"}
                    />
                  </g>
                );
              })}
            </svg>

            {!nodes.length && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-sm rounded-xl border border-border/50 bg-panel/95 p-5 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-card text-muted-foreground">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold">Canvas listo para construir</div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Agregá componentes desde la biblioteca y guardá el proyecto cuando tengas una
                    arquitectura base.
                  </p>
                </div>
              </div>
            )}

            {/* Nodos */}
            {nodes.map((n) => {
              const m = result.perNode[n.id];
              const status = m?.status ?? "healthy";
              const styles = STATUS_STYLES[status];
              const Icon = NODE_ICON[n.kind];
              const isSelected = n.id === selectedId;
              const isConnectingSource = n.id === connectingFromId;
              return (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.name}. ${styles.label}. Seleccionar componente`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(n.id);
                      setWorkspaceTab("properties");
                      setRightOpen(true);
                    }
                  }}
                  onMouseDown={(e) => onNodeMouseDown(e, n)}
                  className={cn(
                    "group absolute select-none rounded-xl bg-card ring-1 transition-all",
                    canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                    styles.ring,
                    styles.glow,
                    isSelected &&
                      "outline outline-2 outline-offset-2 outline-[color:var(--neon-cyan)]/65",
                    isConnectingSource &&
                      "outline outline-2 outline-offset-4 outline-[color:var(--neon-amber)]",
                  )}
                  style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
                >
                  <div className="flex h-full flex-col justify-between px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 truncate text-sm font-medium">{n.name}</div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                        <span className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
                          {styles.label}
                        </span>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      Carga {((m?.load ?? 0) * 100).toFixed(0)}% · Error{" "}
                      {((m?.errorRate ?? 0) * 100).toFixed(1)}%
                    </div>
                  </div>

                  {/* Barra de carga */}
                  <div className="absolute inset-x-3 bottom-1.5 h-0.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((m?.load ?? 0) * 100, 100)}%`,
                        background:
                          status === "healthy"
                            ? "var(--muted-foreground)"
                            : status === "warning" || status === "high_load"
                              ? "var(--status-warning)"
                              : "var(--status-saturated)",
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Panel flotante de tráfico */}
            <div className="absolute left-3 top-3 z-20 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border/50 bg-panel/95 p-2.5 backdrop-blur sm:left-4 sm:top-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Tráfico
                  </Label>
                  <div className="mt-1 font-mono text-xs text-foreground">
                    {traffic} req/s · {formatRequestSize(requestProfile.averageRequestSizeKb)}
                  </div>
                </div>
              </div>
              <div className="mt-2 grid gap-2 px-0.5 sm:grid-cols-2">
                <CompactSlider
                  label="Solicitudes por segundo"
                  value={traffic + " req/s"}
                  sliderValue={traffic}
                  min={50}
                  max={4000}
                  step={50}
                  disabled={!canEdit}
                  onChange={(value) => setTraffic(value)}
                />
                <CompactSlider
                  label="Tamaño promedio de solicitud"
                  value={formatRequestSize(requestProfile.averageRequestSizeKb)}
                  sliderValue={requestProfile.averageRequestSizeKb}
                  min={1}
                  max={2048}
                  step={1}
                  disabled={!canEdit}
                  onChange={(value) =>
                    setRequestProfile((current) => ({ ...current, averageRequestSizeKb: value }))
                  }
                />
              </div>
            </div>
          </div>

          <SystemConclusion conclusion={conclusion} />

          <section className="border-t border-border/60 bg-panel/60 p-3 lg:hidden">
            {renderWorkspacePanel()}
          </section>
        </main>

        {/* Panel derecho + control */}
        {rightOpen && (
          <>
            <ResizeHandle onMouseDown={startResize("right")} />
            <aside
              style={{ width: rightWidth }}
              className="relative hidden shrink-0 flex-col gap-4 overflow-y-auto border-l border-border/45 bg-panel p-4 lg:flex"
              aria-label="Panel contextual del escenario"
            >
              {renderWorkspacePanel()}
            </aside>
          </>
        )}
      </div>

      {/* Floating toggle buttons */}
      <button
        type="button"
        onClick={() => setLeftOpen((v) => !v)}
        title={leftOpen ? "Ocultar biblioteca" : "Mostrar biblioteca"}
        aria-label={leftOpen ? "Ocultar biblioteca" : "Mostrar biblioteca"}
        className="fixed left-2 top-1/2 z-30 hidden h-9 w-6 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-border/60 bg-panel/90 text-muted-foreground backdrop-blur transition hover:bg-card hover:text-[color:var(--neon-cyan)] lg:flex"
      >
        {leftOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => setRightOpen((v) => !v)}
        title={rightOpen ? "Ocultar panel contextual" : "Mostrar panel contextual"}
        aria-label={rightOpen ? "Ocultar panel contextual" : "Mostrar panel contextual"}
        className="fixed right-2 top-1/2 z-30 hidden h-9 w-6 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-border/60 bg-panel/90 text-muted-foreground backdrop-blur transition hover:bg-card hover:text-[color:var(--neon-cyan)] lg:flex"
      >
        {rightOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
}
