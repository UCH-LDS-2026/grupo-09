# Plan MVP por fases

Este plan refleja el estado actual del proyecto después de la limpieza del MVP. La prioridad es mantener un producto básico, entendible y funcional antes de sumar complejidad.

## Estado actual

Ya está avanzado:

- Canvas central con nodos y flechas dirigidas.
- Sidebar izquierdo simple con componentes MVP.
- Panel derecho de propiedades básico.
- Creación, conexión, edición y eliminación de componentes.
- Reglas de conexión para MVP.
- Métricas globales: tráfico total, salida procesada, latencia, error y costo.
- Estados visuales por componente.
- Conclusión automática con cuello de botella y recomendación simple.
- Guardado, carga, actualización y borrado de proyectos con backend y MySQL.
- Base de datos alineada al MVP, con `cache` desactivado.

## Issues del tablero

Según la lista abierta:

- `#8 Implementar estimación básica de costo y sugerencia`: parcialmente cubierto. Ya hay costo mensual y recomendación de instancias.
- `#7 Mostrar estados visuales, alertas y métricas`: cubierto para MVP.
- `#6 Implementar motor de simulación por ciclos`: pendiente principal.
- `#5 Crear panel de edición de propiedades por componente`: cubierto para MVP.
- `#4 Implementar canvas con agregado y conexión de nodos`: cubierto para MVP.
- `#3 Panel derecho configuracion`: pendiente principal de refinamiento.
- `#2 Canvas Central`: cubierto para MVP.
- `#1 Sidebar izquierda`: cubierto para MVP.

Los issues principales para seguir son `#6` y `#3`.

## Fase 1 - Cierre MVP Visual

Estado: avanzado.

Objetivo: que el simulador sea simple, presentable y usable.

Falta revisar:

- Ajustes finos responsive.
- Reducir brillos/animaciones si molestan en demo.
- Revisar textos finales de botones y mensajes.

Criterio de cierre:

- El usuario entiende el flujo sin explicación larga.
- Puede armar `API Gateway -> Load Balancer -> App Service -> Database`.

## Fase 2 - Panel derecho configuración (`#3`)

Estado: próxima prioridad.

Objetivo: convertir el panel derecho en un panel claro de configuración del componente seleccionado.

Alcance:

- Ordenar campos por importancia: nombre, instancias, capacidad, latencia y costo.
- Mostrar métricas por componente de forma más limpia: carga, salida procesada, error y estado.
- Separar visualmente configuración editable de resultados calculados.
- Agregar mensajes de ayuda mínimos sin sobrecargar.
- Evitar controles que no afecten al MVP.

Criterio de cierre:

- Seleccionar un nodo muestra sólo lo necesario para configurarlo.
- Cambiar instancias/capacidad actualiza métricas y conclusión.
- El panel no parece una herramienta avanzada innecesaria.

## Fase 3 - Motor de simulación por ciclos (`#6`)

Estado: próxima prioridad fuerte.

Objetivo: mejorar el motor actual para simular pasos/ciclos de procesamiento sin volverlo complejo.

Alcance:

- Separar el cálculo en ciclos discretos simples.
- En cada ciclo, propagar tráfico desde nodos de entrada hacia salidas.
- Calcular por nodo: tráfico recibido, capacidad total, salida procesada, tráfico perdido, error, latencia y estado.
- Detectar cuello de botella como el nodo activo con mayor carga.
- Mantener fórmulas entendibles y documentadas.

Criterio de cierre:

- El resultado es coherente en cadenas lineales.
- El resultado es coherente cuando un App Service deriva tráfico a Database y Queue.
- La conclusión explica el cuello de botella con números.

## Fase 4 - Seguridad y validaciones backend

Estado: pendiente.

Objetivo: reforzar el mínimo backend que ya une front y base de datos.

Alcance:

- Validar payloads de proyecto, nodos y conexiones.
- Rechazar conexiones inválidas también del lado backend.
- Evitar guardar nodos con valores negativos o tipos desconocidos.
- Preparar autenticación real para más adelante sin simular seguridad falsa.

Criterio de cierre:

- El backend no guarda datos incoherentes aunque el frontend falle.
- Los errores vuelven con mensajes claros.

## Fase 5 - Simulaciones persistidas

Estado: futura.

Objetivo: guardar corridas de simulación y recomendaciones.

Alcance:

- Endpoint para ejecutar/guardar simulación.
- Persistir `simulation_runs`.
- Persistir `simulation_node_metrics`.
- Persistir `scaling_recommendations`.
- Mostrar historial básico.

Criterio de cierre:

- Una corrida se puede consultar después de guardar.
- Las recomendaciones tienen respaldo en base de datos.

## Fase 6 - Entrega y presentación

Estado: futura.

Objetivo: dejar el proyecto fácil de levantar, explicar y defender.

Alcance:

- README con comandos reales.
- Checklist de demo.
- Variables `.env.example` revisadas.
- Pasos para MySQL, backend y frontend.
- Capturas o descripción del flujo principal.

Criterio de cierre:

- Cualquier integrante puede levantar el proyecto.
- El alcance MVP queda claro.
