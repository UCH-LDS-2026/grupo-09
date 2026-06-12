# Instrucciones para correr los tests

Este documento explica cómo ejecutar los tests del proyecto, qué prueba cada
uno, cómo verificar que pasan correctamente y cómo provocar un error a propósito
para comprobar que el test realmente detecta fallas.

## Qué se agregó

| Archivo | Tipo | Qué prueba |
|---|---|---|
| `tests/unitarios.test.ts` | 3 tests unitarios | Funciones aisladas del simulador: `calculateNodeCapacity`, `statusFor` y `calculateLatency`. |
| `tests/integracion.test.ts` | 1 test de integración | El motor completo `simulate` (grafo + propagación por ciclos + métricas + cuello de botella). |
| `vitest.config.ts` | Configuración | Permite que Vitest corra los tests sin cargar el plugin de Vite que daba error. |

> Nota: ya existía `tests/simulator.test.ts` con otros 5 tests. En total el
> proyecto corre **9 tests**.

## Diferencia entre test unitario y test de integración

- **Test unitario:** prueba **una sola función aislada**. No usa la base de
  datos, ni el backend, ni el motor completo. Es rápido y sirve para verificar
  una regla puntual (por ejemplo: "capacidad = instancias × capacidad por instancia").
- **Test de integración:** prueba que **varias partes funcionen juntas**. Acá se
  ejecuta `simulate`, que internamente arma el grafo, propaga el tráfico por
  ciclos y calcula todas las métricas. Si cualquiera de esas piezas se rompe, el
  test de integración falla.

## 1. Cómo ejecutar los tests

Desde la **raíz del proyecto** (`grupo-09/`), en la terminal:

```bash
npm test
```

Esto ejecuta Vitest una sola vez y muestra el resultado.

### Comandos útiles adicionales

Correr solo los tests nuevos:

```bash
npx vitest run tests/unitarios.test.ts tests/integracion.test.ts
```

Correr en modo "watch" (se vuelven a ejecutar al guardar cambios):

```bash
npx vitest
```

Correr con reporte de cobertura:

```bash
npm run test:coverage
```

## 2. Resultado esperado cuando los tests son EXITOSOS

Si todo está bien, la salida termina con algo parecido a esto:

```txt
 Test Files  3 passed (3)
      Tests  9 passed (9)
```

Cada archivo en verde y el código de salida es `0`. Eso significa que todas las
reglas del simulador se cumplen.

## 3. Cómo provocar un ERROR a propósito (para comprobar que el test funciona)

Un buen test tiene que **fallar cuando el código (o el valor esperado) está mal**.
Para demostrarlo, cambiá temporalmente un valor esperado en un test y volvé a
correr `npm test`. **Acordate de revertir el cambio después.**

### Ejemplo A — romper un test unitario

Abrí `tests/unitarios.test.ts` y en el TEST UNITARIO 1 cambiá el valor esperado:

```ts
// Valor correcto (pasa):
expect(capacity).toBe(1200);

// Valor incorrecto a propósito (falla):
expect(capacity).toBe(9999);
```

Al correr `npm test`, Vitest mostrará el test en rojo con un mensaje como:

```txt
 FAIL  tests/unitarios.test.ts > Tests unitarios del simulador > calcula la capacidad total de un nodo
AssertionError: expected 1200 to be 9999

- Expected
+ Received

- 9999
+ 1200
```

Esto confirma que el test **realmente verifica** el cálculo: la función devuelve
`1200` y el test esperaba `9999`, por eso falla.

### Ejemplo B — romper el test de integración

Abrí `tests/integracion.test.ts` y cambiá el costo total esperado:

```ts
// Valor correcto (pasa):
expect(result.totals.cost).toBe(210);

// Valor incorrecto a propósito (falla):
expect(result.totals.cost).toBe(0);
```

Al correr `npm test` el test de integración fallará mostrando que el costo real
calculado es `210` y no `0`.

### Ejemplo C — romper el código fuente (falla en cadena)

Si en lugar del test modificás la lógica real, fallan varios tests a la vez.
Por ejemplo, en `shared/simulator-core.js`, en `calculateNodeCapacity`:

```js
// Original (correcto):
return Math.max(0, Number(instances) || 0) * Math.max(0, Number(capacityPerInstance) || 0);

// Roto a propósito (suma en vez de multiplicar):
return Math.max(0, Number(instances) || 0) + Math.max(0, Number(capacityPerInstance) || 0);
```

En este caso fallan tanto el test unitario de capacidad como el de integración
(porque el motor usa esa función). Esto muestra cómo los tests **protegen el
código**: si alguien rompe una regla sin querer, los tests lo avisan.

> Importante: después de cada prueba de error, **revertí el cambio** para dejar
> el proyecto en verde otra vez (`npm test` debe volver a mostrar `9 passed`).

## Resumen rápido

1. `npm test` → corre todos los tests.
2. `9 passed` → todo OK.
3. Cambiar un valor esperado o romper una función → el test pasa a rojo (`FAIL`)
   y muestra qué se esperaba vs. qué se obtuvo.
4. Revertir el cambio → vuelve a `9 passed`.
