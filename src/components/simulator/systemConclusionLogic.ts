import type { SimNode, SimResult } from "@/lib/simulator";

export interface SystemConclusionData {
  title: string;
  summary: string;
  details: string[];
  accent: "cyan" | "amber" | "warn";
}

export function buildSystemConclusion(
  nodes: SimNode[],
  result: SimResult,
  traffic: number,
  running: boolean,
): SystemConclusionData {
  if (!nodes.length) {
    return {
      title: "Conclusión del sistema",
      summary: "Agregá componentes y conexiones para evaluar la arquitectura.",
      details: ["El sistema todavía no tiene una topología mínima para simular."],
      accent: "amber",
    };
  }

  if (!running) {
    return {
      title: "Simulación detenida",
      summary: "El sistema está sin evaluar hasta ejecutar la simulación.",
      details: ["La conclusión se calcula con la simulación activa y el tráfico configurado."],
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
      accent: "amber",
    };
  }

  const limitRps = Math.max(0, Math.round(bottleneckMetrics.capacity));
  const incomingRps = Math.round(bottleneckMetrics.incoming);
  const saturated = bottleneckMetrics.load >= 1;
  const recommendedInstances = Math.max(
    bottleneck.instances,
    Math.ceil(bottleneckMetrics.incoming / Math.max(bottleneck.capacity, 1)),
  );

  if (saturated) {
    return {
      title: "Conclusión del sistema",
      summary: "La arquitectura está saturada.",
      details: [
        `El cuello de botella es ${bottleneck.name} porque recibe ${incomingRps} req/s y su capacidad máxima es ${limitRps} req/s.`,
        `La salida procesada es ${result.totals.throughput.toFixed(0)} req/s y el error global es ${errorPercent}%.`,
        `Recomendación: aumentar ${bottleneck.name} de ${bottleneck.instances} a ${recommendedInstances} instancias.`,
        `Costo mensual estimado: $${totalCost}.`,
      ],
      accent: "warn",
    };
  }

  return {
    title: "Conclusión del sistema",
    summary: `Con ${traffic} req/s, la arquitectura funcionaría normalmente.`,
    details: [
      `La salida procesada es ${result.totals.throughput.toFixed(0)} req/s, con error global de ${errorPercent}%.`,
      `El primer cuello de botella probable será ${bottleneck.name} cerca de ${limitRps} req/s.`,
      `Costo mensual estimado de la arquitectura: $${totalCost}.`,
    ],
    accent: bottleneckMetrics.load >= 0.7 ? "amber" : "cyan",
  };
}
