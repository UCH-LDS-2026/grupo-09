import type { SimNode, SimResult } from "@/lib/simulator";

export interface SystemSignal {
  label: string;
  value: string;
  status: "ok" | "warning" | "critical";
}

export interface SystemConclusionData {
  title: string;
  summary: string;
  details: string[];
  signals: SystemSignal[];
  primaryCause: string;
  recommendation: string;
  bottleneckName: string;
  accent: "cyan" | "amber" | "warn";
}

function percent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

function formatSaturationReason(reason: string) {
  if (reason === "rps") return "capacidad RPS";
  if (reason === "bandwidth") return "ancho de banda";
  if (reason === "rps_and_bandwidth") return "capacidad RPS y ancho de banda";
  return "mayor carga relativa";
}

function classifyPrimaryCause(metrics: SimResult["perNode"][string]) {
  if (metrics.saturationReason !== "none") {
    return formatSaturationReason(metrics.saturationReason);
  }
  if (metrics.queued > 0) return "cola acumulada";
  if (metrics.errorRate > 0) return "errores por tráfico no procesado";
  if (metrics.load >= 0.7) return "carga cercana al límite";
  return "sin restricción dominante";
}

function buildSignals(metrics: SimResult["perNode"][string]): SystemSignal[] {
  return [
    {
      label: "Carga",
      value: percent(metrics.load),
      status: metrics.load >= 1 ? "critical" : metrics.load >= 0.7 ? "warning" : "ok",
    },
    {
      label: "Saturación",
      value: formatSaturationReason(metrics.saturationReason),
      status: metrics.saturationReason === "none" ? "ok" : "critical",
    },
    {
      label: "Cola",
      value: `${Math.round(metrics.queued)} req/s`,
      status: metrics.queued > 0 ? "warning" : "ok",
    },
    {
      label: "Error",
      value: `${(metrics.errorRate * 100).toFixed(1)}%`,
      status: metrics.errorRate > 0 ? "critical" : "ok",
    },
    {
      label: "Red",
      value: `${metrics.incomingMBps.toFixed(2)} MB/s`,
      status:
        metrics.bandwidthLoad >= 1 ? "critical" : metrics.bandwidthLoad >= 0.7 ? "warning" : "ok",
    },
  ];
}

export function buildSystemConclusion(
  nodes: SimNode[],
  result: SimResult,
  traffic: number,
): SystemConclusionData {
  if (!nodes.length) {
    return {
      title: "Conclusión del sistema",
      summary: "Agregá componentes y conexiones para evaluar la arquitectura.",
      details: ["El sistema todavía no tiene una topología mínima para simular."],
      signals: [],
      primaryCause: "sin topología",
      recommendation: "Agregá al menos un nodo de entrada y un componente de procesamiento.",
      bottleneckName: "Sin topología",
      accent: "amber",
    };
  }

  const activeNodes = nodes
    .map((node) => ({ node, metrics: result.perNode[node.id] }))
    .filter(({ metrics }) => metrics?.incoming > 0);
  const candidate = [...activeNodes].sort((a, b) => b.metrics.load - a.metrics.load)[0];
  const bottleneck = result.totals.bottleneck
    ? nodes.find((node) => node.id === result.totals.bottleneck?.id)
    : candidate?.node;
  const bottleneckMetrics = bottleneck ? result.perNode[bottleneck.id] : candidate?.metrics;
  const totalCost = result.totals.cost.toFixed(0);
  const errorPercent = (result.totals.errorRate * 100).toFixed(1);

  if (!candidate || !bottleneck || !bottleneckMetrics) {
    return {
      title: "Conclusión del sistema",
      summary: "La arquitectura existe, pero ningún componente está recibiendo tráfico.",
      details: ["Revisá que haya un nodo de entrada y conexiones hacia el resto del sistema."],
      signals: [],
      primaryCause: "sin tráfico activo",
      recommendation: "Conectá el nodo de entrada hacia los servicios que querés evaluar.",
      bottleneckName: "Sin tráfico activo",
      accent: "amber",
    };
  }

  const limitRps = Math.max(0, Math.round(bottleneckMetrics.capacity));
  const incomingRps = Math.round(bottleneckMetrics.incoming);
  const queuedRps = Math.round(bottleneckMetrics.queued);
  const saturated = bottleneckMetrics.load >= 1;
  const recommendedInstances = Math.max(
    bottleneck.instances,
    Math.ceil(bottleneckMetrics.incoming / Math.max(bottleneck.capacity, 1)),
  );
  const bottleneckReason =
    result.totals.bottleneck?.reason ??
    `recibe ${incomingRps} req/s contra ${limitRps} req/s de capacidad`;
  const primaryCause = classifyPrimaryCause(bottleneckMetrics);
  const signals = buildSignals(bottleneckMetrics);
  const scaleRecommendation = `Aumentar ${bottleneck.name} de ${bottleneck.instances} a ${recommendedInstances} instancias.`;
  const bandwidthRecommendation = `Subir el ancho de banda de ${bottleneck.name} o bajar el tamaño efectivo de solicitud (${bottleneckMetrics.effectiveRequestSizeKb.toFixed(1)} KB).`;
  const queueRecommendation = `Aumentar capacidad de procesamiento antes de agrandar la cola; la cola solo posterga el cuello de botella.`;
  const recommendation =
    bottleneckMetrics.saturationReason === "bandwidth"
      ? bandwidthRecommendation
      : bottleneckMetrics.saturationReason === "rps_and_bandwidth"
        ? `${scaleRecommendation} También ${bandwidthRecommendation.toLowerCase()}`
        : bottleneckMetrics.queued > 0
          ? queueRecommendation
          : scaleRecommendation;

  if (saturated) {
    return {
      title: "Conclusión del sistema",
      summary: "La arquitectura está saturada.",
      details: [
        `El cuello de botella es ${bottleneck.name}: ${bottleneckReason}.`,
        `El motor corrió ${result.totals.cycles} ciclos; la cola promedio del nodo es ${queuedRps} req/s.`,
        `La salida procesada es ${result.totals.throughput.toFixed(0)} req/s y el error global es ${errorPercent}%.`,
        `Causa principal: ${primaryCause}.`,
        `Recomendación: ${recommendation}`,
        `Costo mensual estimado: $${totalCost}.`,
      ],
      signals,
      primaryCause,
      recommendation,
      bottleneckName: bottleneck.name,
      accent: "warn",
    };
  }

  return {
    title: "Conclusión del sistema",
    summary: `Con ${traffic} req/s, la arquitectura funcionaría normalmente.`,
    details: [
      `El motor corrió ${result.totals.cycles} ciclos discretos para propagar tráfico y colas.`,
      `La salida procesada es ${result.totals.throughput.toFixed(0)} req/s, con error global de ${errorPercent}%.`,
      `El primer cuello de botella probable será ${bottleneck.name}: ${bottleneckReason}.`,
      `Causa principal observada: ${primaryCause}.`,
      `Recomendación: ${recommendation}`,
      `Costo mensual estimado de la arquitectura: $${totalCost}.`,
    ],
    signals,
    primaryCause,
    recommendation,
    bottleneckName: bottleneck.name,
    accent: bottleneckMetrics.load >= 0.7 ? "amber" : "cyan",
  };
}
