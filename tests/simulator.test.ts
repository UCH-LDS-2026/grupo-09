import { describe, expect, it } from "vitest";
import {
  calculateNodeTrafficMetrics,
  recommendInstancesForTraffic,
  validateConnection,
  type SimNode,
} from "../src/lib/simulator";

function makeTestNode(id: string, kind: SimNode["kind"]): SimNode {
  return {
    id,
    kind,
    name: id,
    x: 0,
    y: 0,
    instances: 1,
    capacity: 1,
    baseLatency: 0,
    queueSize: 0,
    timeout: 0,
    costPerInstance: 0,
  };
}

describe("Reglas de negocio del simulador", () => {
  it("calcula capacidad, carga, salida y error en un escenario normal", () => {
    // Preparación
    const trafficRps = 600;
    const instances = 2;
    const capacityPerInstance = 400;

    // Ejecución
    const metrics = calculateNodeTrafficMetrics({
      trafficRps,
      instances,
      capacityPerInstance,
    });

    // Verificación
    expect(metrics.capacity).toBe(800);
    expect(metrics.load).toBe(0.75);
    expect(metrics.throughput).toBe(600);
    expect(metrics.errorRate).toBe(0);
  });

  it("calcula perdida de trafico, error y estado cuando el nodo se satura", () => {
    // Preparación
    const trafficRps = 1000;
    const instances = 2;
    const capacityPerInstance = 400;

    // Ejecución
    const metrics = calculateNodeTrafficMetrics({
      trafficRps,
      instances,
      capacityPerInstance,
    });

    // Verificación
    expect(metrics.capacity).toBe(800);
    expect(metrics.throughput).toBe(800);
    expect(metrics.dropped).toBe(200);
    expect(metrics.errorRate).toBe(0.2);
    expect(["saturated", "error"]).toContain(metrics.status);
  });

  it("recomienda la cantidad minima de instancias para absorber el trafico", () => {
    // Preparación
    const trafficRps = 1200;
    const capacityPerInstance = 400;
    const currentInstances = 2;

    // Ejecución
    const recommendedInstances = recommendInstancesForTraffic(
      trafficRps,
      capacityPerInstance,
      currentInstances,
    );

    // Verificación
    expect(recommendedInstances).toBe(3);
  });

  it("permite conectar puerta de enlace API hacia balanceador de carga", () => {
    // Preparación
    const source = makeTestNode("gateway", "api_gateway");
    const target = makeTestNode("balancer", "load_balancer");

    // Ejecución
    const result = validateConnection(source, target, []);

    // Verificación
    expect(result.valid).toBe(true);
  });

  it("rechaza conectar base de datos hacia puerta de enlace API", () => {
    // Preparación
    const source = makeTestNode("database", "database");
    const target = makeTestNode("gateway", "api_gateway");

    // Ejecución
    const result = validateConnection(source, target, []);

    // Verificación
    expect(result.valid).toBe(false);
  });
});
