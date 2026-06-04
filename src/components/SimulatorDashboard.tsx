import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KIND_META,
  makeNode,
  simulate,
  validateConnection,
  type NodeKind,
  type SimEdge,
  type SimNode,
} from "@/lib/simulator";
import { NODE_ICON } from "@/lib/node-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Square,
  Save,
  Activity,
  AlertTriangle,
  TrendingUp,
  CircleDollarSign,
  Zap,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trash2,
  Copy,
  FilePlus2,
  FolderX,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/models/auth";
import { projectService, type ProjectSummary } from "@/services/projectService";

// ---------- Arquitectura inicial de ejemplo ----------
const initialNodes: SimNode[] = [
  { ...makeNode("api_gateway", 80, 220), id: "n_gw", name: "Puerta de enlace API" },
  { ...makeNode("load_balancer", 320, 220), id: "n_lb", name: "Balanceador de carga" },
  { ...makeNode("app_service", 580, 220), id: "n_app", name: "Servicio de aplicación" },
  { ...makeNode("cache", 860, 110), id: "n_cache", name: "Caché" },
  { ...makeNode("database", 860, 330), id: "n_db", name: "Base de datos" },
  { ...makeNode("queue", 580, 420), id: "n_queue", name: "Cola" },
];
const initialEdges: SimEdge[] = [
  { id: "e1", from: "n_gw", to: "n_lb" },
  { id: "e2", from: "n_lb", to: "n_app" },
  { id: "e3", from: "n_app", to: "n_cache" },
  { id: "e4", from: "n_app", to: "n_db" },
  { id: "e5", from: "n_app", to: "n_queue", async: true },
];

const NODE_W = 168;
const NODE_H = 92;

const STATUS_STYLES: Record<
  "healthy" | "warning" | "saturated" | "failed",
  { ring: string; glow: string; dot: string; label: string }
> = {
  healthy: {
    ring: "ring-[color:var(--neon-cyan)]/40",
    glow: "shadow-[var(--shadow-glow-cyan)]",
    dot: "bg-[color:var(--status-healthy)]",
    label: "Estable",
  },
  warning: {
    ring: "ring-[color:var(--status-warning)]/60",
    glow: "shadow-[var(--shadow-glow-warning)]",
    dot: "bg-[color:var(--status-warning)]",
    label: "Alerta",
  },
  saturated: {
    ring: "ring-[color:var(--status-saturated)]/70",
    glow: "shadow-[var(--shadow-glow-saturated)]",
    dot: "bg-[color:var(--status-saturated)]",
    label: "Saturado",
  },
  failed: {
    ring: "ring-[color:var(--status-failed)]/80",
    glow: "shadow-[var(--shadow-glow-saturated)]",
    dot: "bg-[color:var(--status-failed)]",
    label: "Falló",
  },
};

const CATEGORIES: { name: string; kinds: NodeKind[] }[] = [
  { name: "Tráfico y entrada", kinds: ["api_gateway", "load_balancer"] },
  { name: "Cómputo", kinds: ["app_service"] },
  { name: "Mensajería", kinds: ["queue"] },
  { name: "Almacenamiento", kinds: ["cache", "database"] },
];

interface SimulatorDashboardProps {
  user?: AuthUser;
  onLogout?: () => void;
}

export default function SimulatorDashboard({ user, onLogout }: SimulatorDashboardProps) {
  const [nodes, setNodes] = useState<SimNode[]>(initialNodes);
  const [edges, setEdges] = useState<SimEdge[]>(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>("n_app");
  const [traffic, setTraffic] = useState(600);
  const [running, setRunning] = useState(true);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState("plataforma-checkout.v1");
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [persistenceMessage, setPersistenceMessage] = useState<string | null>(null);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(256);
  const [rightWidth, setRightWidth] = useState(320);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; offX: number; offY: number } | null>(null);
  const resizeRef = useRef<{ side: "left" | "right"; startX: number; startW: number } | null>(null);

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
        setRightWidth(Math.max(220, Math.min(520, r.startW - delta)));
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

  const result = useMemo(
    () => simulate(nodes, edges, running ? traffic : 0),
    [nodes, edges, traffic, running],
  );
  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  const refreshProjects = useCallback(async () => {
    if (!user?.email) return;

    setIsLoadingProjects(true);
    try {
      const savedProjects = await projectService.list(user.email);
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

  // ---------- Drag nodes on canvas ----------
  const onNodeMouseDown = (e: React.MouseEvent, n: SimNode) => {
    setSelectedId(n.id);

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
    setNodes((prev) => prev.map((n) => (n.id === drag.id ? { ...n, x, y } : n)));
  };
  const stopDrag = () => (draggingRef.current = null);

  // ---------- Library drag & drop (HTML5) ----------
  const onLibDragStart = (e: React.DragEvent, kind: NodeKind) => {
    e.dataTransfer.setData("application/x-node-kind", kind);
    e.dataTransfer.effectAllowed = "copy";
  };

  const addNodeToCanvas = (kind: NodeKind, position?: { x: number; y: number }) => {
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
    const kind = e.dataTransfer.getData("application/x-node-kind") as NodeKind;
    if (!kind || !KIND_META[kind]) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - NODE_W / 2;
    const y = e.clientY - rect.top - NODE_H / 2;
    addNodeToCanvas(kind, { x, y });
  };

  const updateSelected = (patch: Partial<SimNode>) => {
    if (!selected) return;
    setNodes((prev) => prev.map((n) => (n.id === selected.id ? { ...n, ...patch } : n)));
  };

  const connectNodes = (fromId: string, toId: string) => {
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

      const project = await projectService.get(id, user.email);
      setProjectId(project.id);
      setProjectName(project.name);
      setTraffic(project.incomingTrafficRps);
      setRunning(project.isRunning);
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
    setProjectId(null);
    setProjectName("nuevo-proyecto");
    setNodes([]);
    setEdges([]);
    setTraffic(600);
    setRunning(true);
    setSelectedId(null);
    setConnectingFromId(null);
    setPersistenceMessage("Nuevo proyecto listo.");
    setPersistenceError(null);
    draggingRef.current = null;
  };

  const saveProject = async () => {
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
        running,
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
    if (!user?.email || !projectId) return;

    setIsSaving(true);
    setPersistenceError(null);
    setPersistenceMessage(null);

    try {
      await projectService.remove(projectId, user.email);
      setProjectId(null);
      setProjectName("nuevo-proyecto");
      setNodes([]);
      setEdges([]);
      setSelectedId(null);
      setConnectingFromId(null);
      setRunning(false);
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

  const duplicateSelected = () => {
    if (!selected) return;

    const duplicatedNode: SimNode = {
      ...selected,
      id: `${selected.kind}_${Math.random().toString(36).slice(2, 8)}`,
      name: `${selected.name} copia`,
      x: selected.x + 32,
      y: selected.y + 32,
    };

    setNodes((prev) => [...prev, duplicatedNode]);
    setSelectedId(duplicatedNode.id);
    setConnectingFromId(null);
    setPersistenceMessage("Componente duplicado.");
    setPersistenceError(null);
  };

  const deleteSelected = () => {
    if (!selected) return;
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
      <header className="flex shrink-0 flex-col gap-3 border-b border-border/60 bg-panel/75 px-3 py-3 backdrop-blur lg:h-14 lg:flex-row lg:items-center lg:justify-between lg:px-4 lg:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--neon-cyan)]/15 ring-1 ring-[color:var(--neon-cyan)]/40">
            <Activity className="h-4 w-4 text-[color:var(--neon-cyan)]" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">
              Simulador de arquitectura distribuida
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-2 font-mono text-[11px] text-muted-foreground sm:mt-0.5">
              <span className="shrink-0">proyecto /</span>
              <Input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                className="h-7 min-w-0 flex-1 border-border/50 bg-card/50 px-2 font-mono text-[11px] sm:w-56 sm:flex-none"
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 lg:overflow-visible lg:pb-0">
          {(persistenceMessage || persistenceError) && (
            <span
              className={cn(
                "max-w-44 shrink-0 truncate font-mono text-[11px]",
                persistenceError
                  ? "text-[color:var(--status-saturated)]"
                  : "text-[color:var(--neon-cyan)]",
              )}
              title={persistenceError ?? persistenceMessage ?? undefined}
            >
              {persistenceError ?? persistenceMessage}
            </span>
          )}
          <select
            value={projectId ?? ""}
            onChange={(event) => {
              const nextProjectId = Number(event.target.value);
              if (nextProjectId) void loadProject(nextProjectId);
            }}
            disabled={isLoadingProjects || !projects.length}
            className="h-8 max-w-48 shrink-0 rounded-md border border-border/60 bg-card/70 px-2 font-mono text-[11px] text-foreground outline-none transition hover:border-[color:var(--neon-cyan)]/50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Cargar proyecto guardado"
          >
            <option value="">Proyectos guardados</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <Button size="sm" variant="ghost" onClick={startNewProject} className="shrink-0">
            <FilePlus2 className="mr-1.5 h-3.5 w-3.5" /> Nuevo
          </Button>
          <Button
            size="sm"
            onClick={saveProject}
            disabled={isSaving}
            className="shrink-0 bg-[color:var(--neon-cyan)]/15 text-[color:var(--neon-cyan)] ring-1 ring-[color:var(--neon-cyan)]/50 hover:bg-[color:var(--neon-cyan)]/25"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" /> {isSaving ? "Guardando..." : "Guardar"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={deleteCurrentProject}
            disabled={!projectId || isSaving}
            className="shrink-0 text-[color:var(--status-saturated)] hover:bg-[color:var(--status-saturated)]/10 hover:text-[color:var(--status-saturated)]"
          >
            <FolderX className="mr-1.5 h-3.5 w-3.5" /> Borrar proyecto
          </Button>
          {user && (
            <div className="ml-2 hidden items-center gap-2 border-l border-border/60 pl-3 md:flex">
              <div className="text-right">
                <div className="max-w-32 truncate text-xs font-semibold">{user.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {user.role}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={onLogout} title="Cerrar sesión">
                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Salir
              </Button>
            </div>
          )}
        </div>
      </header>

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
                          draggable
                          onDragStart={(e) => onLibDragStart(e, kind)}
                          className="group flex cursor-grab items-center gap-2.5 rounded-md border border-border/60 bg-card/60 px-2.5 py-2 text-sm transition hover:border-[color:var(--neon-cyan)]/50 hover:bg-card active:cursor-grabbing"
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
        <main className="relative flex min-h-[680px] min-w-0 flex-1 flex-col lg:min-h-0">
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
                    className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-border/60 bg-card/70 px-3 text-xs transition hover:border-[color:var(--neon-cyan)]/50 hover:bg-card"
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
            className="canvas-grid relative min-h-[520px] flex-1 overflow-hidden lg:min-h-0"
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
              const showAlert = status === "saturated" || status === "failed";
              return (
                <div
                  key={n.id}
                  onMouseDown={(e) => onNodeMouseDown(e, n)}
                  className={cn(
                    "group absolute select-none rounded-xl bg-card/90 ring-1 backdrop-blur transition-all",
                    "cursor-grab active:cursor-grabbing",
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
                      {status === "failed" ? "Componente caído" : "Tráfico excedido"}
                    </div>
                  )}
                  <div className="flex h-full flex-col justify-between p-3">
                    <div className="flex items-start justify-between">
                      <div
                        className="pulse-glow flex h-8 w-8 items-center justify-center rounded-md"
                        style={{
                          color: meta.color,
                          backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
                          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${meta.color} 40%, transparent)`,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                          {styles.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="truncate text-[13px] font-semibold leading-tight">
                        {n.name}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {n.instances}× · {n.capacity} r/s · carga{" "}
                        {((m?.load ?? 0) * 100).toFixed(0)}%
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
                            : status === "warning"
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
            <div className="absolute left-3 right-3 top-3 rounded-lg border border-border/60 bg-panel/80 p-3 backdrop-blur sm:left-4 sm:right-auto sm:top-4 sm:w-72">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Tráfico entrante
                  </Label>
                  <div className="mt-1 font-mono text-xs text-[color:var(--neon-cyan)]">
                    {traffic} req/s
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setRunning(true)}
                    className="h-7 px-2 bg-[color:var(--neon-cyan)]/15 text-[color:var(--neon-cyan)] ring-1 ring-[color:var(--neon-cyan)]/50 hover:bg-[color:var(--neon-cyan)]/25"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setRunning(false)}
                    className="h-7 px-2"
                  >
                    <Square className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Slider
                value={[traffic]}
                onValueChange={(v) => setTraffic(v[0])}
                min={50}
                max={4000}
                step={50}
              />
            </div>
          </div>

          {/* Métricas inferiores */}
          <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-border/60 bg-panel/50 p-3 md:grid-cols-5">
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
              label="Salida real"
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

          <section className="border-t border-border/60 bg-panel/60 p-3 lg:hidden">
            {selected ? (
              <PropertiesPanel
                node={selected}
                onChange={updateSelected}
                onDelete={deleteSelected}
                onDuplicate={duplicateSelected}
                metrics={result.perNode[selected.id]}
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
                  onDuplicate={duplicateSelected}
                  metrics={result.perNode[selected.id]}
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

// ---------- Subcomponents ----------

function Metric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Zap;
  accent: "cyan" | "amber" | "violet" | "warn";
}) {
  const color =
    accent === "cyan"
      ? "var(--neon-cyan)"
      : accent === "amber"
        ? "var(--neon-amber)"
        : accent === "violet"
          ? "var(--neon-violet)"
          : "var(--status-saturated)";
  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <div className="font-mono text-lg font-semibold tracking-tight" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function ConnectionsPanel({
  nodes,
  edges,
  selected,
  connectingFromId,
  onStartConnection,
  onCancelConnection,
  onDeleteConnection,
}: {
  nodes: SimNode[];
  edges: SimEdge[];
  selected: SimNode | null;
  connectingFromId: string | null;
  onStartConnection: () => void;
  onCancelConnection: () => void;
  onDeleteConnection: (edgeId: string) => void;
}) {
  const nodeNames = new Map(nodes.map((node) => [node.id, node.name]));
  const connectingNodeName = connectingFromId ? nodeNames.get(connectingFromId) : null;

  return (
    <div className="mt-auto space-y-3 border-t border-border/60 pt-3">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Conexiones
        </div>
        <p className="mt-1 text-xs text-muted-foreground/80">
          {connectingNodeName
            ? `Elegí destino para ${connectingNodeName}.`
            : selected
              ? `Origen: ${selected.name}`
              : "Seleccioná un componente."}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!selected}
          onClick={onStartConnection}
          className={cn(
            "flex-1 border-[color:var(--neon-cyan)]/45 bg-[color:var(--neon-cyan)]/5 text-[color:var(--neon-cyan)] hover:bg-[color:var(--neon-cyan)]/10 hover:text-[color:var(--neon-cyan)]",
            connectingFromId &&
              "border-[color:var(--neon-amber)]/65 bg-[color:var(--neon-amber)]/10 text-[color:var(--neon-amber)] hover:text-[color:var(--neon-amber)]",
          )}
        >
          <Link2 className="h-4 w-4" />
          {connectingFromId ? "Conectando" : "Conectar"}
        </Button>
        {connectingFromId && (
          <Button type="button" size="sm" variant="ghost" onClick={onCancelConnection}>
            Cancelar
          </Button>
        )}
      </div>

      <div className="max-h-40 space-y-1.5 overflow-y-auto">
        {edges.length ? (
          edges.map((edge) => (
            <div
              key={edge.id}
              className="flex items-center justify-between gap-2 rounded-md bg-card/60 px-2.5 py-2 text-xs"
            >
              <span className="min-w-0 flex-1 truncate">
                {nodeNames.get(edge.from) ?? edge.from} → {nodeNames.get(edge.to) ?? edge.to}
              </span>
              <button
                type="button"
                onClick={() => onDeleteConnection(edge.id)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[color:var(--status-saturated)] transition hover:bg-[color:var(--status-saturated)]/10"
                title="Eliminar conexión"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-md bg-card/50 p-2 text-xs text-muted-foreground">
            Todavía no hay conexiones.
          </div>
        )}
      </div>
    </div>
  );
}

function PropertiesPanel({
  node,
  onChange,
  onDelete,
  onDuplicate,
  metrics,
}: {
  node: SimNode;
  onChange: (patch: Partial<SimNode>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  metrics?: {
    load: number;
    latency: number;
    throughput: number;
    errorRate: number;
    status: "healthy" | "warning" | "saturated" | "failed";
  };
}) {
  const meta = KIND_META[node.kind];
  const Icon = NODE_ICON[node.kind];
  const status = metrics?.status ?? "healthy";
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-md"
          style={{
            color: meta.color,
            backgroundColor: `color-mix(in oklab, ${meta.color} 14%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${meta.color} 40%, transparent)`,
          }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {meta.category}
          </div>
          <div className="truncate text-sm font-semibold">{meta.label}</div>
        </div>
        <Badge
          variant="outline"
          className="border-[color:var(--neon-cyan)]/40 font-mono text-[10px] uppercase"
          style={{
            color: STATUS_STYLES[status].dot.includes("healthy") ? undefined : undefined,
          }}
        >
          {STATUS_STYLES[status].label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={onDuplicate}>
          <Copy className="h-4 w-4" />
          Duplicar
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-[color:var(--status-saturated)]/45 bg-[color:var(--status-saturated)]/5 text-[color:var(--status-saturated)] hover:bg-[color:var(--status-saturated)]/10 hover:text-[color:var(--status-saturated)]"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </div>

      <div className="space-y-3">
        <Field label="Nombre">
          <Input value={node.name} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>
        <SliderField
          label="Instancias"
          value={node.instances}
          min={1}
          max={16}
          step={1}
          onChange={(v) => onChange({ instances: v })}
          unit="×"
        />
        <SliderField
          label="Capacidad (req/s por instancia)"
          value={node.capacity}
          min={50}
          max={10000}
          step={50}
          onChange={(v) => onChange({ capacity: v })}
        />
        <SliderField
          label="Latencia base"
          value={node.baseLatency}
          min={1}
          max={300}
          step={1}
          onChange={(v) => onChange({ baseLatency: v })}
          unit="ms"
        />
        <Field label="Costo por instancia ($/mes)">
          <Input
            type="number"
            value={node.costPerInstance}
            onChange={(e) => onChange({ costPerInstance: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
          <MiniMetric label="Carga" value={`${(metrics.load * 100).toFixed(0)}%`} />
          <MiniMetric label="Latencia" value={`${metrics.latency.toFixed(0)}ms`} />
          <MiniMetric label="Salida" value={`${metrics.throughput.toFixed(0)}r/s`} />
          <MiniMetric label="Error" value={`${(metrics.errorRate * 100).toFixed(1)}%`} />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </Label>
        <span className="font-mono text-xs text-[color:var(--neon-cyan)]">
          {value}
          {unit ?? ""}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-card/60 p-2 text-center">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-xs text-foreground">{value}</div>
    </div>
  );
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation="vertical"
      className="group relative z-10 hidden w-1 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-[color:var(--neon-cyan)]/60 lg:block"
      title="Arrastrá para cambiar tamaño"
    >
      {/* Wider invisible hit area */}
      <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
      {/* Grip indicator */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/30 group-hover:bg-[color:var(--neon-cyan)]" />
    </div>
  );
}
