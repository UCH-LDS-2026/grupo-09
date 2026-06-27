import { Clock3, Eye, GitCommitHorizontal, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScenarioVersionSummary } from "@/services/projectService";

import { ExecutiveSummary } from "./DecisionBlocks";
import { WorkspaceState } from "./WorkspaceState";

interface VersionHistoryPanelProps {
  projectId: number | null;
  versions: ScenarioVersionSummary[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  canCreate: boolean;
  previewVersionId: number | null;
  onCreate: (name: string, description: string) => Promise<boolean>;
  onOpen: (versionId: number) => void;
  onClosePreview: () => void;
}

export function VersionHistoryPanel({
  projectId,
  versions,
  loading,
  creating,
  error,
  canCreate,
  previewVersionId,
  onCreate,
  onOpen,
  onClosePreview,
}: VersionHistoryPanelProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    const created = await onCreate(name, description);
    if (created) {
      setName("");
      setDescription("");
    }
  };

  if (!projectId) {
    return (
      <WorkspaceState
        kind="empty"
        title="Guardá el proyecto primero"
        detail="Las versiones pertenecen a un proyecto persistido. Guardá la arquitectura actual para habilitar el historial."
      />
    );
  }

  return (
    <div className="space-y-5">
      {previewVersionId && (
        <ExecutiveSummary title="Vista histórica">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>Estás viendo un snapshot en modo lectura.</span>
            <Button size="sm" variant="outline" onClick={onClosePreview}>
              <RotateCcw className="h-3.5 w-3.5" /> Volver al actual
            </Button>
          </div>
        </ExecutiveSummary>
      )}

      <section className="space-y-2.5 border-b border-border/40 pb-5">
        <div>
          <h3 className="text-sm font-semibold">Guardar punto de decisión</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            El snapshot conserva arquitectura, tráfico y resultado sin modificar el proyecto actual.
          </p>
        </div>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej. baseline antes de cache"
          maxLength={120}
          disabled={!canCreate || creating}
          aria-label="Nombre de la versión"
        />
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Cambio o hipótesis (opcional)"
          maxLength={500}
          disabled={!canCreate || creating}
          aria-label="Descripción de la versión"
        />
        <Button
          type="button"
          className="w-full"
          disabled={!canCreate || creating || !name.trim()}
          onClick={() => void submit()}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GitCommitHorizontal className="h-4 w-4" />
          )}
          {creating ? "Guardando versión..." : "Guardar versión"}
        </Button>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Historial de escenarios</h3>
          <span className="font-mono text-[10px] text-muted-foreground">{versions.length}</span>
        </div>
        {loading && (
          <WorkspaceState
            kind="loading"
            title="Cargando versiones"
            detail="Consultando el historial del proyecto."
          />
        )}
        {error && (
          <WorkspaceState kind="error" title="No se pudo cargar el historial" detail={error} />
        )}
        {!loading && !error && !versions.length && (
          <WorkspaceState
            kind="empty"
            title="Todavía no hay versiones"
            detail="Guardá un baseline antes de cambiar capacidad, instancias o ancho de banda."
          />
        )}
        {!loading &&
          versions.map((version) => (
            <article key={version.id} className="rounded-lg bg-card/60 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{version.name}</div>
                  <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                    <Clock3 className="h-3 w-3" />
                    {new Date(version.createdAt).toLocaleString("es-AR")}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Abrir versión ${version.name} en modo lectura`}
                  onClick={() => onOpen(version.id)}
                >
                  <Eye className="h-3.5 w-3.5" /> Abrir
                </Button>
              </div>
              <p className="mt-2 font-mono text-[10px] leading-4 text-muted-foreground">
                {version.summary}
              </p>
              {version.description && (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {version.description}
                </p>
              )}
            </article>
          ))}
      </section>
    </div>
  );
}
