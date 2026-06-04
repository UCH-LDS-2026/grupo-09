# Contexto para Codex - MVP Simulador de Arquitectura Distribuida

## 1. Objetivo del proyecto

Este proyecto es un **simulador visual de arquitectura distribuida**. La idea no es solamente dibujar componentes, sino permitir que el usuario arme una arquitectura, conecte sus partes, configure tráfico de entrada y ejecute una simulación para saber si el sistema soporta la carga.

El usuario debe poder:

1. Crear o cargar un proyecto.
2. Arrastrar componentes al canvas.
3. Conectar componentes respetando reglas arquitectónicas.
4. Editar propiedades de cada componente.
5. Ejecutar una simulación.
6. Ver métricas globales y por componente.
7. Detectar cuellos de botella.
8. Guardar el proyecto.

El MVP debe priorizar que **la lógica de simulación sea coherente** antes que agregar funciones avanzadas.

---

## 2. Concepto mental del sistema

El sistema se divide en tres partes principales:

```txt
1. Editor visual
   El usuario crea nodos y conexiones en el canvas.

2. Motor de simulación
   Calcula capacidad, carga, salida, errores, latencia, costo y cuello de botella.

3. Persistencia
   Guarda usuarios, proyectos, nodos, conexiones, corridas y métricas.
```

Flujo general:

```txt
Usuario arma arquitectura
        ↓
Conecta componentes
        ↓
Configura tráfico entrante
        ↓
Ejecuta simulación
        ↓
El motor calcula métricas
        ↓
La UI muestra estado, carga, latencia, errores, costo y recomendaciones
```

---

## 3. MVP esperado

### Funciones principales obligatorias

- Crear proyecto.
- Cargar proyecto.
- Guardar proyecto.
- Agregar componentes al canvas.
- Editar propiedades del componente seleccionado.
- Conectar componentes con reglas válidas.
- Ejecutar simulación.
- Detener/reiniciar simulación si ya existe esa lógica.
- Mostrar métricas globales.
- Mostrar métricas del componente seleccionado.
- Detectar cuello de botella.
- Mostrar estado del sistema: estable, advertencia, saturado o fallando.

### Funciones que pueden quedar para después del MVP

- Login real completo.
- Roles avanzados.
- Historial detallado de simulaciones.
- Comparación entre corridas.
- Exportar reportes.
- Modo colaborativo.
- Objetivos configurables avanzados.
- Recomendaciones complejas con IA.

---

## 4. Componentes principales del simulador

El catálogo inicial de componentes es:

```txt
api_gateway
load_balancer
app_service
cache
database
queue
```

En la UI aparecen como:

```txt
Puerta de enlace API
Balanceador de carga
Servicio de aplicación
Caché
Base de datos
Cola
```

Cada componente debe tener, como mínimo, estas propiedades:

```ts
type SimNode = {
  id: string;
  kind: ComponentKind;
  name: string;
  position: { x: number; y: number };
  instances: number;
  capacityRps: number;
  baseLatencyMs: number;
  queueSize: number;
  timeoutMs: number;
  costPerInstance: number;
};
```

Donde:

- `instances`: cantidad de instancias del componente.
- `capacityRps`: capacidad por instancia en requests por segundo.
- `baseLatencyMs`: latencia base del componente.
- `queueSize`: tamaño máximo de cola si aplica.
- `timeoutMs`: tiempo máximo de espera antes de error.
- `costPerInstance`: costo mensual por instancia.

---

## 5. Rol de cada componente

### API Gateway

Entrada principal de tráfico. Representa el borde del sistema.

Puede recibir tráfico externo y enviarlo a:

- Load Balancer.
- App Service.

No debería conectarse directamente a:

- Database.
- Cache.
- Queue.

---

### Load Balancer

Distribuye tráfico hacia servicios de aplicación.

Puede conectarse a:

- App Service.

No debería conectarse a:

- Database.
- Cache.
- Queue.
- API Gateway como destino inverso.

---

### App Service

Componente principal de cómputo. Procesa lógica de negocio.

Puede conectarse a:

- App Service.
- Database.
- Cache.
- Queue.

Esto permite representar microservicios, persistencia, caché y procesamiento asincrónico.

---

### Queue

Representa mensajería asincrónica. Desacopla tareas pesadas.

Puede recibir mensajes desde:

- App Service.

Puede enviar mensajes hacia:

- App Service.

Ejemplo válido:

```txt
App Service → Queue → App Service Worker
```

La conexión que pasa por una cola debería marcarse como asincrónica (`isAsync = true`) si el modelo lo soporta.

---

### Cache

Representa una capa de lectura rápida.

Para el MVP se recomienda permitir:

```txt
App Service → Cache
```

Opcionalmente:

```txt
Cache → Database
```

Pero para simplificar el MVP, se puede tratar a Cache como un componente auxiliar que reduce latencia o carga hacia la base de datos, sin obligar a conectarlo físicamente con Database.

---

### Database

Representa almacenamiento persistente.

Normalmente recibe tráfico desde:

- App Service.

No debería enviar tráfico hacia otros componentes en el MVP.

Puede ser destino final de una rama.

---

## 6. Reglas de conexión

No permitir que todos los componentes se conecten con todos. Eso haría que la simulación pierda sentido.

Las conexiones deben validar coherencia arquitectónica.

### Tabla de conexiones permitidas

```txt
Origen                  Destinos permitidos
----------------------------------------------------------
api_gateway             load_balancer, app_service
load_balancer           app_service
app_service             app_service, database, cache, queue
queue                   app_service
cache                   database opcional
 database               ninguno
```

Versión en TypeScript sugerida:

```ts
const allowedConnections: Record<ComponentKind, ComponentKind[]> = {
  api_gateway: ['load_balancer', 'app_service'],
  load_balancer: ['app_service'],
  app_service: ['app_service', 'database', 'cache', 'queue'],
  queue: ['app_service'],
  cache: ['database'],
  database: []
};

export function canConnect(sourceKind: ComponentKind, targetKind: ComponentKind): boolean {
  return allowedConnections[sourceKind]?.includes(targetKind) ?? false;
}
```

### Validaciones al crear conexión

Antes de crear una conexión, validar:

1. Que el nodo origen exista.
2. Que el nodo destino exista.
3. Que origen y destino no sean el mismo nodo.
4. Que la conexión no exista ya.
5. Que la conexión esté permitida por `allowedConnections`.
6. Que no genere un ciclo peligroso, salvo que se quiera permitir microservicios avanzados.

Ejemplo:

```ts
function validateConnection(source: SimNode, target: SimNode, edges: SimEdge[]): ConnectionValidationResult {
  if (!source || !target) {
    return { valid: false, message: 'Origen o destino inválido.' };
  }

  if (source.id === target.id) {
    return { valid: false, message: 'No se puede conectar un componente consigo mismo.' };
  }

  const alreadyExists = edges.some(
    edge => edge.from === source.id && edge.to === target.id
  );

  if (alreadyExists) {
    return { valid: false, message: 'La conexión ya existe.' };
  }

  if (!canConnect(source.kind, target.kind)) {
    return {
      valid: false,
      message: `No se puede conectar ${source.name} con ${target.name}. La conexión no es válida para esta arquitectura.`
    };
  }

  return { valid: true };
}
```

---

## 7. Qué conexiones bloquear

Estas conexiones deben bloquearse en el MVP:

```txt
Database → API Gateway
Database → Load Balancer
Database → Queue
Database → Cache
Database → App Service

Load Balancer → Database
Load Balancer → Queue
Load Balancer → Cache

Cache → API Gateway
Cache → Load Balancer
Cache → Queue

Queue → API Gateway
Queue → Load Balancer
Queue → Database

API Gateway → Database
API Gateway → Cache
API Gateway → Queue
```

Mensaje recomendado para el usuario:

```txt
Esta conexión no es válida. Cada componente cumple un rol dentro del flujo de arquitectura distribuida.
```

Mensaje más específico:

```txt
Un balanceador de carga solo puede distribuir tráfico hacia servicios de aplicación.
```

---

## 8. Estructura de conexión

Una conexión representa flujo dirigido.

```ts
type SimEdge = {
  id: string;
  from: string;
  to: string;
  isAsync?: boolean;
};
```

Ejemplo:

```txt
Load Balancer ───▶ App Service
```

Significa:

```txt
from = load_balancer_node_id
to = app_service_node_id
```

La dirección importa porque el motor usa las conexiones para saber cómo viaja el tráfico.

---

## 9. Cálculos principales del simulador

### 9.1 Capacidad total

```txt
capacidad_total = instancias × capacidad_por_instancia
```

Ejemplo:

```txt
App Service
2 instancias
400 req/s por instancia

capacidad_total = 2 × 400 = 800 req/s
```

---

### 9.2 Carga del componente

```txt
carga = tráfico_entrante / capacidad_total
```

Ejemplo:

```txt
tráfico_entrante = 400 req/s
capacidad_total = 800 req/s

carga = 400 / 800 = 0.5 = 50%
```

---

### 9.3 Salida real / throughput real

```txt
salida = min(tráfico_entrante, capacidad_total)
```

Ejemplo estable:

```txt
tráfico_entrante = 400
capacidad_total = 800

salida = 400 req/s
```

Ejemplo saturado:

```txt
tráfico_entrante = 1200
capacidad_total = 800

salida = 800 req/s
```

---

### 9.4 Excedente

```txt
excedente = max(0, tráfico_entrante - capacidad_total)
```

Ejemplo:

```txt
tráfico_entrante = 1200
capacidad_total = 800

excedente = 400 req/s
```

---

### 9.5 Tasa de error

Para el MVP, usar fórmula simple:

```txt
error_rate = excedente / tráfico_entrante
```

Con protección por división por cero:

```ts
const errorRate = incomingTraffic > 0
  ? Math.max(0, incomingTraffic - totalCapacity) / incomingTraffic
  : 0;
```

Ejemplo:

```txt
tráfico_entrante = 1000
capacidad_total = 800
excedente = 200

error_rate = 200 / 1000 = 0.2 = 20%
```

---

### 9.6 Latencia efectiva

Cada componente tiene una latencia base. La latencia efectiva debe aumentar cuando la carga sube.

Regla simple para MVP:

```txt
Si carga < 70%:
    latencia = latencia_base

Si carga >= 70% y carga < 90%:
    latencia = latencia_base × 1.5

Si carga >= 90% y carga <= 100%:
    latencia = latencia_base × 2

Si carga > 100%:
    latencia = latencia_base × 3
```

Ejemplo TypeScript:

```ts
function calculateLatency(baseLatencyMs: number, loadRatio: number): number {
  if (loadRatio < 0.7) return baseLatencyMs;
  if (loadRatio < 0.9) return Math.round(baseLatencyMs * 1.5);
  if (loadRatio <= 1) return Math.round(baseLatencyMs * 2);
  return Math.round(baseLatencyMs * 3);
}
```

---

### 9.7 Costo mensual

```txt
costo_nodo = instancias × costo_por_instancia
```

Ejemplo:

```txt
App Service
2 instancias
$40 por instancia

costo_nodo = 2 × 40 = $80/mes
```

Costo total:

```txt
costo_total = suma de costo_nodo de todos los nodos
```

---

## 10. Estados de cada componente

Estados recomendados:

```txt
Carga menor a 70%       → stable
Carga entre 70% y 89%   → warning
Carga entre 90% y 99%   → high_load
Carga mayor o igual 100%→ saturated
Error alto              → failed
```

Ejemplo TypeScript:

```ts
function getNodeStatus(loadRatio: number, errorRate: number): NodeStatus {
  if (errorRate >= 0.5) return 'failed';
  if (loadRatio >= 1) return 'saturated';
  if (loadRatio >= 0.9) return 'high_load';
  if (loadRatio >= 0.7) return 'warning';
  return 'stable';
}
```

Estados visuales sugeridos:

```txt
stable     → Estable
warning    → Advertencia
high_load  → Alta carga
saturated  → Saturado
failed     → Fallando
```

---

## 11. Métricas globales

La UI inferior debería mostrar métricas globales claras.

Recomendación de nombres:

```txt
Tráfico total: tráfico configurado por el usuario.
Salida real: requests procesados correctamente al final del flujo.
Capacidad total: capacidad máxima del componente limitante o del flujo principal.
Latencia promedio: suma o promedio ponderado de latencias de nodos atravesados.
Tasa de error: porcentaje de requests que no pudieron procesarse.
Costo mensual estimado: suma de costos de todos los nodos.
```

Importante: evitar confundir `rendimiento` con `capacidad`.

Si abajo se muestra:

```txt
Rendimiento: 800 r/s
```

pero el tráfico entrante es:

```txt
400 req/s
```

entonces ese valor probablemente no es rendimiento real, sino capacidad instalada. Conviene renombrarlo:

```txt
Capacidad: 800 req/s
```

O si se quiere mostrar procesamiento real:

```txt
Salida real: 400 req/s
```

---

## 12. Algoritmo de simulación recomendado para MVP

### Opción simple

Para el MVP, se puede simular recorriendo el grafo desde los nodos de entrada.

Un nodo de entrada es un nodo sin conexiones entrantes o específicamente un API Gateway si existe.

Pseudocódigo:

```txt
traffic = project.incomingTrafficRps

buscar nodo inicial:
    preferir API Gateway
    si no existe, usar nodo sin entradas
    si no existe, usar primer nodo del canvas

recorrer conexiones en orden:
    para cada nodo:
        capacidad_total = instancias × capacidad_por_instancia
        carga = tráfico_entrante / capacidad_total
        salida = min(tráfico_entrante, capacidad_total)
        error = max(0, tráfico_entrante - capacidad_total) / tráfico_entrante
        latencia = calcularLatencia(latencia_base, carga)
        costo = instancias × costo_por_instancia
        estado = calcularEstado(carga, error)

        pasar salida al siguiente nodo
```

---

### Resultado por nodo

```ts
type NodeMetrics = {
  nodeId: string;
  incomingRps: number;
  capacityRps: number;
  loadRatio: number;
  throughputRps: number;
  latencyMs: number;
  errorRate: number;
  status: NodeStatus;
  monthlyCost: number;
};
```

---

### Resultado global

```ts
type SimResult = {
  incomingTrafficRps: number;
  throughputRps: number;
  avgLatencyMs: number;
  errorRate: number;
  monthlyCost: number;
  bottleneckNodeId?: string;
  nodeMetrics: Record<string, NodeMetrics>;
  status: 'stable' | 'warning' | 'saturated' | 'failed';
};
```

---

## 13. Cuello de botella

El cuello de botella es el nodo más limitado del sistema.

Regla simple:

```txt
cuello_de_botella = nodo con mayor loadRatio
```

Pero priorizar nodos con:

```txt
loadRatio >= 1
```

Ejemplo:

```txt
API Gateway: 20%
Load Balancer: 5%
App Service: 130%
Database: 40%

Cuello de botella = App Service
```

Código sugerido:

```ts
function findBottleneck(metrics: NodeMetrics[]): NodeMetrics | undefined {
  if (metrics.length === 0) return undefined;

  return [...metrics].sort((a, b) => b.loadRatio - a.loadRatio)[0];
}
```

---

## 14. Recomendaciones de escalado

Para el MVP, generar recomendación solo si un nodo está saturado.

Fórmula:

```txt
instancias_recomendadas = ceil(tráfico_entrante / capacidad_por_instancia)
```

Ejemplo:

```txt
tráfico_entrante = 1200 req/s
capacidad_por_instancia = 400 req/s
instancias_actuales = 2

instancias_recomendadas = ceil(1200 / 400) = 3
```

Recomendación:

```txt
El Servicio de aplicación está saturado. Se recomienda pasar de 2 a 3 instancias.
```

Costo extra:

```txt
costo_extra = (instancias_recomendadas - instancias_actuales) × costo_por_instancia
```

---

## 15. Persistencia y base de datos

El modelo esperado separa catálogo, proyecto, nodos, conexiones y simulaciones.

### Tablas principales

```txt
users
projects
component_categories
component_types
projects_nodes
projects_edges
objective_types
project_objectives
simulation_runs
simulation_node_metrics
scaling_recommendations
```

### Mapeo mental entre frontend y base de datos

```txt
SimNode                 → projects_nodes
SimEdge                 → projects_edges
NodeMetrics             → simulation_node_metrics
SimResult               → simulation_runs
KIND_META/componentes   → component_types
```

### projects

Guarda datos generales del proyecto:

```txt
id
user_id
name
slug
description
incoming_traffic_rps
is_running
created_at
updated_at
```

### projects_nodes

Guarda cada componente colocado en el canvas:

```txt
id
project_id
component_type_id
client_node_id
name
position_x
position_y
instances
capacity_rps
base_latency_ms
queue_size
timeout_ms
cost_per_instance
```

### projects_edges

Guarda las conexiones:

```txt
id
project_id
client_edge_id
from_node_id
to_node_id
is_async
created_at
```

### simulation_runs

Guarda cada ejecución:

```txt
id
project_id
incoming_traffic_rps
avg_latency_ms
error_rate
throughput_rps
monthly_cost
bottleneck_node_id
created_at
```

### simulation_node_metrics

Guarda métricas por nodo:

```txt
id
simulation_run_id
project_node_id
load_ratio
throughput_rps
latency_ms
error_rate
status
monthly_cost
created_at
```

---

## 16. Reglas de guardado

Cuando el usuario hace click en Guardar:

1. Guardar o actualizar `projects`.
2. Guardar o actualizar `projects_nodes`.
3. Guardar o actualizar `projects_edges`.
4. Eliminar nodos/conexiones que ya no existan en el canvas.

Cuando el usuario ejecuta simulación:

1. Calcular `SimResult`.
2. Crear un registro en `simulation_runs`.
3. Crear registros en `simulation_node_metrics`.
4. Si hay saturación, crear `scaling_recommendations`.

---

## 17. Comportamiento visual recomendado

### Barra superior

No sobrecargarla. Mantener acciones principales visibles:

```txt
Nuevo proyecto | Selector de proyecto | Guardar | Ejecutar | Detener | Más opciones
```

Meter en menú secundario:

```txt
Limpiar canvas
Duplicar proyecto
Eliminar componente
Borrar proyecto
```

Las acciones peligrosas deben tener confirmación.

---

### Canvas

Debe mostrar:

- Nodos.
- Conexiones dirigidas.
- Estado visual del nodo.
- Métrica corta sobre cada nodo.

Ejemplo de tarjeta:

```txt
Servicio de aplicación
2x · 400 req/s
Carga: 50%
Estado: Estable
```

---

### Panel derecho

Cuando se selecciona un nodo, mostrar:

- Nombre.
- Tipo.
- Estado.
- Instancias.
- Capacidad por instancia.
- Latencia base.
- Costo por instancia.
- Métricas calculadas:
  - carga
  - latencia efectiva
  - salida
  - error

---

### Panel inferior

Mostrar métricas globales:

```txt
Tráfico total
Salida real
Latencia promedio
Tasa de error
Costo mensual estimado
Cuello de botella
```

---

## 18. Casos de prueba manuales

### Caso 1: sistema estable

Arquitectura:

```txt
Load Balancer → App Service
```

Datos:

```txt
Tráfico: 400 req/s
Load Balancer: 2 × 5000 req/s
App Service: 2 × 400 req/s
```

Resultado esperado:

```txt
App Service capacidad total = 800 req/s
Carga = 400 / 800 = 50%
Salida = 400 req/s
Error = 0%
Estado = Estable
```

---

### Caso 2: servicio saturado

Arquitectura:

```txt
Load Balancer → App Service
```

Datos:

```txt
Tráfico: 1200 req/s
App Service: 2 × 400 req/s
```

Resultado esperado:

```txt
Capacidad total = 800 req/s
Carga = 150%
Salida = 800 req/s
Excedente = 400 req/s
Error = 400 / 1200 = 33.33%
Estado = Saturado
Cuello de botella = App Service
Recomendación = subir a 3 instancias
```

---

### Caso 3: conexión inválida

Intento:

```txt
Load Balancer → Database
```

Resultado esperado:

```txt
No se crea la conexión.
Mensaje: Un balanceador de carga solo puede distribuir tráfico hacia servicios de aplicación.
```

---

### Caso 4: arquitectura con cola

Arquitectura:

```txt
App Service → Queue → App Service Worker
```

Resultado esperado:

```txt
La cola desacopla el procesamiento.
La conexión puede marcarse como isAsync = true.
Si el worker tiene poca capacidad, el cuello de botella puede ser el worker o la cola.
```

---

## 19. Prioridades de implementación para Codex

Trabajar en este orden:

```txt
1. Revisar tipos principales: SimNode, SimEdge, NodeMetrics, SimResult.
2. Implementar reglas de conexión.
3. Validar conexiones antes de crearlas.
4. Mejorar mensajes de error para conexiones inválidas.
5. Revisar cálculo de capacidad, carga, salida, error, latencia y costo.
6. Separar claramente capacidad instalada de throughput real.
7. Corregir nombres visuales confusos como Rendimiento si representa capacidad.
8. Detectar cuello de botella.
9. Mostrar métricas coherentes en panel derecho e inferior.
10. Guardar nodos y conexiones del proyecto.
11. Guardar resultado de simulación si ya está implementado backend/base.
```

---

## 20. No romper estas reglas

- No permitir conexiones completamente libres.
- No mezclar capacidad con salida real.
- No mostrar “Sistema estable” si la simulación está detenida o si hay nodos saturados.
- No mostrar carga 0% si existe tráfico entrando al nodo.
- No mostrar salida 0 r/s si el nodo recibe tráfico y tiene capacidad disponible.
- No hacer que el balanceador envíe tráfico directo a base de datos o cola.
- No hacer que la base de datos sea origen de tráfico en el MVP.
- No guardar todo como JSON gigante si ya existe modelo relacional.

---

## 21. Diferenciar estado de simulación y estado del sistema

Son cosas distintas.

### Estado de simulación

```txt
Detenida
Ejecutándose
Pausada
```

### Estado del sistema

```txt
Estable
Advertencia
Saturado
Fallando
```

Ejemplo:

```txt
Simulación: Ejecutándose
Sistema: Estable
```

Otro ejemplo:

```txt
Simulación: Detenida
Sistema: Sin evaluar
```

No mostrar “Sistema estable” si todavía no se ejecutó ninguna simulación.

---

## 22. Definición de terminado para el MVP

El MVP está terminado cuando se pueda demostrar esto en vivo:

1. Crear un proyecto nuevo.
2. Agregar un Load Balancer y un App Service.
3. Conectarlos correctamente.
4. Configurar tráfico en 400 req/s.
5. Ejecutar simulación.
6. Ver carga 50% en App Service si tiene 2 instancias de 400 req/s.
7. Subir tráfico a 1200 req/s.
8. Ejecutar simulación.
9. Ver App Service saturado.
10. Ver error mayor a 0%.
11. Ver cuello de botella.
12. Ver recomendación de aumentar instancias.
13. Intentar conectar Load Balancer → Database y ver que el sistema lo bloquea.
14. Guardar el proyecto.
15. Recargarlo y ver los nodos/conexiones restaurados.

---

## 23. Frase guía del proyecto

El proyecto debe poder explicarse así:

```txt
Es un simulador visual donde cada componente tiene capacidad, latencia y costo. Las conexiones definen por dónde viaja el tráfico. Al ejecutar, el sistema compara tráfico contra capacidad y calcula carga, salida, errores, latencia, costo y cuello de botella.
```

La fórmula principal es:

```txt
capacidad_total = instancias × capacidad_por_instancia
carga = tráfico_entrante / capacidad_total
salida = min(tráfico_entrante, capacidad_total)
error = excedente / tráfico_entrante
costo = instancias × costo_por_instancia
```

---

## 24. Tono de implementación

Priorizar código claro y mantenible.

- Evitar soluciones mágicas.
- Evitar hardcodear lógica en componentes visuales si puede estar en `src/lib/simulator.ts`.
- Mantener la lógica del motor de simulación separada de la UI.
- Usar funciones puras para cálculos.
- Hacer que los componentes React solo rendericen estado y disparen acciones.
- Dejar nombres claros: `capacityRps`, `throughputRps`, `incomingRps`, `loadRatio`, `errorRate`, `monthlyCost`.

---

## 25. Archivos donde probablemente se debe trabajar

Dependiendo de la estructura actual, revisar principalmente:

```txt
src/lib/simulator.ts
src/components/SimulatorDashboard.tsx
src/components/*Canvas*.tsx
src/components/*Node*.tsx
src/components/*Sidebar*.tsx
src/components/*Inspector*.tsx
src/types/*
database/schema.sql
```

La lógica fuerte debe vivir en:

```txt
src/lib/simulator.ts
```

La UI debe consumir resultados, no inventar cálculos separados.

