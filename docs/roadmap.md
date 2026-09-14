# Roadmap

Este roadmap refleja el estado real del proyecto despues de la revision con Spec Kit. La idea es separar lo que Stressflow ya tiene, lo que conviene hacer primero y lo que queda para una evolucion posterior.

| MVP actual | Proximo | Futuro | Fuera de alcance |
|---|---|---|---|
| Canvas para armar arquitecturas con API gateway, balanceador, servicio, cache, base de datos y cola. | Versionado de escenarios para comparar cambios entre simulaciones guardadas. | Reportes exportables para documentar decisiones tecnicas. | Reemplazar herramientas de load testing como k6 o JMeter. |
| Validacion de conexiones y bloqueo de ciclos para mantener un grafo dirigido aciclico. | Exportar un informe tecnico del escenario con inputs, cuello de botella y recomendacion. | Biblioteca de plantillas de arquitectura comunes. | Monitorear sistemas reales en produccion como Grafana. |
| Simulacion de RPS, capacidad por instancias, throughput, colas, errores, latencia progresiva, costo y cuello de botella. | Mejorar compatibilidad de migraciones entre entornos y confirmar estado aplicado en la base objetivo. | Colaboracion multiusuario o comentarios sobre escenarios. | Calcular precios reales y actualizados de proveedores cloud. |
| Medicion de volumen de datos con tamano promedio de request, mezcla de requests pesados y saturacion por ancho de banda. | Preparar una revision visual responsive de mobile/tablet despues de quitar paneles flotantes secundarios. | CPU, memoria, reintentos y escenarios probabilisticos, solo si el modelo sigue siendo defendible. | Simular comportamiento exacto de bases de datos, caches, redes o colas reales. |
| Persistencia de proyectos en MySQL con nodos, conexiones, trafico entrante, perfil de request y ancho de banda por nodo. | Fortalecer pruebas end-to-end de flujos reales de usuario cuando el entorno de browser este disponible. | Integracion con observabilidad real como importacion/exportacion, no monitoreo en vivo. | Ejecutar infraestructura real o desplegar servicios cloud desde la aplicacion. |
| Autenticacion, autorizacion basica por rol, rate limit, CSRF, cookies HttpOnly firmadas y headers de seguridad. | Revisar permisos por rol sobre operaciones de proyecto si se incorporan usuarios compartidos. | Paneles comparativos entre versiones del mismo escenario. | Prometer precision de produccion o reemplazar pruebas reales de performance. |

## Estado de fases ejecutadas

- Spec Kit instalado y usado para ordenar roadmap, criterios de seguridad, arquitectura, clean code y pruebas.
- Latencia progresiva implementada y documentada en el motor compartido.
- Explicabilidad de resultados implementada con causa principal, senales por metrica y accion recomendada.
- Contratos de simulacion/persistencia alineados entre frontend, backend, base de datos y motor compartido.
- Revision de seguridad frontend/backend/base de datos documentada sin bloqueantes criticos o altos.
- Documentacion publica actualizada para no listar como futuro algo que ya esta implementado.

## Siguiente fase recomendada

La siguiente fase funcional recomendada es **versionado de escenarios**. Es el proximo salto de valor para el usuario porque permite comparar una arquitectura actual contra una variante optimizada sin perder el punto de partida.

Antes de tocar persistencia nueva, queda un prerequisito operativo: confirmar si las migraciones de `database/migrations/` ya estan aplicadas en el entorno objetivo. Sin esa confirmacion, cualquier cambio de esquema podria romper datos existentes.
