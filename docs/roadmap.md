# Roadmap

Este roadmap refleja el estado real del proyecto despues de la revision con Spec Kit. La idea es separar lo que Stressflow ya tiene, lo que conviene hacer primero y lo que queda para una evolucion posterior.

| MVP actual | Proximo | Futuro | Fuera de alcance |
|---|---|---|---|
| Canvas para armar arquitecturas con API gateway, balanceador, servicio, cache, base de datos y cola. | Latencia progresiva: reemplazar saltos fijos por una curva continua y facil de explicar. | Versionado de escenarios para comparar cambios entre simulaciones guardadas. | Reemplazar herramientas de load testing como k6 o JMeter. |
| Validacion de conexiones y bloqueo de ciclos para mantener un grafo dirigido aciclico. | Mejorar la explicacion visual de por que un nodo queda en advertencia, alta carga, saturado o con errores. | Reportes exportables para documentar decisiones tecnicas. | Monitorear sistemas reales en produccion como Grafana. |
| Simulacion de RPS, capacidad por instancias, throughput, colas, errores, latencia, costo y cuello de botella. | Documentar mejor la formula de latencia cuando se implemente la curva progresiva. | Biblioteca de plantillas de arquitectura comunes. | Calcular precios reales y actualizados de proveedores cloud. |
| Medicion de volumen de datos con tamano promedio de request, mezcla de requests pesados y saturacion por ancho de banda. | Endurecer contratos entre frontend, backend, base de datos y motor compartido antes de agregar nuevas dimensiones de simulacion. | Colaboracion multiusuario o comentarios sobre escenarios. | Simular comportamiento exacto de bases de datos, caches, redes o colas reales. |
| Persistencia de proyectos en MySQL con nodos, conexiones, trafico entrante, perfil de request y ancho de banda por nodo. | Mejorar pruebas de compatibilidad para guardado/carga de proyectos antiguos y nuevos. | CPU, memoria, reintentos y escenarios probabilisticos, solo si el modelo sigue siendo defendible. | Ejecutar infraestructura real o desplegar servicios cloud desde la aplicacion. |
| Autenticacion, autorizacion basica por rol, rate limit, CSRF y headers de seguridad. | Alinear documentacion de portfolio para que no marque como faltante algo que ya esta implementado. | Integracion con observabilidad real como importacion/exportacion, no monitoreo en vivo. | Prometer precision de produccion o reemplazar pruebas reales de performance. |

## Siguiente fase recomendada

La siguiente fase funcional deberia ser **latencia progresiva**. Es una mejora acotada, defendible y de bajo riesgo relativo porque empieza en el motor compartido (`shared/simulator-core.js`), se puede cubrir con tests unitarios y se puede explicar en `docs/simulation-model.md`.

Despues de esa fase conviene trabajar en **explicabilidad de resultados**: que la UI explique mejor si un cuello de botella viene por RPS, bandwidth, cola, error o latencia.
