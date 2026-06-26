import { describe, expect, it } from "vitest";
import { csrfMiddleware } from "../backend/src/middlewares/csrf.middleware";
import { loginRateLimitMiddleware } from "../backend/src/middlewares/rate-limit.middleware";
import {
  authService,
  safeEqualString,
  validateRegistrationPayload,
} from "../backend/src/services/auth.service";
import {
  calculateLatency,
  calculateBandwidthCapacityRps,
  calculateCacheMissTraffic,
  calculateEffectiveRequestSizeKb,
  calculateTrafficMBps,
  MAX_NODES,
  MAX_TRAFFIC_RPS,
  calculateNodeCapacity,
  calculateNodeTrafficMetrics,
  normalizeSimulationPayload,
  recommendInstancesForTraffic,
  statusFor,
  validateConnection,
  type SimNode,
} from "../src/lib/simulator";

function makeMockResponse() {
  const headers: Record<string, string> = {};
  return {
    statusCode: 200,
    body: undefined as unknown,
    headers,
    cookies: {} as Record<string, unknown>,
    clearedCookies: {} as Record<string, unknown>,
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    cookie(name: string, value: string, options: unknown) {
      this.cookies[name] = { value, options };
      return this;
    },
    clearCookie(name: string, options: unknown) {
      this.clearedCookies[name] = options;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

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
    bandwidthMbps: 1000,
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
  // La latencia usa una curva progresiva:
  //   load <= 0.7  -> latencia base
  //   0.7..1.0     -> crecimiento continuo hasta 3x
  //   load > 1.0   -> se mantiene en 3x para evitar infinitos
  // -------------------------------------------------------------------------
  it("aumenta la latencia con una curva progresiva y acotada", () => {
    const baseLatency = 20;

    expect(calculateLatency(baseLatency, 0.5)).toBe(20);
    expect(calculateLatency(baseLatency, 0.7)).toBe(20);
    expect(calculateLatency(baseLatency, 0.8)).toBeGreaterThan(20);
    expect(calculateLatency(baseLatency, 0.8)).toBeLessThan(calculateLatency(baseLatency, 0.9));
    expect(calculateLatency(baseLatency, 0.9)).toBeLessThan(calculateLatency(baseLatency, 0.99));
    expect(calculateLatency(baseLatency, 1.0)).toBe(60);
    expect(calculateLatency(baseLatency, 1.5)).toBe(60);
  });

  it("normaliza entradas invalidas de latencia sin producir valores negativos", () => {
    expect(calculateLatency(-20, 0.9)).toBe(0);
    expect(calculateLatency(20, Number.POSITIVE_INFINITY)).toBe(60);
    expect(calculateLatency(20, Number.NaN)).toBe(20);
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

  it("rechaza registrar una cuenta si la contrasena es demasiado corta", () => {
    const payload = {
      nombre: "Usuario Demo",
      email: "usuario@sistema.test",
      contrasena: "demo1234",
    };

    expect(() => validateRegistrationPayload(payload)).toThrow(
      "La contraseña debe tener al menos 10 caracteres.",
    );
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

  it("calcula MBps correctamente con tamaño uniforme", () => {
    const effectiveSizeKb = calculateEffectiveRequestSizeKb({
      averageRequestSizeKb: 8,
      heavyRequestPercentage: 0,
      heavyRequestSizeKb: 100,
    });

    expect(effectiveSizeKb).toBe(8);
    expect(calculateTrafficMBps(256, effectiveSizeKb)).toBe(2);
  });

  it("calcula MBps correctamente con mezcla heavy/liviano", () => {
    const effectiveSizeKb = calculateEffectiveRequestSizeKb({
      averageRequestSizeKb: 5,
      heavyRequestPercentage: 20,
      heavyRequestSizeKb: 50,
    });

    expect(effectiveSizeKb).toBe(14);
    expect(calculateTrafficMBps(1024, effectiveSizeKb)).toBe(14);
  });

  it("satura por RPS cuando bandwidth está OK", () => {
    const metrics = calculateNodeTrafficMetrics({
      trafficRps: 1000,
      instances: 1,
      capacityPerInstance: 800,
      bandwidthMbps: 1000,
      averageRequestSizeKb: 5,
    });

    expect(metrics.saturationReason).toBe("rps");
    expect(metrics.dropped).toBe(200);
  });

  it("satura por bandwidth cuando RPS está OK", () => {
    const metrics = calculateNodeTrafficMetrics({
      trafficRps: 100,
      instances: 1,
      capacityPerInstance: 1000,
      bandwidthMbps: 10,
      averageRequestSizeKb: 200,
    });

    expect(metrics.saturationReason).toBe("bandwidth");
    expect(metrics.throughput).toBeCloseTo(calculateBandwidthCapacityRps(10, 200));
  });

  it("no satura cuando ambos están dentro de capacidad", () => {
    const metrics = calculateNodeTrafficMetrics({
      trafficRps: 100,
      instances: 1,
      capacityPerInstance: 1000,
      bandwidthMbps: 100,
      averageRequestSizeKb: 5,
    });

    expect(metrics.saturationReason).toBe("none");
    expect(metrics.dropped).toBe(0);
  });

  it("proyecto guardado sin averageRequestSizeKb usa default y no rompe", () => {
    const payload = normalizeSimulationPayload({
      traffic: 100,
      nodes: [makeTestNode("gateway", "api_gateway")],
      edges: [],
    });

    expect(payload.averageRequestSizeKb).toBe(5);
    expect(payload.heavyRequestPercentage).toBe(0);
    expect(payload.heavyRequestSizeKb).toBe(50);
    expect(payload.nodes[0].bandwidthMbps).toBe(1000);
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

  it("calcula el trafico que sigue hacia la base despues de pasar por cache", () => {
    expect(calculateCacheMissTraffic(1000, 0.7)).toBeCloseTo(300);
    expect(calculateCacheMissTraffic(1000, 1)).toBe(0);
    expect(calculateCacheMissTraffic(1000, 0)).toBe(1000);
  });

  it("limita el trafico de simulacion al maximo permitido", () => {
    const payload = normalizeSimulationPayload({
      traffic: MAX_TRAFFIC_RPS + 1,
      nodes: [makeTestNode("gateway", "api_gateway")],
      edges: [],
    });

    expect(payload.traffic).toBe(MAX_TRAFFIC_RPS);
  });

  it("rechaza grafos que superan la cantidad maxima de nodos", () => {
    const nodes = Array.from({ length: MAX_NODES + 1 }, (_, index) =>
      makeTestNode(`node-${index}`, "app_service"),
    );

    expect(() => normalizeSimulationPayload({ traffic: 100, nodes, edges: [] })).toThrow(
      `El proyecto no puede tener más de ${MAX_NODES} nodos.`,
    );
  });

  it("permite conectar puerta de enlace API hacia balanceador de carga", () => {
    const source = makeTestNode("gateway", "api_gateway");
    const target = makeTestNode("balancer", "load_balancer");

    const result = validateConnection(source, target, []);

    expect(result.valid).toBe(true);
  });

  it("permite conectar servicio de aplicacion hacia cache y cache hacia base de datos", () => {
    const app = makeTestNode("app", "app_service");
    const cache = makeTestNode("cache", "cache");
    const database = makeTestNode("database", "database");

    const appToCache = validateConnection(app, cache, []);
    const cacheToDatabase = validateConnection(cache, database, [
      { id: "e1", from: "app", to: "cache" },
    ]);

    expect(appToCache.valid).toBe(true);
    expect(cacheToDatabase.valid).toBe(true);
  });

  it("rechaza conectar base de datos hacia puerta de enlace API", () => {
    const source = makeTestNode("database", "database");
    const target = makeTestNode("gateway", "api_gateway");

    const result = validateConnection(source, target, []);

    expect(result.valid).toBe(false);
  });
});

describe("Tests unitarios de sesion segura", () => {
  it("compara firmas de sesion en tiempo constante cuando tienen igual longitud", () => {
    expect(safeEqualString("firma-valida", "firma-valida")).toBe(true);
    expect(safeEqualString("firma-valida", "firma-falsa-")).toBe(false);
    expect(safeEqualString("firma-valida", "corta")).toBe(false);
  });

  it("configura cookies de sesion HttpOnly y las limpia con opciones compatibles", () => {
    const response = makeMockResponse();

    authService.setSessionCookie(response, "ses.payload.firma");
    authService.clearSessionCookie(response);

    expect(response.cookies[authService.cookieName]).toMatchObject({
      value: "ses.payload.firma",
      options: { httpOnly: true, sameSite: "lax", path: "/" },
    });
    expect(response.clearedCookies[authService.cookieName]).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    expect(response.clearedCookies[authService.cookieName]).not.toHaveProperty("maxAge");
  });
});
describe("Tests unitarios de middlewares de seguridad", () => {
  it("bloquea requests con cookie sin token CSRF en metodos con cambios", () => {
    const request = {
      method: "POST",
      auth: { viaCookie: true, csrfToken: "csrf-valido" },
      get: () => undefined,
    };
    const response = makeMockResponse();
    const nextCalls: unknown[] = [];

    csrfMiddleware(request, response, (error?: unknown) => nextCalls.push(error));

    expect(nextCalls).toHaveLength(1);
    expect(nextCalls[0]).toMatchObject({ statusCode: 403 });
  });

  it("permite requests con cookie cuando el token CSRF coincide", () => {
    const request = {
      method: "POST",
      auth: { viaCookie: true, csrfToken: "csrf-valido" },
      get: (name: string) => (name === "x-csrf-token" ? "csrf-valido" : undefined),
    };
    const response = makeMockResponse();
    const nextCalls: unknown[] = [];

    csrfMiddleware(request, response, (error?: unknown) => nextCalls.push(error));

    expect(nextCalls).toEqual([undefined]);
  });

  it("limita intentos de login por combinacion de ip y email", () => {
    const middleware = loginRateLimitMiddleware(60_000, 2);
    const request = {
      ip: "203.0.113.10",
      socket: {},
      body: { email: "usuario@sistema.test" },
    };
    const firstResponse = makeMockResponse();
    const secondResponse = makeMockResponse();
    const thirdResponse = makeMockResponse();
    let nextCount = 0;

    middleware(request, firstResponse, () => {
      nextCount += 1;
    });
    middleware(request, secondResponse, () => {
      nextCount += 1;
    });
    middleware(request, thirdResponse, () => {
      nextCount += 1;
    });

    expect(nextCount).toBe(2);
    expect(thirdResponse.statusCode).toBe(429);
    expect(thirdResponse.headers["Retry-After"]).toBeDefined();
  });
});
