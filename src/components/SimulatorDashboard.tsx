import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KIND_META,
  makeNode,
  simulate,
  validateConnection,
  type NodeKind,
  type SimEdge,
  type SimNode,
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
  AlertTriangle,
  TrendingUp,
  CircleDollarSign,
  Zap,
  Plus,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  FolderX,
  MoreVertical,
  Copy,
  Eraser,
  LogOut,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/models/auth";
import { projectService, type ProjectSummary } from "@/services/projectService";
import { simulationService } from "@/services/simulationService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectionsPanel } from "@/components/simulator/ConnectionsPanel";
import { Metric } from "@/components/simulator/Metric";
import { PropertiesPanel } from "@/components/simulator/PropertiesPanel";
import { ResizeHandle } from "@/components/simulator/ResizeHandle";
import { SystemConclusion } from "@/components/simulator/SystemConclusion";
import { buildSystemConclusion } from "@/components/simulator/systemConclusionLogic";
import {
  CATEGORIES,
  initialEdges,
  initialNodes,
  NODE_H,
  NODE_W,
  STATUS_STYLES,
} from "@/components/simulator/simulatorConfig";

interface SimulatorDashboardProps {
  user?: AuthUser;
  onLogout?: () => void;
}

export default function SimulatorDashboard({ user, onLogout }: SimulatorDashboardProps) {
  const [nodes, setNodes] = useState<SimNode[]>(initialNodes);
  const [edges, setEdges] = useState<SimEdge[]>(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>("n_app");
  const [traffic, setTraffic] = useState(600);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState("plataforma-checkout.v1");
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [backendResult, setBackendResult] = useState<SimResult | null>(null);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(256);
  const [rightWidth, setRightWidth] = useState(360);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; offX: number; offY: number } | null>(null);
  const pendingDragRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const resizeRef = useRef<{ side: "left" | "right"; startX: number; startW: number } | null>(null);
  const canEdit = user?.role !== "viewer";
  const roleLabel =
    user?.role === "viewer" ? "Lector" : user?.role === "admin" ? "Admin" : "Arquitecto";

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

  const localResult = useMemo(() => simulate(nodes, edges, traffic), [nodes, edges, traffic]);
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
      const savedProjects = await projectService.list();
      setProjects(savedProjects);
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

  useEffect(() => {
    const controller = new AbortController();
    setBackendResult(null);
    const timeoutId = window.setTimeout(() => {
      simulationService
        .run(
          {
            nodes,
            edges,
            traffic,
          },
          controller.signal,
        )
        .then((nextResult) => {
          setBackendResult(nextResult);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setBackendResult(null);
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [nodes, edges, traffic]);

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
    setPersistenceError(null);
    setPersistenceMessage(null);

    try {
      if (!user?.email) {
        setPersistenceError("Iniciá sesión para cargar proyectos.");
        return;
      }

      const project = await projectService.get(id);
      setProjectId(project.id);
      setProjectName(project.name);
      setTraffic(project.incomingTrafficRps);
      setNodes(project.nodes);
      setEdges(project.edges);
      setSelectedId(project.nodes[0]?.id ?? null);
      setConnectingFromId(null);
      setPersistenceMessage("Proyecto cargado.");
    } catch (error) {
      setPersistenceError(
        error instanceof Error ? error.message : "No se pudo cargar el proyecto.",
      );
    }
  };

  const startNewProject = () => {
    if (!canEdit) {
      setPersistenceError("El rol lector solo puede ver proyectos guardados.");
      return;
    }

    setProjectId(null);
    setProjectName("nuevo-proyecto");
    setNodes([]);
    setEdges([]);
    setTraffic(600);
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
      const normalizedProjectName = projectName.trim();

      if (!normalizedProjectName) {
        setPersistenceError("Poné un nombre para guardar el proyecto.");
        return;
      }

      if (!nodes.length) {
        setPersistenceError("Agregá al menos un componente antes de guardar.");
        return;
      }

      const project = await projectService.save({
        id: projectId,
        user,
        name: normalizedProjectName,
        traffic,
        running: true,
        nodes,
        edges,
      });

      setProjectId(project.id);
      setProjectName(project.name);
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

    if (!user?.email || !projectId) return;

    setIsSaving(true);
    setPersistenceError(null);
    setPersistenceMessage(null);

    try {
      await projectService.remove(projectId);
      setProjectId(null);
      setProjectName("nuevo-proyecto");
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

  const duplicateProject = () => {
    if (!canEdit) {
      setPersistenceError("El rol lector no puede duplicar proyectos.");
      return;
    }

    setProjectId(null);
    setProjectName(`${projectName.trim() || "proyecto"}-copia`);
    setConnectingFromId(null);
    setPersistenceMessage("Proyecto duplicado como copia sin guardar.");
    setPersistenceError(null);
  };

  const clearCanvas = () => {
    if (!canEdit) {
      setPersistenceError("El rol lector no puede limpiar el canvas.");
      return;
    }

    setNodes([]);
    setEdges([]);
    setSelectedId(null);
    setConnectingFromId(null);
    setPersistenceMessage("Canvas limpio.");
    setPersistenceError(null);
    draggingRef.current = null;
  };

  const deleteSelected = () => {
    if (!selected || !canEdit) return;
    const selectedNodeId = selected.id;

    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) => prev.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId));
    setSelectedId(null);
    setConnectingFromId((value) => (value === selectedNodeId ? null : value));
    draggingRef.current = null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:h-screen">
      {/* ---------- Barra superior ---------- */}
      <header className="flex shrink-0 flex-col gap-3 border-b border-border/60 bg-panel/75 px-3 py-3 backdrop-blur lg:min-h-14 lg:flex-row lg:items-center lg:justify-between lg:px-4">
        <div className="flex min-w-0 items-center gap-3 lg:flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--neon-cyan)]/15 ring-1 ring-[color:var(--neon-cyan)]/40">
            <Activity className="h-4 w-4 text-[color:var(--neon-cyan)]" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">Simulador</div>
            <div className="mt-1 flex min-w-0 flex-col gap-1.5 font-mono text-[11px] text-muted-foreground sm:mt-0.5 sm:flex-row sm:items-center sm:gap-2">
              <span className="shrink-0">Proyecto actual:</span>
              <Input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
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
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2 font-mono text-[11px]",
                canEdit
                  ? "border-[color:var(--neon-cyan)]/40 text-[color:var(--neon-cyan)]"
                  : "border-[color:var(--neon-amber)]/45 text-[color:var(--neon-amber)]",
              )}
              title={canEdit ? "Puede editar proyectos" : "Solo lectura"}
            >
              {!canEdit && <Eye className="h-3.5 w-3.5" />}
              {roleLabel}
            </span>
          )}
          <select
            value={projectId ?? ""}
            onChange={(event) => {
              const nextProjectId = Number(event.target.value);
              if (nextProjectId) void loadProject(nextProjectId);
            }}
            disabled={isLoadingProjects || !projects.length}
            className="h-8 min-w-0 max-w-full shrink rounded-md border border-border/60 bg-card/70 px-2 font-mono text-[11px] text-foreground outline-none transition hover:border-[color:var(--neon-cyan)]/50 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-48"
            title="Cargar proyecto guardado"
          >
            <option value="">Proyectos guardados</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
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
            className="shrink-0 bg-[color:var(--neon-cyan)]/15 text-[color:var(--neon-cyan)] ring-1 ring-[color:var(--neon-cyan)]/50 hover:bg-[color:var(--neon-cyan)]/25"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" /> {isSaving ? "Guardando..." : "Guardar"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 shrink-0 px-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={duplicateProject} disabled={!canEdit}>
                <Copy className="h-4 w-4" />
                Duplicar proyecto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearCanvas} disabled={!canEdit}>
                <Eraser className="h-4 w-4" />
                Limpiar canvas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={deleteCurrentProject}
                disabled={!projectId || isSaving || !canEdit}
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

      {(persistenceMessage || persistenceError) && (
        <div className="pointer-events-none fixed inset-x-3 bottom-6 z-50 flex justify-center">
          <div
            className={cn(
              "max-w-[min(92vw,520px)] rounded-lg border px-4 py-3 text-center text-sm shadow-2xl backdrop-blur",
              persistenceError
                ? "border-[color:var(--status-saturated)]/50 bg-[color:var(--status-saturated)]/15 text-[color:var(--status-saturated)]"
                : "border-[color:var(--neon-cyan)]/45 bg-panel/90 text-[color:var(--neon-cyan)]",
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
              className="relative hidden shrink-0 flex-col gap-4 overflow-y-auto border-r border-border/60 bg-panel/50 p-3 lg:flex"
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
                          onDragStart={(e) => onLibDragStart(e, kind)}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-md border border-border/60 bg-card/60 px-2.5 py-2 text-sm transition",
                            canEdit
                              ? "cursor-grab hover:border-[color:var(--neon-cyan)]/50 hover:bg-card active:cursor-grabbing"
                              : "cursor-not-allowed opacity-60",
                          )}
                        >
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-md ring-1"
                            style={{
                              backgroundColor: `color-mix(in oklab, ${meta.color} 12%, transparent)`,
                              boxShadow: `0 0 0 1px color-mix(in oklab, ${meta.color} 40%, transparent)`,
                            }}
                          >
                            <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
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
                    className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-border/60 bg-card/70 px-3 text-xs transition hover:border-[color:var(--neon-cyan)]/50 hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                    <span className="max-w-28 truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            ref={canvasRef}
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
                      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                    />
                  </g>
                );
              })}
            </svg>

            {!nodes.length && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-sm rounded-lg border border-border/60 bg-panel/80 p-5 text-center shadow-[var(--shadow-glow-cyan)] backdrop-blur">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[color:var(--neon-cyan)]/15 ring-1 ring-[color:var(--neon-cyan)]/45">
                    <Plus className="h-5 w-5 text-[color:var(--neon-cyan)]" />
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
              const meta = KIND_META[n.kind];
              const Icon = NODE_ICON[n.kind];
              const isSelected = n.id === selectedId;
              const isConnectingSource = n.id === connectingFromId;
              const showAlert = status === "saturated" || status === "error";
              return (
                <div
                  key={n.id}
                  onMouseDown={(e) => onNodeMouseDown(e, n)}
                  className={cn(
                    "group absolute select-none rounded-xl bg-card/90 ring-1 backdrop-blur transition-all",
                    canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default",
                    styles.ring,
                    styles.glow,
                    isSelected &&
                      "outline outline-2 outline-offset-2 outline-[color:var(--neon-cyan)]/70",
                    isConnectingSource &&
                      "outline outline-2 outline-offset-4 outline-[color:var(--neon-amber)]",
                  )}
                  style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
                >
                  {showAlert && (
                    <div className="alert-blink absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[color:var(--status-saturated)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--status-saturated)] ring-1 ring-[color:var(--status-saturated)]/60">
                      {status === "error" ? "Con errores" : "Tráfico excedido"}
                    </div>
                  )}
                  <div className="flex h-full flex-col justify-between p-3.5">
                    <div className="flex items-start justify-between">
                      <div
                        className="pulse-glow flex h-9 w-9 items-center justify-center rounded-md"
                        style={{
                          color: meta.color,
                          backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
                          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${meta.color} 40%, transparent)`,
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {styles.label}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold leading-tight">{n.name}</div>
                      <div className="mt-1 flex min-w-0 flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] leading-4 text-muted-foreground">
                        <span>{n.instances}x</span>
                        <span>{n.capacity} r/s</span>
                        <span className="text-[color:var(--neon-cyan)]">
                          {((m?.load ?? 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="font-mono text-[10px] leading-4 text-muted-foreground/80">
                        cola {(m?.queued ?? 0).toFixed(0)} r/s · error{" "}
                        {((m?.errorRate ?? 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Barra de carga */}
                  <div className="absolute inset-x-2 bottom-1 h-1 overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((m?.load ?? 0) * 100, 100)}%`,
                        background:
                          status === "healthy"
                            ? "var(--neon-cyan)"
                            : status === "warning" || status === "high_load"
                              ? "var(--status-warning)"
                              : "var(--status-saturated)",
                        boxShadow: `0 0 8px ${
                          status === "healthy" ? "var(--neon-cyan)" : "var(--status-saturated)"
                        }`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Control de tráfico */}
            <div className="absolute left-3 top-3 w-[min(18rem,calc(100vw-1.5rem))] rounded-lg border border-border/60 bg-panel/80 p-3 backdrop-blur sm:left-4 sm:top-4 sm:w-72">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Tráfico entrante
                  </Label>
                  <div className="mt-1 font-mono text-xs text-[color:var(--neon-cyan)]">
                    {traffic} req/s
                  </div>
                </div>
              </div>
              <Slider
                value={[traffic]}
                onValueChange={(v) => setTraffic(v[0])}
                min={50}
                max={4000}
                step={50}
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Métricas inferiores */}
          <div className="grid shrink-0 grid-cols-1 gap-3 border-t border-border/60 bg-panel/50 p-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            <Metric
              label="Tráfico total"
              value={`${Math.round(traffic)} req/s`}
              icon={Zap}
              accent="cyan"
            />
            <Metric
              label="Latencia prom."
              value={`${result.totals.avgLatency.toFixed(0)} ms`}
              icon={Activity}
              accent={result.totals.avgLatency > 200 ? "warn" : "cyan"}
            />
            <Metric
              label="Salida procesada"
              value={`${result.totals.throughput.toFixed(0)} r/s`}
              icon={TrendingUp}
              accent="violet"
            />
            <Metric
              label="Tasa de error"
              value={`${(result.totals.errorRate * 100).toFixed(1)}%`}
              icon={AlertTriangle}
              accent={result.totals.errorRate > 0.05 ? "warn" : "cyan"}
            />
            <Metric
              label="Costo mensual est."
              value={`$${result.totals.cost.toFixed(0)}`}
              icon={CircleDollarSign}
              accent="amber"
            />
          </div>

          <SystemConclusion conclusion={conclusion} />

          <section className="border-t border-border/60 bg-panel/60 p-3 lg:hidden">
            {selected ? (
              <PropertiesPanel
                node={selected}
                onChange={updateSelected}
                onDelete={deleteSelected}
                metrics={result.perNode[selected.id]}
                readOnly={!canEdit}
              />
            ) : (
              <div className="rounded-lg border border-border/60 bg-card/60 p-3 text-sm text-muted-foreground">
                Seleccioná un componente del canvas para editarlo.
              </div>
            )}
          </section>
        </main>

        {/* Panel derecho + control */}
        {rightOpen && (
          <>
            <ResizeHandle onMouseDown={startResize("right")} />
            <aside
              style={{ width: rightWidth }}
              className="relative hidden shrink-0 flex-col gap-4 overflow-y-auto border-l border-border/60 bg-panel/50 p-4 lg:flex"
            >
              {selected ? (
                <PropertiesPanel
                  node={selected}
                  onChange={updateSelected}
                  onDelete={deleteSelected}
                  metrics={result.perNode[selected.id]}
                  readOnly={!canEdit}
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  Seleccioná un componente para configurarlo.
                </div>
              )}
            </aside>
          </>
        )}
      </div>

      {/* Floating toggle buttons */}
      <button
        type="button"
        onClick={() => setLeftOpen((v) => !v)}
        title={leftOpen ? "Ocultar biblioteca" : "Mostrar biblioteca"}
        className="fixed left-2 top-1/2 z-30 hidden h-9 w-6 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-border/60 bg-panel/90 text-muted-foreground shadow-lg backdrop-blur transition hover:bg-card hover:text-[color:var(--neon-cyan)] lg:flex"
      >
        {leftOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => setRightOpen((v) => !v)}
        title={rightOpen ? "Ocultar propiedades" : "Mostrar propiedades"}
        className="fixed right-2 top-1/2 z-30 hidden h-9 w-6 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-border/60 bg-panel/90 text-muted-foreground shadow-lg backdrop-blur transition hover:bg-card hover:text-[color:var(--neon-cyan)] lg:flex"
      >
        {rightOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
}
