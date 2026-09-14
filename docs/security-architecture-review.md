# Security and Architecture Review

Fecha: 2026-06-26

## Executive Summary

Stressflow mantiene una separacion razonable entre frontend, backend y base de datos: el navegador solo usa la API HTTP, el backend es la unica capa que accede a MySQL, y los proyectos se filtran por usuario autenticado. No se detectaron vulnerabilidades criticas ni altas en la revision de esta fase. Se aplico un hardening puntual sobre sesiones: comparacion segura de firmas y borrado de cookie con opciones compatibles.

Validacion ejecutada:

- `npm test`: OK, 29 tests.
- `npm run build`: OK.
- `npm run lint`: OK.
- `npm run security:audit`: OK, 0 vulnerabilidades reportadas en frontend/backend production dependencies.

## Estado de Separacion Frontend / Backend / Base de Datos

- El frontend usa `fetch` con `credentials: "include"` y no contiene credenciales de base de datos. La URL publica de API sale de `VITE_API_URL`, que no debe tratarse como secreto.
- El backend crea el pool MySQL en `backend/src/config/database.js`; no hay acceso directo a DB desde `src/`.
- Las rutas de proyectos requieren autenticacion y CSRF antes de listar, crear, actualizar o borrar proyectos (`backend/src/routes/projects.routes.js:9-15`).
- La persistencia filtra proyectos por usuario: listado por `usuario_id` (`backend/src/services/projects.service.js:323-340`) y lectura por `id` + `usuario_id` (`backend/src/services/projects.service.js:353-370`).
- La actualizacion valida ownership antes de modificar (`backend/src/services/projects.service.js:260-283`).

## Seguridad Backend

### Controles presentes

- `x-powered-by` deshabilitado y `trust proxy` explicito (`backend/src/app.js:33-34`).
- Headers de seguridad aplicados antes de CORS/rutas (`backend/src/app.js:36`).
- CORS restringido a origen configurado y localhost en desarrollo (`backend/src/app.js:17-27`, `backend/src/app.js:37-43`).
- Rate limit global bajo `/api` (`backend/src/app.js:45`) y rate limit especifico para login/registro.
- Body limit de 1 MB (`backend/src/app.js:46`).
- Cookies `HttpOnly`, `SameSite=Lax`, `Secure` segun entorno y path `/` (`backend/src/services/auth.service.js:174-181`).
- CSRF token asociado a sesion y exigido para mutaciones con cookie.
- Passwords hasheadas con PBKDF2 + salt (`backend/src/services/auth.service.js:63-74`).
- SQL parametrizado mediante `connection.execute` / `pool.execute`.
- Errores 500 no exponen stack trace al cliente.

### Hardening aplicado

- **S1 - Session signature comparison**
  - Severidad: Low defense-in-depth.
  - Ubicacion: `backend/src/services/auth.service.js:118-123`, `backend/src/services/auth.service.js:153-158`.
  - Cambio: se agrego `safeEqualString()` con `timingSafeEqual` para comparar firmas de sesion cuando tienen la misma longitud.
  - Impacto: reduce diferencias observables en comparaciones de firma.

- **S2 - Cookie clearing options**
  - Severidad: Low reliability/security hardening.
  - Ubicacion: `backend/src/services/auth.service.js:184-200`.
  - Cambio: `clearSessionCookie()` ahora limpia con las mismas opciones relevantes de la cookie de sesion, sin `maxAge`.
  - Impacto: evita fallas de borrado cuando SameSite/Secure/path deben coincidir.

## Seguridad Frontend

- No se detecto uso de `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `localStorage` o `sessionStorage` para datos sensibles.
- La sesion frontend se mantiene en memoria; el token real de sesion queda en cookie `HttpOnly`, no accesible desde JavaScript.
- El CSRF token si vive en memoria del frontend porque debe enviarse en header; esto es aceptable para el modelo cookie + CSRF, y se borra al recibir 401/403.
- `import.meta.env.VITE_API_URL` es configuracion publica de cliente; no contiene secretos en `.env.example`.

## Arquitectura y Clean Code

- Backend mantiene separacion Route -> Controller -> Service -> Config/Middleware.
- El motor de simulacion sigue centralizado en `shared/simulator-core.js`, compartido por frontend/backend/tests.
- La base de datos modela ownership con `proyectos.usuario_id` y cascadas para nodos/conexiones.
- Las reglas de grafo y normalizacion se validan en el motor compartido antes de persistir.
- No se agregaron dependencias nuevas.

## Persistencia

- Proyectos, nodos y conexiones se guardan en transaccion (`saveProject`) y reemplazan nodos/conexiones de forma atomica.
- Proyectos viejos tienen defaults para request profile y bandwidth en motor, backend y frontend.
- La API no devuelve `hash_contrasena` ni otros secretos en respuestas de sesion/proyectos.

## Riesgos Residuales / Recomendaciones

- **R1 - IDs publicos incrementales**
  - Severidad: Low/Medium segun exposicion futura.
  - Evidencia: `proyectos.id` es autoincremental en `database/schema.sql` y se usa en rutas como `/proyectos/:id`.
  - Estado: mitigado parcialmente por ownership (`id` + `usuario_id`). Para un producto publico real, considerar exponer `slug`/UUID no enumerable en vez de `id` numerico.

- **R2 - Password hashing sin Argon2/bcrypt**
  - Severidad: Low para alcance actual, Medium si pasa a produccion real.
  - Evidencia: PBKDF2 con 100k iteraciones en `backend/src/services/auth.service.js:6-8` y `backend/src/services/auth.service.js:63-74`.
  - Estado: aceptable para proyecto educativo sin nueva dependencia. Si se endurece auth para produccion, evaluar Argon2/bcrypt con migracion gradual de hashes.

- **R3 - CSP del backend no cubre necesariamente el frontend Vite desplegado**
  - Severidad: Low/Medium segun hosting.
  - Evidencia: headers en API (`backend/src/app.js:36`) no garantizan headers del hosting estatico/frontend.
  - Accion: al desplegar frontend, configurar CSP/clickjacking/nosniff en el host o proxy que sirva la UI.

## Decision

La fase queda aprobada para continuar: no se detectan bloqueantes criticos/altos para seguir desarrollando. La siguiente mejora tecnica recomendada es reforzar tests de persistencia/contratos con API real o preparar un entorno de integracion con MySQL dedicado si el proyecto va a crecer.
