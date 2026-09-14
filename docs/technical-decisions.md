# Decisiones técnicas

## React

*Decisión →* usar React con TypeScript para construir la interfaz del simulador.

*Alternativas consideradas →* HTML estático con JavaScript, Vue, Angular o una interfaz generada desde el backend.

*Por qué esta →* React encaja bien con una UI interactiva de canvas, paneles de propiedades, métricas derivadas y estado local que cambia con frecuencia. TypeScript ayuda a mantener el contrato de nodos, conexiones y resultados de simulación más claro entre componentes.

*Trade-off aceptado →* agrega complejidad de build y dependencias frontend, pero permite evolucionar la experiencia visual sin mezclarla con la lógica del backend.

## Node + Express

*Decisión →* usar Node.js con Express para exponer endpoints de autenticación, proyectos, health checks y simulaciones.

*Alternativas consideradas →* backend en Python, Java/Spring, .NET o una aplicación frontend-only sin API propia.

*Por qué esta →* Node permite compartir el motor de simulación JavaScript entre frontend, backend y tests. Express mantiene una estructura simple de rutas, controladores, servicios y middlewares.

*Trade-off aceptado →* Express no impone arquitectura por defecto; el proyecto debe sostener orden con convenciones internas y separación explícita por carpetas.

## MySQL

*Decisión →* persistir usuarios, proyectos, nodos y conexiones en MySQL.

*Alternativas consideradas →* SQLite, PostgreSQL, almacenamiento local del navegador o archivos JSON.

*Por qué esta →* MySQL permite modelar relaciones claras entre usuarios, proyectos, tipos de componentes, nodos y conexiones. También es una base conocida y fácil de defender en un proyecto con backend MVC.

*Trade-off aceptado →* requiere configurar un servicio externo para desarrollo local y tests de persistencia; a cambio, evita que el proyecto dependa solo del estado del navegador.

## Motor compartido

*Decisión →* concentrar reglas de simulación y validación de grafo en `shared/simulator-core.js`.

*Alternativas consideradas →* duplicar lógica entre frontend y backend, mover todo al backend o calcular todo solo en el frontend.

*Por qué esta →* el mismo criterio de capacidad, latencia, colas, errores, conexiones validas y ciclos se puede usar desde la UI, la API y los tests. Eso reduce inconsistencias entre lo que el usuario ve y lo que el backend acepta.

*Trade-off aceptado →* el módulo compartido debe mantenerse compatible con ambos entornos y tener un contrato estable, porque cualquier cambio impacta varias capas.

## Simulación simplificada

*Decisión →* simular capacidad por req/s, instancias, cola, latencia base, timeout, costo por instancia y error derivado de tráfico no procesado.

*Alternativas consideradas →* simular infraestructura real, usar un motor de eventos más detallado o ejecutar pruebas de carga contra servicios desplegados.

*Por qué esta →* el objetivo del producto es educativo y de diseño temprano. Un modelo simple permite explicar resultados en pocos minutos y comparar decisiones sin montar infraestructura.

*Trade-off aceptado →* los resultados son aproximaciones para razonar, no mediciones reales ni predicciones de producción.

## Grafo dirigido acíclico

*Decisión →* representar la arquitectura como un grafo dirigido acíclico y rechazar conexiones que generen ciclos.

*Alternativas consideradas →* permitir ciclos, reintentos, feedback loops o flujos bidireccionales arbitrarios.

*Por qué esta →* un DAG mantiene el flujo de tráfico explicable: entrada, distribución, procesamiento, almacenamiento o mensajería. También evita simulaciones ambiguas donde el tráfico podría circular indefinidamente.

*Trade-off aceptado →* algunos patrones reales quedan fuera del MVP, pero el simulador gana claridad y resultados más fáciles de defender.
