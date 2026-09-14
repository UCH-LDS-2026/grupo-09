# Roadmap técnico para Codex — Software Estrés → Proyecto de Portfolio

> Versión "masticada" del roadmap original, pensada para pegarle a Codex **una fase a la vez**.
> Cada fase ya trae spec técnica concreta (no solo conceptos), criterios de aceptación, casos
> borde, tests obligatorios y el formato exacto del reporte que tiene que devolverte. El objetivo
> es que Codex no tenga que adivinar nada importante.

---

## 0. Cómo usar este documento

1. **No le pegues todo el documento entero a Codex.** Empezá por la sección "Reglas globales"
   (siempre va) + la fase en la que estás. Pegale solo eso.
2. Esperá a que termine, corra tests/build, y te devuelva el reporte (formato en el Anexo A).
3. Revisá el diff (`git diff` o el PR) antes de aceptar. Si algo no cierra, no avances de fase.
4. Recién ahí pasás a la fase siguiente. No saltees fases ni le pidas que haga dos juntas:
   cuanto más acotado el pedido, mejor sale.
5. Si Codex te dice "esto rompe compatibilidad" o "esto no está claro en el código actual",
   **es una señal correcta**, no un error de Codex. Pará y decidí con él, no lo empujes a adivinar.

---

## 1. Reglas globales (van SIEMPRE, en todas las fases)

Pegale esto al principio de cada fase, antes del prompt específico:

```
Reglas que se aplican a esta tarea y a todas las que te pida en este proyecto:

1. Alcance: tocá SOLO lo que esta fase pide. Si para resolverla "de paso" tenés ganas de
   refactorizar otra cosa, no lo hagas — anotalo como sugerencia en el reporte final, pero
   no lo implementes sin que yo lo apruebe.

2. No asumas nombres de archivos ni de funciones. Antes de escribir código, buscá en el
   repo (grep/ls/find) si ya existe algo parecido (función, componente, util) y usá eso como
   base. Si los nombres de archivo que te sugiero no coinciden con la estructura real del
   repo, usá los reales y avisame en el reporte.

3. Compatibilidad hacia atrás: si el repo tiene proyectos/datos guardados de antes de este
   cambio, NUNCA deben romperse al cargarlos. Si falta un campo nuevo, usá un default
   explícito y documentado, no `undefined` silencioso.

4. Si para cumplir la tarea tenés que romper compatibilidad, cambiar un endpoint, eliminar
   una función pública usada en otro lado, o tomar una decisión de diseño no especificada
   acá: DETENETE y preguntame antes de aplicar el cambio. No lo decidas solo.

5. Si los tests ya fallaban ANTES de que tocaras algo, no me digas "todo OK" — reportalo
   aparte como "fallas preexistentes, no relacionadas a este cambio".

6. No instales dependencias nuevas (paquetes npm, librerías) sin preguntarme primero,
   salvo que la tarea lo pida explícitamente.

7. No hagas `git push`, no cambies de rama principal, no toques `main`/`master` directamente.

8. Al terminar, corré siempre: tests, build, y lint si existe. Pegá la salida real de esos
   comandos en tu reporte (no resumas "pasó todo bien" sin mostrar la corrida).

9. Tu reporte final debe seguir EXACTO el formato del Anexo A de este documento (te lo paso
   abajo de la tarea).

10. Mantené todo explicable en una defensa oral / entrevista técnica: si una fórmula o
    decisión es difícil de justificar en 2 minutos hablando, simplificala o documentala mejor.
```

---

## 2. Contexto de producto (referencia corta, no hace falta pegarla siempre)

**Software Estrés** es un simulador visual de arquitecturas distribuidas bajo carga. Permite
modelar componentes (app service, database, cache, queue, load balancer, etc.), configurar
tráfico, tamaño de requests, capacidad, latencia, colas y costos, para detectar cuellos de
botella y comparar decisiones de arquitectura antes de implementar infraestructura real.

**No es** un reemplazo de k6, JMeter, Grafana o AWS Calculator — es una herramienta educativa
y de diseño temprano. Esto tiene que quedar explícito en la documentación y el README.

Stack asumido (Codex debe **confirmar** contra el repo real, no asumir): React (frontend),
Node + Express (backend), MySQL (persistencia), motor de simulación compartido en TS/JS.

---

## FASE 0 — Auditoría inicial (sin tocar nada)

**Objetivo:** tener una foto exacta del estado del repo antes de cambiar una sola línea.

**Prompt para Codex:**

```
No modifiques NINGÚN archivo en esta tarea. Es solo auditoría.

Quiero preparar el proyecto para una mejora progresiva orientada a portfolio. Decime:

1. Rama actual y si hay cambios sin commitear (git status).
2. Estructura general de carpetas (2 niveles), para que yo entienda el layout real.
3. Scripts disponibles en package.json (root y backend si es un repo separado).
4. Comando exacto para correr tests, build y lint (si existe).
5. Resultado real de correr tests y build ahora mismo, ANTES de cualquier cambio
   (esto me sirve como línea base para detectar si algo se rompe más adelante).
6. Versión de Node, framework de testing usado, y si hay coverage configurado.
7. Cualquier inconsistencia, código muerto evidente o cosa rara que notes (sin arreglar nada,
   solo listar).

Al final sugerime un nombre de rama para empezar las mejoras (ej: feature/portfolio-roadmap)
y devolveme el reporte en el formato del Anexo A.

No modifiques archivos todavía.
```

**Definición de hecho:** tenés un reporte con: rama sugerida, comandos reales de test/build/lint,
resultado real de esa corrida (incluyendo fallas preexistentes si las hay), y estructura del repo.

---

## FASE 1 — Documentación de producto

**Objetivo:** que exista un documento que explique el proyecto como producto, no como TP.

**Especificación de contenido exacto:**

`docs/product-vision.md` debe tener, en este orden, con estos títulos:
- Problema que resuelve
- Usuarios objetivo (2-3 perfiles concretos: ej. estudiante de arquitectura de software,
  developer junior evaluando una decisión antes de levantar infraestructura real)
- Casos de uso (al menos 4, con un ejemplo corto cada uno)
- Propuesta de valor
- Por qué no alcanza con hacer las cuentas a mano (argumento concreto, no genérico)
- Comparación contra herramientas reales de carga (tabla: Software Estrés vs k6/JMeter vs
  Grafana vs AWS Calculator — qué hace cada una, qué NO hace Software Estrés)
- Límites del simulador (lista explícita, sin vender humo)

`docs/roadmap.md`: tabla con columnas "MVP actual", "Próximo", "Futuro", "Fuera de alcance".

`docs/technical-decisions.md`: una entrada por decisión (React, Node+Express, MySQL, motor
compartido, simulación simplificada, grafo dirigido acíclico), cada una con formato:
*Decisión → Alternativas consideradas → Por qué esta → Trade-off aceptado.*

**Prompt para Codex:**

```
No toques código funcional, backend, frontend ni base de datos en esta tarea. Es solo
documentación.

Creá/actualizá:
1. docs/product-vision.md
2. docs/roadmap.md
3. docs/technical-decisions.md

Seguí exactamente esta estructura de contenido (te la doy abajo) [pegar la "Especificación de
contenido exacto" de arriba].

Tono profesional, no universitario. No inventes funcionalidades que el código no tiene —
si algo está planeado pero no implementado, va en roadmap.md como "próximo" o "futuro",
no en product-vision.md como si ya existiera.

Devolveme el reporte según Anexo A.
```

**Condición para detenerse:** si Codex no puede confirmar qué funcionalidades existen
realmente hoy (porque el código es ambiguo), debe listar esa incertidumbre en vez de inventar.

---

## FASE 2 — Tamaño de requests y saturación por ancho de banda

**Objetivo:** que el simulador mida no solo RPS sino volumen de datos.

**Especificación técnica exacta:**

Parámetros globales nuevos (todos opcionales, con default):
| Campo | Tipo | Default | Notas |
|---|---|---|---|
| `averageRequestSizeKb` | number | `5` | tamaño promedio en KB |
| `heavyRequestPercentage` | number (0-100) | `0` | % de requests "pesados" |
| `heavyRequestSizeKb` | number | `50` | tamaño de los requests pesados |

Fórmula de tamaño efectivo (mezcla liviano/pesado):
```
heavyFraction = heavyRequestPercentage / 100
effectiveSizeKb = averageRequestSizeKb * (1 - heavyFraction) + heavyRequestSizeKb * heavyFraction
```

Fórmula de tráfico de red (MB/s como unidad primaria, evita confusión bytes/bits):
```
incomingMBps = (trafficRps * effectiveSizeKb) / 1024
throughputMbps = incomingMBps * 8   // si se quiere mostrar en Mbps además
```

Capacidad por nodo — agregar campo nuevo:
| Campo | Tipo | Default sugerido por tipo de nodo |
|---|---|---|
| `bandwidthMbps` | number | app_service: 100, database: 200, cache: 500, queue: 100, load_balancer: 1000 |

(Codex: estos defaults son un punto de partida razonable — si el código ya tiene una
convención de capacidades por tipo de nodo, seguí esa convención en vez de esta tabla.)

Saturación: un nodo se satura si **cualquiera** de las dos condiciones se cumple:
```
saturatedByRps = currentRps > node.capacity
saturatedByBandwidth = incomingMBps * 8 > node.bandwidthMbps   // comparando ambos en Mbps
saturationReason =
  saturatedByRps && saturatedByBandwidth ? "rps_and_bandwidth" :
  saturatedByRps ? "rps" :
  saturatedByBandwidth ? "bandwidth" :
  "none"
```

**Archivos probablemente involucrados** (Codex: confirmar contra el repo real antes de asumir):
`shared/simulator-core.(js|ts)`, tipos compartidos `.d.ts`, `src/lib/simulator.ts`,
`src/components/SimulatorDashboard.tsx`, `src/components/simulator/PropertiesPanel.tsx`,
tests unitarios/integración existentes, `docs/simulation-model.md`.

**Casos borde obligatorios:**
- `heavyRequestPercentage = 0` → debe comportarse igual que antes de este cambio.
- RPS bajo pero `averageRequestSizeKb` muy alto → debe saturar por bandwidth aunque RPS
  esté lejos del límite (este es el caso que demuestra que vale la pena la mejora).
- Proyecto guardado viejo sin estos campos → debe cargar con los defaults, sin crashear.

**Tests obligatorios** (nombrarlos así o equivalente):
- `calcula MBps correctamente con tamaño uniforme`
- `calcula MBps correctamente con mezcla heavy/liviano`
- `satura por RPS cuando bandwidth está OK`
- `satura por bandwidth cuando RPS está OK`
- `no satura cuando ambos están dentro de capacidad`
- `proyecto guardado sin averageRequestSizeKb usa default y no rompe`

**Prompt para Codex:** (pegar Reglas globales + esto)
```
Quiero implementar la especificación técnica de "Fase 2" que te paso arriba, tal cual está
especificada (parámetros, fórmulas, tabla de defaults, criterio de saturación).

Antes de tocar código: buscá cómo está hoy el cálculo de tráfico/capacidad y decime si los
nombres de campo que propongo chocan con algo existente.

La UI debe permitir editar averageRequestSizeKb (y opcionalmente heavyRequestPercentage /
heavyRequestSizeKb) desde el panel de propiedades, y mostrar RPS, MB/s y saturationReason
en las métricas.

Implementá los tests de la lista de "Tests obligatorios" + cualquier caso borde adicional
que detectes. Actualizá docs/simulation-model.md explicando la fórmula con palabras simples
(para poder defenderla oralmente).

Al terminar: npm test, npm run build, npm run lint si existe. Reporte según Anexo A,
incluyendo la fórmula final tal como quedó implementada y cualquier desvío respecto a esta
especificación (con motivo).
```

---

## FASE 3 — Latencia progresiva (curva, no escalones)

**Objetivo:** que la latencia crezca de forma continua y se dispare cerca de la saturación,
en vez de saltar por tramos fijos.

**Fórmula concreta propuesta** (defendible, simple de explicar, sin infinitos):

```
utilization = currentLoad / node.capacity        // ej: RPS actual / RPS máximo
cappedUtil  = min(utilization, 1.0)              // tope para evitar división por cero

EXPONENTE = 6        // qué tan "tarde" empieza a notarse el efecto
EPSILON   = 0.02      // evita división por cero cerca de utilization = 1

multiplier = 1 + (cappedUtil ^ EXPONENTE) / (1 - cappedUtil + EPSILON)
latencyMs  = baseLatencyMs * multiplier
```

Por qué esta fórmula (para que Codex lo entienda y lo documente bien): al elevar la
utilización a la sexta potencia, con carga baja (ej. 50%) el numerador es casi cero y la
latencia queda casi igual a la base; recién cuando la utilización se acerca al 100% el
numerador crece y el denominador `(1 - cappedUtil)` se achica, así que el cociente se dispara.
Es la misma intuición de las colas M/M/1 (la espera explota cerca de la saturación) pero
simplificada para no requerir matemática de colas real.

Valores de referencia esperados con esta fórmula (Codex: usalos para escribir el test):
- `utilization = 0.50` → `multiplier ≈ 1.03` (casi igual a la base)
- `utilization = 0.80` → `multiplier ≈ 2.2` (aumenta, pero no se dispara)
- `utilization = 0.95` → `multiplier ≈ 11.5` (crece fuerte)
- `utilization = 1.00` → `multiplier ≈ 51` (techo antes del overload real)

Para `utilization > 1.0` (overload real, sistema recibiendo más de lo que puede sostener):
**no** sigas aumentando la latencia con la misma fórmula — mantenela en el valor del tope
(`cappedUtil = 1.0`) y en cambio subí `errorRate`. Sugerencia simple:
```
overloadFactor = utilization - 1.0   // ej: 1.3 de utilización -> overloadFactor = 0.3
errorRateIncrease = min(overloadFactor * 50, 90)   // tope en 90% para no llegar a "100% error" de golpe
```

**Archivos:** función `calculateLatency` o equivalente (Codex: buscarla, no asumir el nombre).

**Casos borde obligatorios:**
- `utilization = 0` → latencia = base exacta.
- `utilization` justo en el límite de capacidad (1.0) → no debe dar `Infinity` ni `NaN`.
- `utilization > 1.0` → latencia se mantiene en el techo, error rate sube en vez de la latencia.
- Nodo sin tráfico → no debe dividir por cero en otro lado del cálculo.

**Tests obligatorios:**
- `latencia ≈ base cuando utilization es baja (0.5)`
- `latencia crece fuerte cerca de 0.95`
- `latencia no es Infinity ni NaN en utilization = 1.0`
- `por encima de 1.0 la latencia no sigue creciendo, pero el error rate sí`

**Prompt para Codex:**
```
Quiero reemplazar el cálculo de latencia por escalones por la fórmula progresiva que te
especifico arriba en "Fase 3" (constantes EXPONENTE=6, EPSILON=0.02 — son ajustables pero
documentá la elección).

Revisá calculateLatency (o el nombre real que tenga en el repo) y reemplazá la lógica,
manteniendo la firma/uso público igual si es posible para no romper la UI.

Implementá el manejo de utilization > 1.0 como se especifica (techo de latencia + suba de
error rate).

Tests: los de la lista de "Tests obligatorios" con los valores de referencia que te doy
(con una tolerancia razonable, ej. ±10%).

Actualizá docs/simulation-model.md explicando la fórmula en lenguaje simple, por qué crece
más cerca de la saturación, y las limitaciones (no es un modelo real de colas, es una
aproximación pedagógica).

Al final: tests + build. Reporte según Anexo A.
```

---

## FASE 4 — Cache hit rate configurable

**Especificación técnica exacta:**

| Campo | Tipo | Default | Aplica a |
|---|---|---|---|
| `cacheHitRate` | number (0-1) | `0.7` | nodos tipo `cache` |

Fórmula:
```
trafficResolvedByCache = incomingTraffic * cacheHitRate
trafficToDownstream    = incomingTraffic * (1 - cacheHitRate)
```
`trafficToDownstream` es lo que efectivamente sigue hacia el siguiente nodo (típicamente
`database`), reemplazando el cálculo actual de tráfico pasante para nodos cache.

**Casos borde obligatorios:**
- `cacheHitRate = 0` → todo el tráfico pasa, debe comportarse como "cache transparente".
- `cacheHitRate = 1` → cero tráfico llega a la base de datos.
- Nodo que no es `cache` → este campo no debe afectarlo en absoluto.
- Proyecto viejo sin `cacheHitRate` en un nodo cache → usar default `0.7`.

**Tests obligatorios:**
- `cache con hit rate 0.7 reduce el tráfico downstream en 70%`
- `cache con hit rate 0 no reduce nada`
- `cache con hit rate 1 elimina todo el tráfico downstream`
- `nodos no-cache no son afectados por este cambio`

**Prompt para Codex:**
```
Implementá la especificación de "Fase 4": campo cacheHitRate (0-1, default 0.7) en nodos
tipo cache, editable desde el panel de propiedades, usado para calcular cuánto tráfico
sigue hacia el nodo downstream (normalmente database).

Mostrá en la UI, de forma simple: hit rate configurado, tráfico resuelto por cache, tráfico
que sigue a database.

Tests: los de la lista de arriba. No debe afectar nodos que no sean cache. Mantené
compatibilidad con proyectos guardados sin este campo (default 0.7).

Al final: tests + build. Reporte según Anexo A.
```

---

## FASE 5 — Queue: backlog y consumidores

**Especificación técnica exacta:**

| Campo | Tipo | Default | Notas |
|---|---|---|---|
| `consumers` | number | `1` | cantidad de workers consumiendo la cola |
| `processingRatePerConsumer` | number | `100` (msg/s) | capacidad de cada worker |
| `maxBacklog` | number | `10000` | tope antes de empezar a descartar mensajes |

Fórmulas por tick de simulación:
```
totalProcessingCapacity = consumers * processingRatePerConsumer
incomingMessages        = trafficIntoQueue   // lo que llega del nodo anterior
processedMessages       = min(incomingMessages + previousBacklog, totalProcessingCapacity)
newBacklog               = max(0, (incomingMessages + previousBacklog) - totalProcessingCapacity)
droppedMessages          = max(0, newBacklog - maxBacklog)
backlog                  = min(newBacklog, maxBacklog)
estimatedDrainTimeSeconds = totalProcessingCapacity > 0 ? backlog / totalProcessingCapacity : Infinity
```
(Si `estimatedDrainTimeSeconds` da `Infinity` por `totalProcessingCapacity = 0`, mostrar en
UI como "no drena" en vez del número infinito.)

**Casos borde obligatorios:**
- `incomingMessages <= totalProcessingCapacity` de forma sostenida → backlog en 0 (cola estable).
- Entrada constante mayor a la capacidad → backlog crece tick a tick, sin techo hasta `maxBacklog`.
- Backlog supera `maxBacklog` → empiezan los `droppedMessages`, reportados explícitamente.
- Aumentar `consumers` con backlog existente → `estimatedDrainTimeSeconds` debe bajar.
- `consumers = 0` → no debe dividir por cero; cola no procesa nada, backlog crece sin límite
  hasta `maxBacklog`.

**Tests obligatorios:**
- `cola estable no acumula backlog`
- `cola con entrada mayor a capacidad acumula backlog`
- `cola supera maxBacklog y reporta mensajes descartados`
- `más consumers reduce el backlog y el tiempo de drenaje`
- `consumers en 0 no rompe el cálculo (no division por cero)`

**Prompt para Codex:**
```
Implementá la especificación de "Fase 5" para nodos tipo queue: consumers,
processingRatePerConsumer, maxBacklog, y las fórmulas de backlog/drenaje/descarte tal como
están especificadas arriba.

Mostrá en UI: backlog actual, capacidad total de consumo, tiempo estimado de drenaje (o
"no drena" si corresponde), y estado de la cola (estable / acumulando / saturada).

Mantenelo simple: NO implementes una simulación de eventos discretos, es un cálculo por
tick, no una cola de eventos real.

Tests: los de la lista de arriba. Compatibilidad con proyectos viejos vía defaults
(consumers=1, processingRatePerConsumer=100, maxBacklog=10000).

Al final: tests + build. Reporte según Anexo A con explicación clara para portfolio.
```

---

## FASE 6 — Comparador de escenarios A/B

**Especificación técnica exacta:**

- Estado en memoria del frontend (no persistir en DB en esta versión): `scenarioA`,
  `scenarioB`, cada uno guarda el snapshot completo de configuración + resultado de
  simulación al momento de "guardar".
- Componente nuevo: `src/components/simulator/ScenarioComparison.tsx`.
- Métricas a comparar (todas las que ya existan en el motor, como mínimo):
  `throughput`, `latenciaPromedio`, `errorRate`, `costoMensual`, `cuelloDeBotella`,
  `trafficMBps` (si existe desde Fase 2), `backlog` (si existe desde Fase 5).
- Cada métrica comparada debe mostrar una de tres etiquetas: **Mejora**, **Empeora**,
  **Sin cambio** (definir "sin cambio" como diferencia menor al 1%, para no marcar ruido de
  redondeo como cambio real).

**Casos borde obligatorios:**
- Solo se guardó Escenario A, no B (o viceversa) → la UI debe pedir guardar el que falta,
  no crashear intentando comparar contra `null`.
- Una métrica no existe en uno de los escenarios (ej. comparás un escenario sin queue contra
  uno con queue) → mostrar "N/A", no romper.

**Prompt para Codex:**
```
Implementá un comparador de escenarios A/B según la especificación de "Fase 6": estado en
memoria del frontend (sin persistencia en DB todavía), componente
src/components/simulator/ScenarioComparison.tsx, comparando las métricas listadas con
etiqueta Mejora/Empeora/Sin cambio (umbral de "sin cambio": diferencia < 1%).

Manejá los casos borde: falta un escenario, o una métrica no aplica a uno de los dos.

Si hay lógica de comparación que se pueda extraer como función pura (testeable sin UI),
extraela y agregale tests.

Al final: build + tests. Reporte según Anexo A explicando cómo se usa desde la UI.
```

---

## FASE 7 — Recomendaciones automáticas

**Especificación técnica exacta:**

Función pura: `generateRecommendations(simulationResult, nodes) → Recommendation[]`

```
type Recommendation = {
  title: string;
  explanation: string;
  severity: "alta" | "media" | "baja";
  suggestedAction: string;
}
```

Reglas mínimas a implementar (Codex puede agregar más, pero estas son obligatorias):
| Condición | Severidad | Ejemplo de mensaje |
|---|---|---|
| Nodo con `saturationReason !== "none"` | alta | "X está saturado por [rps/bandwidth]. Considerá [aumentar capacidad / agregar instancias]." |
| `errorRate` del sistema > 5% | alta | "Hay errores significativos en el sistema." |
| Nodo `database` recibiendo tráfico directo sin `cache` antes | media | "No hay cache antes de la base de datos. Considerá agregar una." |
| Nodo `queue` con `backlog > 0` sostenido | media | "La cola acumula backlog. Considerá sumar consumers." |
| `costoMensual` por encima de un umbral configurable | baja | "El costo estimado es alto para esta carga." |

**Reglas de implementación:**
- Es una función pura: mismo input → mismo output, sin llamadas a red ni IA externa.
- No debe aplicar cambios automáticamente, solo sugerir.

**Tests obligatorios:** uno por cada regla de la tabla (caso que la dispara + caso que no la dispara).

**Prompt para Codex:**
```
Implementá generateRecommendations según la especificación de "Fase 7": función pura,
firma (simulationResult, nodes) → Recommendation[], con los 5 tipos de regla de la tabla
como mínimo (podés agregar más si las datos del motor lo permiten).

Componente para mostrarlas: src/components/simulator/RecommendationsPanel.tsx.

Tests: uno por regla que la dispara, uno por caso que no la dispara (false positive check).

Documentá las reglas en docs/simulation-model.md o docs/product-vision.md.

Al final: tests + build. Reporte según Anexo A.
```

---

## FASE 8 — Modo educativo ("Explicar resultado")

**Objetivo:** texto generado por reglas (no IA externa) que explique el resultado en
lenguaje simple para un estudiante.

**Especificación:** componente `src/components/simulator/EducationalExplanation.tsx` que,
a partir del mismo `simulationResult` de la Fase 7, genera texto explicando: cuál es el
cuello de botella y por qué, qué métrica lo demuestra, qué pasaría si aumenta el tráfico
(extrapolación simple, no nueva simulación), y qué mejora aplicaría (puede reusar las
`Recommendation[]` de la Fase 7 en vez de duplicar lógica).

**Restricción dura:** nada de llamadas a servicios externos de IA. Es texto por reglas/templates.

**Prompt para Codex:**
```
Implementá EducationalExplanation según la especificación de "Fase 8". Reusá la lógica de
recomendaciones de la Fase 7 en vez de duplicarla si tiene sentido (no reescribas la misma
detección de cuello de botella dos veces en el código).

Texto generado por reglas/templates, sin servicios externos ni nuevas dependencias.
Lenguaje claro, apto para un estudiante que está aprendiendo el tema.

Extraé funciones puras testeables si es posible y agregales tests.

Al final: build + tests. Reporte según Anexo A.
```

---

## FASE 9 — Seguridad backend

**Especificación exacta (mínimos no negociables):**

- **Roles:** `administrador`, `arquitecto`, `lector`. Un `lector` NO puede crear, modificar
  ni borrar proyectos (rutas de escritura deben rechazar con 403 si el rol es `lector`).
- **Cookies de sesión:** `httpOnly: true` siempre; `secure: true` en producción;
  `sameSite: "strict"` o `"lax"` (Codex: elegir según si hay flujos cross-site legítimos, y
  justificar la elección en el reporte); expiración explícita, no "sesión infinita".
- **CORS:** nunca `origin: "*"` en producción. Lista explícita de orígenes permitidos;
  `localhost` solo en desarrollo (gateado por `NODE_ENV`).
- **Errores:** en producción, nunca devolver `stack trace` ni mensajes de error de la base
  de datos al cliente. Mensaje genérico al usuario + log detallado del lado del servidor.
- **Comparación de firma de sesión / tokens:** usar comparación de tiempo constante
  (ej. `crypto.timingSafeEqual` en Node) en vez de `===`, para evitar timing attacks.

**Tests obligatorios:**
- `usuario sin sesión no puede acceder a rutas protegidas`
- `usuario lector no puede crear/editar/borrar proyectos (403)`
- `usuario lector SÍ puede leer (200)`
- `CSRF token inválido es rechazado`
- `login con credenciales inválidas es rechazado sin filtrar detalle`
- `payload inválido en endpoints de escritura es rechazado con 400, no 500`

**Prompt para Codex:**
```
Quiero endurecer seguridad backend según la especificación de "Fase 9", sin cambiar la
funcionalidad principal ni romper login/registro existentes.

Primero: auditá qué hay implementado hoy (auth, roles, cookies, CORS) ANTES de escribir
nada, y decime qué falta vs qué ya está.

Implementá lo que falte: middleware de roles (administrador/arquitecto/lector) bloqueando
escritura para lector, configuración correcta de cookies, revisión de CORS gateada por
entorno, manejo de errores que no filtre detalles en producción, comparación segura de
firma/token si aplica.

Tests: los de la lista de "Tests obligatorios".

No cambies nombres de endpoints existentes. No agregues JWT externo si el sistema actual de
sesión no lo necesita.

Al final: npm test, npm run build, npm run security:audit si existe.
Reporte según Anexo A, separando explícitamente "riesgos corregidos" de "riesgos
pendientes que quedan fuera de esta fase".
```

---

## FASE 10 — Seguridad y sesión en frontend

**Especificación exacta:**
- Auditar `authService` (o equivalente): qué se guarda hoy en `localStorage`.
- Mover el token principal de sesión a cookie `httpOnly` si no está ahí ya (el frontend no
  debería poder leer el token de sesión vía JS).
- En `localStorage`, guardar como máximo datos no sensibles de UI (ej. preferencias), nunca
  el token ni datos de sesión.
- Al iniciar la app: validar sesión contra backend antes de mostrar pantallas privadas.
- Sesión expirada: limpiar estado local, redirigir a login, mostrar mensaje claro (no un
  error técnico).
- Rutas privadas: deben estar protegidas a nivel de router, no solo "ocultas visualmente".

**Prompt para Codex:**
```
Quiero mejorar seguridad y manejo de sesión en frontend según "Fase 10".

Primero auditá qué hay hoy en authService y en localStorage, decime qué dato sensible se
está guardando ahí que no debería.

Implementá: token principal solo en cookie httpOnly, mínimo indispensable en localStorage,
validación de sesión contra backend al iniciar la app, manejo claro de expiración
(limpiar estado + redirigir a login + mensaje), protección real de rutas privadas a nivel
de router.

No rompas login/registro/logout. No agregues librerías grandes nuevas.

Al final: tests (si hay estructura para frontend) + build. Reporte según Anexo A.
```

---

## FASE 11 — Tests y calidad general

**Objetivo:** que el repo se vea serio para alguien que lo clona sin contexto.

**Prompt para Codex:**
```
Quiero consolidar la suite de tests según "Fase 11".

1. Listá los tests existentes y qué cubren hoy.
2. Identificá huecos de cobertura en: lógica del motor de simulación (fases 2-8), roles y
   permisos (fase 9), CSRF/payload inválido (fase 9), frontend si aplica (fase 10).
3. Completá esos huecos con tests de lógica pura y endpoints críticos. No hagas mocks
   complejos si no son necesarios.
4. Asegurate de que existan (o agregalos) estos scripts en package.json: test,
   test:coverage, lint, build, security:audit.
5. Corré toda la suite y reportame el resultado real, con foco en si el core del simulador
   (fases 2 a 5) tiene cobertura razonable (no exijo un % específico, pero las funciones de
   cálculo principales deben estar cubiertas).

Reporte según Anexo A.
```

---

## FASE 12 — Docker Compose

**Especificación:** `docker-compose.yml` con servicios `mysql`, `backend`, `frontend` (si
aplica); `backend/Dockerfile`; `.dockerignore`; carga automática de `database/schema.sql` al
iniciar MySQL; variables de entorno vía `.env` (sin secretos reales commiteados); documentar
en `docs/installation.md` los comandos: `docker compose up --build`, `docker compose down -v`,
cómo ver logs, cómo cargar un seed demo si existe.

**Prompt para Codex:**
```
Dockerizá el proyecto según "Fase 12". Mantené la instalación manual funcionando en paralelo
(no la elimines). No incluyas secretos reales en el repo — usá .env.example.

Probá lo que puedas levantar en este entorno y decime explícitamente qué necesito probar yo
localmente (por ejemplo, si no tenés Docker disponible en tu entorno de ejecución).

Reporte según Anexo A.
```

---

## FASE 13 — CI con GitHub Actions

**Prompt para Codex:**
```
Agregá .github/workflows/ci.yml según "Fase 13": en cada push/PR, instalar dependencias
(root y backend si aplica), correr test, build, lint (si está estable) y audit opcional sin
que un audit con falsos positivos de dev-dependencies rompa el pipeline.

Antes de fijar la versión de Node en el workflow, confirmá la versión real usada en el
proyecto (package.json "engines" o equivalente) en vez de asumir una.

No agregues deploy todavía. Si el lint falla por problemas preexistentes del código,
decime si conviene corregirlos ahora o dejar el step de lint como "no bloqueante"
temporalmente, con justificación.

Reporte según Anexo A.
```

---

## FASE 14 — README de portfolio

**Estructura obligatoria** (en este orden): nombre + descripción corta, problema, solución,
features, demo/capturas (espacio reservado), stack, arquitectura, modelo de simulación,
seguridad, tests, instalación con Docker, instalación manual, roadmap, "qué aprendí /
decisiones técnicas", limitaciones del modelo, "no reemplaza pruebas reales de carga",
aporte personal (separado de los créditos al equipo original), licencia.

**Prompt para Codex:**
```
Reescribí el README según "Fase 14", con la estructura exacta de arriba.

Mantené créditos al equipo original del trabajo universitario, pero agregá una sección
separada y honesta de "mi aporte personal" listando específicamente qué hice yo en este
roadmap (fases 1 a 13, según lo que efectivamente se haya implementado).

No inventes funcionalidades. Si algo está en roadmap.md como "futuro", marcalo como futuro
en el README también, no como si ya existiera.

Reporte según Anexo A con el README final incluido.
```

---

## FASE 15 — Limpieza final

**Prompt para Codex:**
```
Limpieza final según "Fase 15". Primero LISTAME los cambios propuestos (sin aplicarlos):
nombre del package, scripts, dependencias no usadas, archivos/carpetas obsoletas o
duplicadas, comentarios demasiado "universitarios", consistencia del README contra el
código real, y si conviene licencia MIT (asumiendo que el repo va a ser público).

Esperá mi confirmación de la lista antes de aplicar cambios. No borres nada sin justificar
explícitamente por qué.

Después de aplicar lo aprobado: tests + build + lint. Reporte según Anexo A.
```

---

## FASE 16 — Migración a repositorio personal

**Prompt para Codex:**
```
No hagas push ni cambies remotos todavía. Esto es solo planificación.

Dame una checklist según "Fase 16": qué archivos deben quedar / cuáles no, README final,
licencia, créditos al equipo original, sección de aporte personal, pasos para crear el repo
nuevo, comandos git para copiarlo correctamente, y tu recomendación sobre mantener el
historial de commits original o empezar con historial limpio (con el trade-off de cada
opción: mantener historial muestra trabajo en el tiempo pero expone commits del equipo;
empezar limpio es prolijo pero pierde ese rastro).

No modifiques nada todavía. Devolveme el plan primero.
```

---

## Anexo A — Formato de reporte que Codex debe devolver SIEMPRE al final de una fase

```
## Reporte — Fase N: [nombre]

### Archivos modificados/creados
- ...

### Resumen en lenguaje simple
(2-4 líneas: qué cambió y por qué, como si me lo explicaras a mí, no a otro programador)

### Decisiones técnicas y por qué
- ...

### Desvíos respecto a la especificación de este documento (si los hubo)
- ...

### Tests agregados/modificados
- nombre del test → qué caso cubre

### Comandos ejecutados y resultado real
$ npm test
[salida real]
$ npm run build
[salida real]

### Fallas preexistentes (no causadas por este cambio, si las hay)
- ...

### Compatibilidad con proyectos guardados viejos
- confirmado / no aplica / pendiente de revisar

### Limitaciones conocidas de esta implementación
- ...

### Cosas que noté pero NO toqué (fuera de alcance de esta fase)
- ...
```

