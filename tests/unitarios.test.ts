import { describe, expect, it } from "vitest";
import { validateRegistrationPayload } from "../backend/src/services/auth.service";
import {
  calculateLatency,
  calculateNodeCapacity,
  calculateNodeTrafficMetrics,
  recommendInstancesForTraffic,
  statusFor,
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

/**
 * TESTS UNITARIOS
 *
 * Un test unitario prueba UNA sola funcion de forma aislada, sin depender
 * de otras partes del sistema (ni base de datos, ni backend, ni el motor completo).
 *
 * Cada test sigue el patron Preparacion / Ejecucion / Verificacion:
 *   - Preparacion: preparo los datos de entrada.
 *   - Ejecucion:   ejecuto la funcion que quiero probar.
 *   - Verificacion: confirmo que el resultado sea el esperado.
 */
describe("Tests unitarios del simulador", () => {
  // -------------------------------------------------------------------------
  // TEST UNITARIO 1: calculateNodeCapacity
  // La capacidad total de un nodo = instancias * capacidad por instancia.
  // -------------------------------------------------------------------------
  it("calcula la capacidad total de un nodo (instancias * capacidad)", () => {
    // Preparacion
    const instances = 3;
    const capacityPerInstance = 400;

    // Ejecucion
    const capacity = calculateNodeCapacity(instances, capacityPerInstance);

    // Verificacion
    expect(capacity).toBe(1200);
  });

  // -------------------------------------------------------------------------
  // TEST UNITARIO 2: statusFor
  // El estado de un nodo depende de su carga (load) y de la tasa de error.
  //   load < 0.7            -> "healthy"
  //   0.7 <= load < 0.9     -> "warning"
  //   0.9 <= load < 1.0     -> "high_load"
  //   load >= 1.0           -> "saturated"
  //   errorRate > 0         -> "error" (tiene prioridad)
  // -------------------------------------------------------------------------
  it("devuelve el estado correcto segun la carga del nodo", () => {
    // Preparacion + ejecucion + verificacion
    expect(statusFor(0.5, 0)).toBe("healthy");
    expect(statusFor(0.75, 0)).toBe("warning");
    expect(statusFor(0.95, 0)).toBe("high_load");
    expect(statusFor(1.2, 0)).toBe("saturated");
    // Si hay errores, el estado es "error" sin importar la carga.
    expect(statusFor(0.1, 0.3)).toBe("error");
  });

  // -------------------------------------------------------------------------
  // TEST UNITARIO 3: calculateLatency
  // La latencia crece a medida que el nodo se carga:
  //   load < 0.7   -> latencia base
  //   load < 0.9   -> base * 1.5 (redondeado)
  //   load <= 1.0  -> base * 2
  //   load > 1.0   -> base * 3
  // -------------------------------------------------------------------------
  it("aumenta la latencia a medida que sube la carga", () => {
    // Preparacion
    const baseLatency = 20;

    // Ejecucion + verificacion
    expect(calculateLatency(baseLatency, 0.5)).toBe(20); // sin penalizacion
    expect(calculateLatency(baseLatency, 0.8)).toBe(30); // 20 * 1.5
    expect(calculateLatency(baseLatency, 1.0)).toBe(40); // 20 * 2
    expect(calculateLatency(baseLatency, 1.5)).toBe(60); // 20 * 3
  });
});

describe("Tests unitarios de autenticacion", () => {
  it("rechaza registrar una cuenta si el email no contiene arroba", () => {
    // Preparacion
    const payload = {
      nombre: "Usuario Demo",
      email: "usuariosistema.test",
      contrasena: "demo1234",
    };

    // Ejecucion + verificacion
    expect(() => validateRegistrationPayload(payload)).toThrow("Ingresá un email válido.");
  });
});

describe("Tests unitarios de reglas de negocio del simulador", () => {
  it("calcula capacidad, carga, salida y error en un escenario normal", () => {
    const metrics = calculateNodeTrafficMetrics({
      trafficRps: 600,
      instances: 2,
      capacityPerInstance: 400,
    });

    expect(metrics.capacity).toBe(800);
    expect(metrics.load).toBe(0.75);
    expect(metrics.throughput).toBe(600);
    expect(metrics.errorRate).toBe(0);
  });

  it("calcula perdida de trafico, error y estado cuando el nodo se satura", () => {
    const metrics = calculateNodeTrafficMetrics({
      trafficRps: 1000,
      instances: 2,
      capacityPerInstance: 400,
    });

    expect(metrics.capacity).toBe(800);
    expect(metrics.throughput).toBe(800);
    expect(metrics.dropped).toBe(200);
    expect(metrics.errorRate).toBe(0.2);
    expect(["saturated", "error"]).toContain(metrics.status);
  });

  it("recomienda la cantidad minima de instancias para absorber el trafico", () => {
    const recommendedInstances = recommendInstancesForTraffic(1200, 400, 2);

    expect(recommendedInstances).toBe(3);
  });

  it("permite conectar puerta de enlace API hacia balanceador de carga", () => {
    const source = makeTestNode("gateway", "api_gateway");
    const target = makeTestNode("balancer", "load_balancer");

    const result = validateConnection(source, target, []);

    expect(result.valid).toBe(true);
  });

  it("rechaza conectar base de datos hacia puerta de enlace API", () => {
    const source = makeTestNode("database", "database");
    const target = makeTestNode("gateway", "api_gateway");

    const result = validateConnection(source, target, []);

    expect(result.valid).toBe(false);
  });
});
