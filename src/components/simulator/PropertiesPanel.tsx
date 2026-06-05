import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { NODE_ICON } from "@/lib/node-icons";
import { KIND_META, type NodeMetrics, type SimNode } from "@/lib/simulator";

import { STATUS_STYLES } from "./simulatorConfig";

interface PropertiesPanelProps {
  node: SimNode;
  onChange: (patch: Partial<SimNode>) => void;
  onDelete: () => void;
  metrics?: NodeMetrics;
}

type NumericNodeField =
  | "instances"
  | "capacity"
  | "baseLatency"
  | "queueSize"
  | "timeout"
  | "costPerInstance";

export function PropertiesPanel({ node, onChange, onDelete, metrics }: PropertiesPanelProps) {
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
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
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
          className="gap-1.5 border-border/60 font-mono text-[10px] uppercase"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`} />
          {statusStyles.label}
        </Badge>
      </div>

      <Section title="Configuración">
        <Field label="Nombre">
          <Input
            value={node.name}
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
          onChange={(value) => updateNumber("instances", Math.round(value), 1)}
          unit="×"
        />
        <SliderField
          label="Capacidad (req/s por instancia)"
          value={node.capacity}
          min={1}
          max={10000}
          step={1}
          onChange={(value) => updateNumber("capacity", Math.round(value), 1)}
        />
        <SliderField
          label="Latencia base"
          value={node.baseLatency}
          min={0}
          max={300}
          step={1}
          onChange={(value) => updateNumber("baseLatency", Math.round(value), 0)}
          unit="ms"
        />
        <SliderField
          label="Tamaño de cola"
          value={node.queueSize}
          min={0}
          max={5000}
          step={10}
          onChange={(value) => updateNumber("queueSize", Math.round(value), 0)}
          unit="r/s"
        />
        <SliderField
          label="Timeout"
          value={node.timeout}
          min={0}
          max={15000}
          step={100}
          onChange={(value) => updateNumber("timeout", Math.round(value), 0)}
          unit="ms"
        />
        <Field label="Costo por instancia ($/mes)">
          <Input
            type="number"
            min={0}
            step={1}
            value={node.costPerInstance}
            onChange={(event) => updateNumber("costPerInstance", Number(event.target.value), 0)}
          />
        </Field>
      </Section>

      <Section title="Resultado">
        <div className="grid grid-cols-2 gap-2">
          <MiniMetric label="Capacidad total" value={`${installedCapacity.toFixed(0)}r/s`} />
          <MiniMetric label="Costo mensual" value={`$${monthlyNodeCost.toFixed(0)}`} />
          {metrics ? (
            <>
              <MiniMetric label="Carga" value={`${(metrics.load * 100).toFixed(0)}%`} />
              <MiniMetric label="Entrada" value={`${metrics.incoming.toFixed(0)}r/s`} />
              <MiniMetric label="Salida procesada" value={`${metrics.throughput.toFixed(0)}r/s`} />
              <MiniMetric label="Cola" value={`${metrics.queued.toFixed(0)}r/s`} />
              <MiniMetric label="Error" value={`${(metrics.errorRate * 100).toFixed(1)}%`} />
              <MiniMetric label="Latencia" value={`${metrics.latency.toFixed(0)}ms`} />
              <MiniMetric label="Estado" value={statusStyles.label} />
            </>
          ) : (
            <MiniMetric label="Estado" value={statusStyles.label} />
          )}
        </div>
      </Section>

      <Button
        type="button"
        variant="outline"
        className="w-full border-[color:var(--status-saturated)]/45 bg-[color:var(--status-saturated)]/5 text-[color:var(--status-saturated)] hover:bg-[color:var(--status-saturated)]/10 hover:text-[color:var(--status-saturated)]"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar componente
      </Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
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
}

function SliderField({ label, value, onChange, min, max, step, unit }: SliderFieldProps) {
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
        onValueChange={(nextValue) => onChange(nextValue[0])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-16 rounded-md bg-card/60 p-2.5 text-center">
      <div className="break-words font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-sm text-foreground">{value}</div>
    </div>
  );
}
