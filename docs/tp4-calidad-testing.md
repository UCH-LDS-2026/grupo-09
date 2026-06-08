# TP4 - Calidad y Testing

## Objetivo

Agregar pruebas unitarias reales sobre la logica de negocio del Simulador de Arquitectura Distribuida.

El foco esta en calculos, reglas de estado, recomendaciones y validaciones de conexion. No se testean componentes visuales, estilos ni comportamiento del framework.

## Archivos agregados o adaptados

- `tests/simulator.test.ts`: pruebas unitarias del simulador.
- `shared/simulator-core.js`: funciones puras testeables de capacidad, carga, perdida y recomendacion.
- `src/lib/simulator.ts`: reexporta la logica del simulador para frontend y tests.
- `package.json`: scripts `test` y `test:coverage`.

## Comandos

```bash
npm test
npm run test:coverage
```

Tambien se puede ejecutar cobertura con:

```bash
npm test -- --coverage
```

## Casos cubiertos

- Calculo normal: 600 req/s, 2 instancias, 400 req/s por instancia.
- Saturacion: 1000 req/s contra 800 req/s de capacidad total.
- Recomendacion de escalado: 1200 req/s requiere 3 instancias de 400 req/s.
- Conexion valida: API Gateway hacia Load Balancer.
- Conexion invalida: Database hacia API Gateway.

## Reporte de cobertura

El reporte se genera ejecutando `npm run test:coverage`.

Salida esperada:

- Reporte en consola.
- Archivos generados en `coverage/`.
- Reporte HTML principal en `coverage/index.html`.

Ultima ejecucion verificada:

```text
Test Files  1 passed (1)
Tests       5 passed (5)

Statements 18.82%
Branches   17.74%
Functions  21.05%
Lines      19.72%
```

La cobertura inicial es baja porque el archivo compartido contiene tambien normalizacion, ciclos completos de simulacion y validaciones backend que todavia no estan cubiertas. Para el TP4 quedan cubiertas las reglas pedidas: calculo normal, saturacion, recomendacion y conexiones.
