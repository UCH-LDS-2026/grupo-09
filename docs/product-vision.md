# Problema que resuelve

Software Estrés ayuda a razonar sobre arquitecturas distribuidas antes de construir infraestructura real. El problema principal es que una decisión de diseño puede parecer correcta en un diagrama estático, pero fallar cuando se la mira bajo carga: un servicio puede saturarse, una cola puede acumular trabajo, una base de datos puede convertirse en cuello de botella o el costo puede crecer por cantidad de instancias.

La herramienta permite modelar un flujo de componentes, configurar capacidad, latencia, colas, timeouts, instancias, costos, perfil de request y ancho de banda, y ejecutar una simulación simplificada para ver throughput, error, latencia promedio, tráfico de red, costo mensual y cuello de botella.

# Usuarios objetivo

- Estudiante de arquitectura de software: necesita entender cómo cambian las métricas cuando agrega balanceadores, cache, colas o más instancias.
- Developer junior o semi-senior: quiere comparar decisiones de arquitectura antes de levantar servicios reales o configurar infraestructura cloud.
- Equipo técnico en etapa temprana de diseño: necesita una forma rápida de discutir alternativas con números aproximados, sin montar un entorno de carga completo.

# Casos de uso

- Detectar un cuello de botella: por ejemplo, simular una API con 1200 req/s y ver si el servicio de aplicación o la base de datos limita el throughput.
- Comparar escalado horizontal: por ejemplo, aumentar las instancias de un servicio y observar si baja el error o si el cuello se mueve a otro nodo.
- Evaluar el impacto de una cache: por ejemplo, insertar una cache antes de la base de datos y revisar si reduce el tráfico que llega al almacenamiento.
- Analizar costo contra capacidad: por ejemplo, comparar una arquitectura barata pero saturada contra otra más costosa con menor error y mejor latencia.
- Validar reglas de conexión: por ejemplo, evitar un flujo donde la base de datos sea origen de tráfico o donde una conexión genere ciclos no permitidos para el MVP.

# Propuesta de valor

Software Estrés convierte una arquitectura dibujada en un modelo ejecutable y explicable. Su valor está en hacer visible, con datos simples, que un cambio de diseño puede mejorar una métrica y empeorar otra: más instancias aumentan capacidad pero también costo; una cache puede reducir tráfico a base de datos; una cola puede desacoplar partes del flujo pero no elimina la necesidad de capacidad de procesamiento.

No busca predecir producción con precisión. Busca ayudar a pensar, comparar y defender decisiones de arquitectura en una etapa temprana.

# Por qué no alcanza con hacer las cuentas a mano

Las cuentas manuales sirven para un nodo aislado, pero se vuelven frágiles cuando el flujo tiene varios componentes conectados. El throughput de un nodo depende de lo que pudo procesar el anterior, de la capacidad total por instancias, de la cola retenida, del tráfico descartado y de reglas especiales como el tráfico que una cache deja pasar hacia la base de datos.

Además, una arquitectura no se evalúa con una sola métrica. Hay que mirar carga, latencia, error, costo y cuello de botella al mismo tiempo. La simulación automatiza esas cuentas y mantiene consistencia entre escenarios para que la comparación no dependa de cálculos sueltos.

# Comparación contra herramientas reales de carga

| Herramienta | Qué hace | Qué NO hace Software Estrés |
|---|---|---|
| Software Estrés | Modela arquitecturas como grafo, simula capacidad por componente, latencia simplificada, errores, colas, costo, tamaño de request, ancho de banda y cuello de botella. | No ejecuta tráfico real contra sistemas reales, no mide percentiles reales ni reemplaza observabilidad de producción. |
| k6 / JMeter | Generan carga real contra endpoints, miden respuestas reales, latencias y errores bajo prueba. | No lanza requests reales, no valida comportamiento de una API implementada ni reemplaza una prueba de performance. |
| Grafana | Visualiza métricas reales de sistemas en ejecución, dashboards, alertas y series temporales. | No se conecta a métricas reales ni monitorea infraestructura desplegada. |
| AWS Calculator | Estima costos de servicios cloud concretos segun configuración de proveedor. | No calcula precios reales de AWS ni modela servicios cloud con detalle comercial. |

# Límites del simulador

- Usa un modelo simplificado de capacidad por req/s, no una prueba de carga real.
- La latencia se calcula con reglas internas simples, no con mediciones reales de red o percentiles p95/p99.
- El grafo debe ser dirigido y acíclico; no modela ciclos ni patrones complejos de reintentos.
- La cache usa una tasa fija de hit rate definida en el motor, no una política real de invalidación o calentamiento.
- Los costos son valores configurables por instancia, no precios reales de proveedores cloud.
- No modela CPU, memoria, disco, reintentos ni percentiles reales como dimensiones separadas en el estado actual.
- No reemplaza k6, JMeter, Grafana, logs, tracing ni calculadoras cloud.
