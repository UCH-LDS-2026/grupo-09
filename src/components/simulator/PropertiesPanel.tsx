import { ChevronDown, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { NODE_ICON } from "@/lib/node-icons";
import { KIND_META, type NodeMetrics, type SaturationReason, type SimNode } from "@/lib/simulator";
import { cn } from "@/lib/utils";

import { STATUS_STYLES } from "./simulatorConfig";

interface PropertiesPanelProps {
  node: SimNode;
  onChange: (patch: Partial<SimNode>) => void;
  onDelete: () => void;
  metrics?: NodeMetrics;
  readOnly?: boolean;
}

type NumericNodeField =
  | "instances"
  | "capacity"
  | "baseLatency"
  | "queueSize"
  | "timeout"
  | "costPerInstance"
  | "bandwidthMbps";

const SATURATION_REASON_LABELS: Record<SaturationReason, string> = {
  none: "Sin saturación",
  rps: "RPS",
  bandwidth: "Ancho de banda",
  rps_and_bandwidth: "RPS + ancho de banda",
};

export function PropertiesPanel({
  node,
  onChange,
  onDelete,
  metrics,
  readOnly = false,
}: PropertiesPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const meta = KIND_META[node.kind];
  const Icon = NODE_ICON[node.kind];
  const status = metrics?.status ?? "healthy";
  const statusStyles = STATUS_STYLES[status];
  const monthlyNodeCost = node.instances * node.costPerInstance;
  const installedCapacity = node.instances * node.capacity;

  const updateNumber = (field: NumericNodeField, value: number, min: number) => {
    onChange({ [field]: Math.max(min, Number.isFinite(value) ? value : min) });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{node.name}</div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            {meta.label}
          </div>
        </div>
        <Badge
          variant="outline"
          className="gap-1.5 border-border/60 bg-transparent font-mono text-[9px] uppercase text-muted-foreground"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`} />
          {statusStyles.label}
        </Badge>
      </div>

      <Section title="Configuración básica">
        <Field label="Nombre">
          <Input
            value={node.name}
            readOnly={readOnly}
            onChange={(event) => onChange({ name: event.target.value })}
            onBlur={() => {
              const name = node.name.trim();
              onChange({ name: name || meta.label });
            }}
          />
        </Field>
        <SliderField
          label="Instancias"
          value={node.instances}
          min={1}
          max={16}
          step={1}
          disabled={readOnly}
          onChange={(value) => updateNumber("instances", Math.round(value), 1)}
          unit="×"
        />
        <SliderField
          label="Capacidad por instancia"
          value={node.capacity}
          min={1}
          max={10000}
          step={1}
          disabled={readOnly}
          onChange={(value) => updateNumber("capacity", Math.round(value), 1)}
          unit=" req/s"
        />
      </Section>

      <section className="border-y border-border/40 py-1">
        <button
          type="button"
          className="flex w-full items-center justify-between py-2.5 text-left text-xs font-medium text-muted-foreground transition hover:text-foreground"
          onClick={() => setAdvancedOpen((value) => !value)}
          aria-expanded={advancedOpen}
        >
          Configuración avanzada
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")}
          />
        </button>
        {advancedOpen && (
          <div className="space-y-3 pb-3 pt-2">
            <SliderField
              label="Latencia base"
              value={node.baseLatency}
              min={0}
              max={300}
              step={1}
              disabled={readOnly}
              onChange={(value) => updateNumber("baseLatency", Math.round(value), 0)}
              unit=" ms"
            />
            <SliderField
              label="Tamaño de cola"
              value={node.queueSize}
              min={0}
              max={5000}
              step={10}
              disabled={readOnly}
              onChange={(value) => updateNumber("queueSize", Math.round(value), 0)}
              unit=" req/s"
            />
            <SliderField
              label="Ancho de banda"
              value={node.bandwidthMbps}
              min={0}
              max={2000}
              step={10}
              disabled={readOnly}
              onChange={(value) => updateNumber("bandwidthMbps", value, 0)}
              unit=" Mbps"
            />
            <SliderField
              label="Timeout"
              value={node.timeout}
              min={0}
              max={15000}
              step={100}
              disabled={readOnly}
              onChange={(value) => updateNumber("timeout", Math.round(value), 0)}
              unit=" ms"
            />
            <Field label="Costo por instancia ($/mes)">
              <Input
                type="number"
                min={0}
                step={1}
                value={node.costPerInstance}
                readOnly={readOnly}
                onChange={(event) => updateNumber("costPerInstance", Number(event.target.value), 0)}
              />
            </Field>
          </div>
        )}
      </section>

      <Section title="Resultado">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <MiniMetric label="Capacidad" value={`${installedCapacity.toFixed(0)} req/s`} />
          <MiniMetric label="Costo mensual" value={`$${monthlyNodeCost.toFixed(0)}`} />
          {metrics ? (
            <>
              <MiniMetric label="Carga" value={`${(metrics.load * 100).toFixed(0)}%`} />
              <MiniMetric label="Entrada" value={`${metrics.incoming.toFixed(0)} req/s`} />
              <MiniMetric label="Salida" value={`${metrics.throughput.toFixed(0)} req/s`} />
              <MiniMetric label="Red" value={`${metrics.incomingMBps.toFixed(2)} MB/s`} />
              <MiniMetric
                label="Saturación"
                value={SATURATION_REASON_LABELS[metrics.saturationReason]}
              />
              <MiniMetric label="Cola" value={`${metrics.queued.toFixed(0)} req/s`} />
              <MiniMetric label="Error" value={`${(metrics.errorRate * 100).toFixed(1)}%`} />
              <MiniMetric label="Latencia" value={`${metrics.latency.toFixed(0)} ms`} />
            </>
          ) : (
            <MiniMetric label="Estado" value={statusStyles.label} />
          )}
        </div>
      </Section>

      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:bg-[color:var(--status-saturated)]/8 hover:text-[color:var(--status-saturated)]"
        disabled={readOnly}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" /> Eliminar componente
      </Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  disabled?: boolean;
}

function SliderField({ label, value, onChange, min, max, step, unit, disabled }: SliderFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <Label className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        <span className="shrink-0 font-mono text-[11px] text-foreground">
          {value}
          {unit ?? ""}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(nextValue) => onChange(nextValue[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-border/35 pb-2">
      <div className="font-mono text-[8px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-xs text-foreground" title={value}>
        {value}
      </div>
    </div>
  );
}
