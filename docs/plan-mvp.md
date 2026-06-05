# Plan MVP detallado por fases

Este plan baja el MVP a fases concretas. La regla principal es avanzar de a una fase, cerrar pruebas, y recién ahí pasar a la siguiente.

## Estado actual del sistema

El MVP ya permite:

- Abrir el simulador sin login real.
- Crear un proyecto nuevo.
- Arrastrar componentes al canvas.
- Conectar componentes con reglas válidas.
- Editar propiedades básicas de cada componente.
- Configurar tráfico.
- Ejecutar o detener simulación.
- Ver métricas globales.
- Ver métricas por componente.
- Ver conclusión automática.
- Guardar, listar, cargar, actualizar y borrar proyectos con backend y MySQL.
- Ejecutar simulación desde backend mediante `POST /api/simulations/run`.
- Compartir reglas de conexión y simulación entre frontend y backend.

Componentes activos:

- API Gateway
- Load Balancer
- App Service
- Database
- Queue

Cache queda desactivado para el MVP.

## Prioridades del tablero

Issues principales:

- `#3 Panel derecho configuracion`
- `#6 Implementar motor de simulación por ciclos`

Issues ya cubiertos a nivel MVP:

- `#1 Sidebar izquierda`
- `#2 Canvas Central`
- `#4 Implementar canvas con agregado y conexión de nodos`
- `#5 Crear panel de edición de propiedades por componente`
- `#7 Mostrar estados visuales, alertas y métricas`

Issue parcialmente cubierto:

- `#8 Implementar estimación básica de costo y sugerencia`

## Fase 0 - Estabilización del MVP actual

Estado: cerrada para MVP.

Objetivo: asegurar que la base actual no se rompa mientras avanzamos.

Alcance:

- Mantener el simulador simple.
- Mantener frontend y backend unidos por `projectService`.
- Mantener MySQL alineado con `schema.sql` y migraciones.
- Evitar volver a agregar login, roles o UI secundaria.
- Revisar que no haya archivos muertos importantes.

Entregables:

- `docs/plan-mvp.md` actualizado.
- `docs/estado-sistema.md` con faltantes y riesgos.
- `docs/plan-pruebas.md` con pruebas unitarias e integrales.

Criterio de cierre:

- `npm run lint` pasa.
- `npx tsc --noEmit` pasa.
- `npm run build` pasa.
- Backend responde health.
- DB responde health.

Resultado aplicado:

- Frontend, backend y base quedaron conectados mediante `projectService`.
- El backend responde health general y health de DB.
- La persistencia de proyectos guarda, lista, carga, actualiza y borra proyectos.
- El build de frontend, lint y chequeo TypeScript pasan.
- La arquitectura se mantuvo separada en frontend, servicios, backend, rutas, controladores, servicios y DB.

## Fase 1 - Panel derecho configuración (`#3`)

Estado: cerrada para MVP.

Objetivo: que el panel derecho sea el lugar claro para configurar y entender un componente.

Problema actual:

- Ya existe un panel funcional, pero todavía puede quedar más claro.
- Mezcla configuración y resultados en un bloque compacto.
- Falta jerarquía visual entre datos editables y métricas calculadas.

Alcance:

- Separar el panel en dos secciones:
  - Configuración editable.
  - Resultado calculado.
- Mostrar solo campos MVP:
  - Nombre.
  - Instancias.
  - Capacidad por instancia.
  - Latencia base.
  - Tamaño de cola.
  - Timeout.
  - Costo por instancia.
  - Carga.
  - Salida procesada.
  - Error.
  - Estado.
- Validar valores mínimos desde UI:
  - Instancias mayor o igual a 1.
  - Capacidad mayor o igual a 1.
  - Latencia mayor o igual a 0.
  - Costo mayor o igual a 0.
- Mostrar el nombre del tipo de componente seleccionado.
- Mantener botón de eliminar componente.
- Evitar controles extra.

Pruebas necesarias:

- Seleccionar cada tipo de componente.
- Cambiar instancias y ver que cambia carga.
- Cambiar capacidad y ver que cambia cuello de botella.
- Eliminar nodo y confirmar que se eliminan sus conexiones.
- Guardar y cargar proyecto con valores editados.

Criterio de cierre:

- El panel es entendible sin documentación externa.
- Editar valores cambia métricas y conclusión.
- No se puede dejar un componente en estado inválido desde la UI.

Resultado aplicado:

- El panel separa configuración editable y resultado calculado.
- Los valores numéricos se normalizan con mínimos seguros.
- Se editan nombre, instancias, capacidad, latencia base, cola, timeout y costo por instancia.
- Se muestran capacidad total, costo mensual, entrada, carga, salida procesada, cola, error, latencia y estado.

## Fase 2 - Motor de simulación por ciclos (`#6`)

Estado: cerrada para MVP.

Objetivo: reemplazar el cálculo simple actual por un motor por ciclos, sin hacerlo complejo.

Problema actual:

- El motor actual calcula propagación de forma básica.
- Sirve para MVP visual, pero no representa ciclos discretos.
- Todavía no permite explicar con precisión cada paso de simulación.

Alcance:

- Crear una función pura para ejecutar ciclos.
- Definir un número fijo de ciclos para el MVP.
- En cada ciclo:
  - Detectar nodos de entrada.
  - Calcular tráfico recibido por nodo.
  - Calcular capacidad total.
  - Calcular salida procesada.
  - Calcular tráfico perdido.
  - Propagar salida a nodos siguientes.
- Acumular métricas por nodo.
- Calcular métricas globales desde el resultado de los ciclos.
- Detectar cuello de botella como el nodo activo con mayor carga.
- Mantener fórmulas visibles y simples.

Entregables:

- Motor centralizado en `shared/simulator-core.js`.
- Endpoint backend para ejecutar simulación sin depender sólo del frontend.
- Tipos claros para ciclo, nodo medido y resultado total.
- Pruebas manuales y verificaciones técnicas del motor.

Pruebas necesarias:

- Cadena lineal estable.
- Cadena lineal saturada.
- App Service con Database y Queue.
- Nodo sin conexiones.
- Conexión inválida bloqueada.
- Tráfico cero.

Criterio de cierre:

- Los resultados son repetibles.
- Los números se pueden explicar en demo.
- La conclusión usa datos del motor por ciclos.

Resultado aplicado:

- `simulate` ejecuta 6 ciclos discretos.
- `POST /api/simulations/run` ejecuta la simulación desde backend.
- El frontend consulta el backend y usa simulación local como respaldo si la API no responde.
- Cada ciclo calcula entrada, capacidad, salida procesada, cola retenida y tráfico descartado.
- Las métricas por nodo incluyen entrada, capacidad total, carga, salida, cola, descarte, latencia, error, estado y costo.
- Las métricas globales incluyen latencia promedio, error global, salida procesada, costo, cantidad de ciclos y cuello de botella explicable.
- La UI usa esas métricas para actualizar nodos, panel derecho, alertas y conclusión.

## Fase 3 - Validaciones backend y seguridad mínima

Estado: cerrada para MVP.

Objetivo: que el backend no dependa de que el frontend se porte bien.

Problema actual:

- El frontend valida conexiones.
- El backend persiste proyectos y sanitiza valores numéricos básicos.
- Falta validar reglas de dominio en backend.
- No hay autenticación real; hay usuario MVP fijo.

Alcance:

- Validar payload completo de proyecto.
- Rechazar nodos con tipo desconocido.
- Rechazar nodos sin nombre.
- Rechazar valores negativos.
- Rechazar conexiones a nodos inexistentes.
- Rechazar conexiones inválidas según reglas MVP.
- Limitar tamaño de payload.
- Normalizar emails.
- Preparar estrategia de autenticación real para una fase posterior.

Seguridad a revisar:

- CORS por entorno.
- Mensajes de error sin detalles internos en producción.
- Variables `.env.example`.
- Validación de IDs y ownership de proyectos.
- Rate limit básico para API si se expone fuera de local.

Criterio de cierre:

- Un request inválido no se guarda.
- Un usuario no puede leer proyectos de otro email.
- El backend devuelve errores claros.

Resultado aplicado:

- Las reglas de conexión y el motor de simulación quedaron centralizados en `shared/simulator-core.js`.
- Frontend y backend usan el mismo núcleo para validar conexiones y simular ciclos.
- El backend valida nodos, conexiones, duplicados, ciclos, ids inválidos y referencias inexistentes.
- El backend agrega headers mínimos de seguridad.
- El backend agrega rate limit simple para rutas `/api`.
- Se mantiene límite de payload JSON de `1mb`.
- Los endpoints rechazan payloads inválidos con códigos `400` claros.

## Fase 4 - Persistencia de simulaciones

Estado: futura.

Objetivo: guardar corridas y recomendaciones.

Alcance:

- Crear endpoint para ejecutar/guardar simulación.
- Guardar `simulation_runs`.
- Guardar `simulation_node_metrics`.
- Guardar `scaling_recommendations`.
- Mostrar historial básico de corridas.

Criterio de cierre:

- Una corrida puede consultarse después.
- La recomendación queda asociada a un nodo real.

## Fase 5 - Autenticación real

Estado: futura, no necesaria para el MVP visual.

Objetivo: reemplazar usuario fijo por login real.

Alcance:

- Tabla de usuarios con password hasheada.
- Endpoint de login.
- Sesión/token.
- Middleware de autenticación.
- Asociar proyectos al usuario autenticado.

Criterio de cierre:

- No se usa usuario fijo.
- Los proyectos se filtran por usuario autenticado.

## Fase 6 - Preparación de entrega

Estado: futura.

Objetivo: dejar el proyecto listo para demo o corrección.

Alcance:

- README con comandos reales.
- Checklist de demo.
- Capturas o video corto.
- Pasos de base de datos.
- Explicación del alcance MVP.
- Lista de limitaciones conocidas.

Criterio de cierre:

- Cualquier integrante puede levantar frontend, backend y MySQL.
- El flujo completo se puede mostrar sin errores.
