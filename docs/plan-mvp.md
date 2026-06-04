# Plan MVP por fases

Este plan ordena el trabajo desde un MVP visual y funcional hacia un sistema con backend mas completo. La prioridad inicial es que la aplicacion se pueda mostrar, usar y explicar con claridad antes de profundizar en funcionalidades internas.

## Fase 1 - Cierre visual del simulador

Objetivo: que el producto se sienta usable y presentable como MVP.

Alcance:

- Ajustar el dashboard para desktop y pantallas chicas.
- Ordenar la barra superior para que las acciones principales no se encimen.
- Mejorar los estados de guardado, error y carga de proyectos.
- Mejorar el estado vacio del canvas.
- Hacer mas clara la biblioteca de componentes.
- Mantener visibles las metricas importantes sin saturar la pantalla.
- Revisar textos, espaciados, botones y jerarquias visuales.

Criterio de cierre:

- El frontend compila.
- El usuario puede iniciar sesion demo.
- El usuario puede entender rapidamente donde arrastrar componentes, donde editar propiedades y donde guardar.
- La interfaz no se rompe en desktop ni en mobile basico.

## Fase 2 - Interaccion completa del editor y proyectos

Objetivo: completar acciones esperables del editor visual y cerrar el flujo minimo de proyectos con nombre.

Alcance:

- Crear proyectos nuevos desde la interfaz.
- Editar el nombre del proyecto antes de guardar.
- Guardar, listar, cargar, renombrar y eliminar proyectos.
- Crear conexiones entre nodos desde la interfaz.
- Eliminar conexiones.
- Duplicar nodos.
- Limpiar canvas.
- Agregar confirmacion visual para acciones destructivas.
- Mejorar seleccion y foco de nodos.
- Preparar atajos simples si aportan valor.

Criterio de cierre:

- Un usuario puede construir un diagrama propio sin depender del ejemplo inicial.
- Puede corregir errores sin reiniciar todo el proyecto.
- Puede guardar un proyecto con nombre, volver a abrirlo y eliminarlo si ya no lo necesita.

## Fase 3 - Persistencia de proyectos completa

Objetivo: que guardar, cargar, actualizar y eliminar proyectos sea confiable.

Alcance:

- Consolidar `GET /api/projects`.
- Consolidar `GET /api/projects/:id`.
- Consolidar `POST /api/projects`.
- Consolidar `PUT /api/projects/:id`.
- Agregar `DELETE /api/projects/:id`.
- Agregar validaciones de payload.
- Mostrar mensajes de error entendibles desde el frontend.

Criterio de cierre:

- Un usuario puede crear varios proyectos, abrirlos, modificarlos y eliminarlos.
- La base conserva nodos y conexiones sin perdida de datos.

## Fase 3 bis - Reglas del simulador MVP

Objetivo: que el simulador no sea solo visual, sino coherente con reglas basicas de arquitectura distribuida.

Alcance:

- Bloquear conexiones libres entre cualquier componente.
- Permitir solo conexiones validas: API Gateway hacia Load Balancer/App Service, Load Balancer hacia App Service, App Service hacia App Service/Database/Cache/Queue, Queue hacia App Service y Cache hacia Database.
- Bloquear ciclos simples para evitar flujos ambiguos en el MVP.
- Marcar como asincronica la conexion App Service hacia Queue.
- Calcular carga, salida real, error, latencia, costo y cuello de botella desde `src/lib/simulator.ts`.
- Renombrar metricas visuales ambiguas, como rendimiento, por salida real.

Criterio de cierre:

- Intentar conectar Load Balancer hacia Database muestra error y no crea conexion.
- Un flujo Load Balancer hacia App Service con 400 req/s y capacidad 800 req/s muestra carga cercana a 50%.
- Un flujo con 1200 req/s sobre App Service de 800 req/s muestra saturacion y error mayor a 0%.

## Fase 4 - Autenticacion minima para MVP

Objetivo: reemplazar el login demo local por un flujo backend simple.

Alcance:

- Crear endpoints de login y sesion.
- Persistir usuarios reales o seeds demo en MySQL.
- Validar email y password.
- Devolver usuario y token simple.
- Asociar proyectos al usuario autenticado.

Criterio de cierre:

- El login ya no depende solo de `localStorage`.
- Los proyectos se listan por usuario autenticado.

## Fase 5 - Simulaciones persistidas

Objetivo: guardar resultados de simulacion para consulta posterior.

Alcance:

- Crear endpoint para ejecutar/guardar simulacion.
- Persistir `simulation_runs`.
- Persistir `simulation_node_metrics`.
- Persistir `scaling_recommendations`.
- Mostrar historial basico de corridas en el frontend.

Criterio de cierre:

- Cada corrida importante puede guardarse y revisarse.
- Las recomendaciones tienen respaldo en base de datos.

## Fase 6 - Entrega y presentacion

Objetivo: preparar el proyecto para evaluacion o demo.

Alcance:

- Actualizar README con comandos reales.
- Documentar arquitectura frontend/backend/base de datos.
- Agregar capturas o flujo de demo.
- Revisar `.env.example`.
- Preparar pasos para levantar MySQL, backend y frontend.
- Agregar checklist de funcionalidades MVP.

Criterio de cierre:

- Cualquier integrante puede clonar, configurar y ejecutar el proyecto.
- El alcance del MVP queda claro y defendible.
