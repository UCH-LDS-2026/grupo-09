# Demo para profesor

Esta guía muestra los avances del MVP y propone pruebas simples para defender Fase 0, Fase 1, Fase 2 y Fase 3.

## Cómo levantar el sistema

1. Levantar backend:

```bash
cd backend
npm run dev
```

Backend esperado: `http://localhost:3001`.

2. Levantar frontend en otra terminal:

```bash
npm run dev
```

Frontend esperado: `http://localhost:8080` o el siguiente puerto libre, por ejemplo `8081`.

3. Verificar API:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/db
curl -X POST http://localhost:3001/api/simulations/run \
  -H "Content-Type: application/json" \
  -d '{"traffic":600,"nodes":[{"id":"gw","kind":"api_gateway","name":"Gateway","instances":2,"capacity":800,"baseLatency":8,"queueSize":100,"timeout":2000,"costPerInstance":25},{"id":"app","kind":"app_service","name":"App","instances":2,"capacity":400,"baseLatency":35,"queueSize":100,"timeout":3000,"costPerInstance":40}],"edges":[{"id":"e1","from":"gw","to":"app"}]}'
```

Los health deben responder `status: ok`. La simulación debe devolver `result.perNode`, `result.totals` y `result.cycles`.

## Qué decir de cada fase

### Fase 0 - Estabilización

La base del MVP está estable:

- El frontend levanta.
- El backend levanta.
- La base de datos responde.
- El frontend se comunica con backend por `projectService`.
- Los proyectos se pueden guardar, listar, cargar, actualizar y borrar.
- El proyecto pasa `npm run lint`, `npx tsc --noEmit` y `npm run build`.

### Fase 1 - Panel derecho

El panel derecho permite configurar cada componente:

- Nombre.
- Instancias.
- Capacidad por instancia.
- Latencia base.
- Tamaño de cola.
- Timeout.
- Costo por instancia.

También muestra métricas calculadas:

- Capacidad total.
- Costo mensual.
- Entrada.
- Carga.
- Salida procesada.
- Cola.
- Error.
- Latencia.
- Estado.

### Fase 2 - Motor por ciclos

La simulación corre en 6 ciclos discretos. El motor está centralizado en `shared/simulator-core.js`, el backend lo expone con `POST /api/simulations/run` y el frontend usa ese endpoint con fallback local.

En cada ciclo:

- Entra tráfico al nodo inicial.
- Cada nodo procesa hasta su capacidad.
- El exceso pasa a cola interna si hay espacio.
- Si la cola no alcanza, el exceso se marca como error/descarte.
- La salida procesada se propaga a los nodos conectados.

El resultado se refleja en:

- Métricas de cada nodo.
- Métricas globales.
- Estado visual del nodo.
- Conclusión automática.
- Cuello de botella explicado.

Endpoint de simulación:

```text
POST /api/simulations/run
```

Body esperado:

```json
{
  "traffic": 600,
  "nodes": [],
  "edges": []
}
```

Respuesta:

```json
{
  "result": {
    "perNode": {},
    "totals": {},
    "cycles": []
  }
}
```

### Fase 3 - Seguridad y validaciones backend

El backend ya no depende de que el frontend se porte bien:

- Valida nodos y conexiones desde API.
- Bloquea tipos desconocidos.
- Bloquea conexiones duplicadas.
- Bloquea conexiones a nodos inexistentes.
- Bloquea ciclos.
- Valida ids de proyecto.
- Usa headers mínimos de seguridad.
- Usa rate limit simple para `/api`.
- Frontend y backend comparten reglas y motor desde `shared/simulator-core.js`.

## Sistema simple para mostrar

Construir esta arquitectura:

```text
API Gateway -> Load Balancer -> App Service -> Database
```

Valores recomendados:

- Tráfico entrante: `600 req/s`.
- API Gateway: `2` instancias, `800 req/s`.
- Load Balancer: `2` instancias, `5000 req/s`.
- App Service: `2` instancias, `400 req/s`.
- Database: `1` instancia, `600 req/s`.

Qué debería verse:

- El sistema funciona estable o cerca del límite.
- App Service o Database pueden aparecer como posibles cuellos según capacidades.
- La salida procesada y la tasa de error se actualizan al cambiar tráfico.

## Pruebas para hacer en vivo

### Prueba 1 - Sistema estable

1. Usar la arquitectura simple.
2. Poner tráfico en `600 req/s`.
3. Ejecutar simulación.

Resultado esperado:

- Error cercano a `0%`.
- Nodos en estado estable o advertencia leve.
- Conclusión indicando funcionamiento normal.

### Prueba 2 - Saturación

1. Subir tráfico a `3000 req/s`.
2. Observar App Service y Database.

Resultado esperado:

- Aparece estado saturado o con errores.
- Aumenta cola.
- Aumenta tasa de error.
- La conclusión indica cuello de botella y recomendación de escalar instancias.

### Prueba 3 - Escalado

1. Seleccionar el nodo saturado.
2. Subir instancias.
3. Comparar carga, error y salida procesada.

Resultado esperado:

- Baja el porcentaje de carga.
- Baja el error.
- Mejora la salida procesada.
- Aumenta el costo mensual.

### Prueba 4 - Conexión inválida

1. Intentar conectar `Load Balancer -> Database`.

Resultado esperado:

- El frontend bloquea la conexión.
- El mensaje explica que el flujo debe ir por entrada, distribución, procesamiento y almacenamiento.

### Prueba 5 - Ciclo inválido

1. Intentar crear una conexión que vuelva hacia atrás en el flujo.

Resultado esperado:

- El sistema bloquea el ciclo.
- No se guarda una arquitectura inválida.

### Prueba 6 - Persistencia

1. Poner nombre al proyecto.
2. Guardar.
3. Cargarlo desde el selector.
4. Modificar una capacidad.
5. Guardar de nuevo.

Resultado esperado:

- Nodos y conexiones se mantienen.
- Los valores editados se recuperan.
- La conexión front-back-DB queda demostrada.

## Dónde puede fallar hoy

Estos puntos son límites honestos del MVP:

- No hay login real: se usa usuario demo.
- Las corridas de simulación no se guardan como historial; eso corresponde a Fase 4.
- La simulación tiene endpoint backend, pero todavía no guarda historial de corridas.
- Todavía no hay jobs asincrónicos ni persistencia de métricas de corridas.
- No hay tests automatizados completos todavía.
- La validación está centralizada en un módulo compartido; en una fase futura podría migrarse a schemas formales como Zod/Joi.
- Si MySQL no está levantado o no tiene `schema.sql` aplicado, `/api/health/db` falla.

## Frase corta para defender el avance

El sistema ya permite diseñar una arquitectura distribuida simple, simular tráfico por ciclos, detectar carga, cola, errores y cuello de botella, y persistir proyectos completos conectando frontend, backend y base de datos.
