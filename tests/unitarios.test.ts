import { describe, expect, it } from "vitest";
import { validateRegistrationPayload } from "../backend/src/services/auth.service";
import { calculateLatency, calculateNodeCapacity, statusFor } from "../src/lib/simulator";

/**
 * TESTS UNITARIOS
 *
 * Un test unitario prueba UNA sola funcion de forma aislada, sin depender
 * de otras partes del sistema (ni base de datos, ni backend, ni el motor completo).
 *
 * Cada test sigue el patron Arrange / Act / Assert:
 *   - Arrange: preparo los datos de entrada.
 *   - Act:     ejecuto la funcion que quiero probar.
 *   - Assert:  verifico que el resultado sea el esperado.
 */
describe("Tests unitarios del simulador", () => {
  // -------------------------------------------------------------------------
  // TEST UNITARIO 1: calculateNodeCapacity
  // La capacidad total de un nodo = instancias * capacidad por instancia.
  // -------------------------------------------------------------------------
  it("calcula la capacidad total de un nodo (instancias * capacidad)", () => {
    // Arrange
    const instances = 3;
    const capacityPerInstance = 400;

    // Act
    const capacity = calculateNodeCapacity(instances, capacityPerInstance);

    // Assert
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
    // Arrange + Act + Assert
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
    // Arrange
    const baseLatency = 20;

    // Act + Assert
    expect(calculateLatency(baseLatency, 0.5)).toBe(20); // sin penalizacion
    expect(calculateLatency(baseLatency, 0.8)).toBe(30); // 20 * 1.5
    expect(calculateLatency(baseLatency, 1.0)).toBe(40); // 20 * 2
    expect(calculateLatency(baseLatency, 1.5)).toBe(60); // 20 * 3
  });
});

describe("Tests unitarios de autenticacion", () => {
  it("rechaza registrar una cuenta si el email no contiene arroba", () => {
    // Arrange
    const payload = {
      name: "Usuario Demo",
      email: "usuariosistema.test",
      password: "demo1234",
    };

    // Act + Assert
    expect(() => validateRegistrationPayload(payload)).toThrow("Ingresá un email válido.");
  });
});
