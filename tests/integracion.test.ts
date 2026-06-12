import { describe, expect, it } from "vitest";
import { SIMULATION_CYCLES, simulate, type SimNode, type SimEdge } from "../src/lib/simulator";

/**
 * TEST DE INTEGRACION
 *
 * A diferencia de un test unitario (que prueba una sola funcion aislada),
 * un test de integracion verifica que VARIAS partes funcionen juntas.
 *
 * Aca probamos el motor completo `simulate`, que internamente usa:
 *   - el armado del grafo (nodos + conexiones),
 *   - la propagacion de trafico por ciclos,
 *   - el calculo de capacidad, carga, latencia, errores y costos,
 *   - la deteccion del cuello de botella (bottleneck).
 *
 * Escenario: una arquitectura tipica
 *   Puerta de enlace API  ->  Servicio de aplicacion  ->  Base de datos
 * con 300 req/s de trafico entrante (sin saturar ningun nodo).
 */

function makeNode(
  id: string,
  kind: SimNode["kind"],
  instances: number,
  capacity: number,
  baseLatency: number,
  costPerInstance: number,
): SimNode {
  return {
    id,
    kind,
    name: id,
    x: 0,
    y: 0,
    instances,
    capacity,
    baseLatency,
    queueSize: 500, // cola amplia para que no se descarte trafico
    timeout: 1000,
    costPerInstance,
  };
}

describe("Test de integracion del motor de simulacion", () => {
  it("simula un flujo completo gateway -> app -> database sin perdidas", () => {
    // Arrange: construyo la arquitectura completa
    const nodes: SimNode[] = [
      makeNode("gateway", "api_gateway", 2, 800, 8, 25), // capacidad total 1600
      makeNode("app", "app_service", 2, 400, 35, 40), // capacidad total 800
      makeNode("db", "database", 1, 600, 18, 80), // capacidad total 600
    ];
    const edges: SimEdge[] = [
      { id: "e1", from: "gateway", to: "app", async: false },
      { id: "e2", from: "app", to: "db", async: false },
    ];
    const trafficRps = 300;

    // Act: ejecuto la simulacion completa
    const result = simulate(nodes, edges, trafficRps);

    // Assert: verifico el comportamiento integral del sistema

    // 1) La simulacion corre la cantidad de ciclos definida.
    expect(result.cycles).toHaveLength(SIMULATION_CYCLES);

    // 2) Como ningun nodo se satura, no hay errores y pasa todo el trafico.
    expect(result.totals.errorRate).toBe(0);
    expect(result.totals.throughput).toBe(300);

    // 3) El costo total es la suma de costos de cada nodo:
    //    gateway 25*2 + app 40*2 + db 80*1 = 50 + 80 + 80 = 210
    expect(result.totals.cost).toBe(210);

    // 4) Ningun nodo descarta trafico.
    for (const metrics of Object.values(result.perNode)) {
      expect(metrics.dropped).toBe(0);
    }

    // 5) La base de datos es el cuello de botella (mayor carga relativa).
    expect(result.totals.bottleneck?.id).toBe("db");

    // 6) El gateway queda saludable (carga muy baja).
    expect(result.perNode.gateway.status).toBe("healthy");
  });
});
