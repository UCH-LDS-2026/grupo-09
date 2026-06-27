# Quickstart: Validacion de Versionado, Comparacion e Informes

## Prerrequisitos

1. Confirmar migraciones del entorno objetivo. En local, ver `docs/database-migration-status.md`.
2. Ejecutar baseline antes de implementar:

```bash
npm test
npm run build
npm run lint
npm run security:audit
```

## Escenario 1: Versionado

1. Crear o abrir un proyecto existente.
2. Ejecutar simulacion.
3. Guardar version `baseline`.
4. Cambiar instancias, capacidad o bandwidth.
5. Guardar version `optimizada`.
6. Verificar que ambas versiones aparecen en historial y pueden abrirse sin sobrescribirse.

Resultado esperado: la version `baseline` mantiene sus nodos, conexiones, inputs y metricas originales.

## Escenario 2: Comparacion

1. Seleccionar `baseline` como version base.
2. Seleccionar `optimizada` como version candidata.
3. Ejecutar comparacion.

Resultado esperado: se ven deltas de latencia, throughput, error, costo, trafico de red y cuello de botella, mas cambios estructurales.

## Escenario 3: Informe tecnico

1. Desde una version o comparacion, generar informe.
2. Abrirlo o imprimirlo desde el navegador.
3. Confirmar que contiene inputs, arquitectura, resultados, conclusion, recomendacion y limitaciones.

Resultado esperado: una persona puede entender el caso sin abrir el codigo.

## Validacion de cierre por historia

Despues de cada historia implementada:

```bash
npm test
npm run build
npm run lint
npm run security:audit
```
