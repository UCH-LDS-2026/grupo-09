# Software Estrés - Grupo 9

Software Estrés es una aplicación web para diseñar, guardar y simular arquitecturas distribuidas bajo carga. El usuario arma un flujo con puerta de enlace API, balanceadores, servicios, bases de datos y colas; la simulación queda siempre activa para ver salida procesada, latencia, error, costo mensual y cuellos de botella.

## Integrantes

- Juan Ignacio Lozano
- Gian Franco Siccardi
- Santiago Rivamar

## Estado actual

- Frontend React + TypeScript con Vite.
- Backend Node.js + Express.
- Base de datos MySQL.
- Registro e inicio de sesión conectados a la tabla `users`.
- Sesión persistida en el navegador y endpoints privados protegidos con `Authorization: Bearer`.
- Persistencia de proyectos, nodos y conexiones.
- Motor de simulación compartido entre frontend y backend.
- Tests automatizados cortos con Vitest.
- Guía completa de exposición en `DEFENSA.md`.

## Requisitos

- Git.
- Node.js 22 o superior.
- npm 10 o superior.
- MySQL 8.

Verificar versiones:

```bash
node --version
npm --version
mysql --version
git --version
```

## Descargar desde GitHub

En una computadora nueva:

```bash
git clone git@github.com:UCH-LDS-2026/grupo-09.git
cd grupo-09
git switch segundamain
```

Si se descarga como ZIP desde GitHub, descomprimirlo y abrir una terminal dentro de la carpeta del proyecto.

## Instalar dependencias

Instalar dependencias del frontend desde la raíz:

```bash
npm install
```

Instalar dependencias del backend:

```bash
cd backend
npm install
cd ..
```

## Preparar la base de datos

Crear la base y sus tablas ejecutando el script SQL:

```bash
mysql -u root -p < database/schema.sql
```

El script crea la base `softwareestres`, las tablas principales y datos iniciales de catálogo.

`database/seed-demo.sql` no crea la estructura de la base. Es un script opcional de demostración que se ejecuta después de `schema.sql` para cargar un usuario y proyectos listos para exponer.

Para cargar esos datos de exposición:

```bash
mysql -u root -p softwareestres < database/seed-demo.sql
```

Usuario demo:

```txt
Email: demo@softwareestres.test
Contraseña: demo1234
```

El seed crea tres proyectos: `Demo estable`, `Demo falla por exceso` y `Demo cuello de botella API`. Conviene ejecutarlo antes de la defensa para no depender de armar todos los escenarios en vivo.

Tablas principales:

- `users`: usuarios registrados.
- `projects`: proyectos guardados por usuario.
- `component_categories`: categorías de componentes.
- `component_types`: tipos de componentes disponibles.
- `projects_nodes`: nodos del diagrama.
- `projects_edges`: conexiones entre nodos.

Tablas eliminadas del MVP:

- `objective_types`
- `project_objectives`
- `simulation_runs`
- `simulation_node_metrics`
- `scaling_recommendations`

No las usa el backend ni el frontend actual. Si una base vieja ya las tiene, se pueden eliminar con:

```bash
mysql -u root -p softwareestres < database/migrations/003-drop-unused-mvp-tables.sql
```

## Configurar variables del backend

Copiar el ejemplo:

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` con los datos locales. Este archivo no debe subirse a GitHub:

```txt
NODE_ENV=development
API_PORT=3001
CORS_ORIGIN=http://localhost:8080
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=softwareestres
DB_USER=root
DB_PASSWORD=tu_contraseña
SESSION_SECRET=reemplazar_por_un_valor_largo_y_privado
```

En desarrollo el backend acepta puertos locales de Vite como `8080`, `8081` o similares.

Notas de seguridad:

- `backend/.env` queda ignorado por Git.
- `backend/.env.example` sí se versiona porque no contiene secretos reales.
- No subir contraseñas, tokens, URLs privadas ni claves reales.
- Cambiar `SESSION_SECRET` por un valor largo y privado en cada entorno.
- Antes de subir, revisar con `git status --short` que no aparezcan archivos `.env`.

## Levantar el sistema

Terminal 1: backend

```bash
cd backend
npm run dev
```

Debe mostrar:

```txt
API running on http://localhost:3001
```

Terminal 2: frontend

```bash
npm run dev
```

Vite muestra la URL disponible. Normalmente es:

```txt
http://localhost:8080/
```

Si `8080` está ocupado, puede usar otro puerto, por ejemplo:

```txt
http://localhost:8081/
```

## Usar la aplicación

1. Abrir la URL del frontend.
2. Elegir `Crear cuenta`.
3. Cargar nombre, email y contraseña.
4. Al registrarse correctamente, el sistema entra al simulador.
5. Agregar o mover componentes en el canvas.
6. Configurar propiedades del componente seleccionado.
7. Subir o bajar el tráfico entrante para ver métricas en tiempo real.
8. Guardar el proyecto para persistirlo en MySQL.
9. Cerrar sesión para volver al acceso.

Si el usuario ya existe, entrar desde `Iniciar sesión` con email y contraseña.

## Endpoints útiles

Health:

```txt
GET http://localhost:3001/health
GET http://localhost:3001/health/db
GET http://localhost:3001/api/health
```

Autenticación:

```txt
POST http://localhost:3001/api/auth/register
POST http://localhost:3001/api/auth/login
```

Proyectos:

```txt
GET    http://localhost:3001/api/projects
POST   http://localhost:3001/api/projects
GET    http://localhost:3001/api/projects/:id
PUT    http://localhost:3001/api/projects/:id
DELETE http://localhost:3001/api/projects/:id
```

Simulación:

```txt
POST http://localhost:3001/api/simulations/run
```

Los endpoints de proyectos y simulación requieren header:

```txt
Authorization: Bearer <token_devuelto_por_login_o_register>
```

## Tests

Ejecutar todos:

```bash
npm test
```

Tests actuales:

- `tests/unitarios.test.ts`: funciones pequeñas del simulador y validación de email de registro.
- `tests/simulator.test.ts`: reglas de negocio del simulador.
- `tests/integracion.test.ts`: flujo completo puerta de enlace -> aplicación -> base de datos.

Total actual: 10 tests.

Ejecutar integración solamente:

```bash
npx vitest run tests/integracion.test.ts
```

Ejecutar unitarios solamente:

```bash
npx vitest run tests/unitarios.test.ts
```

## Validaciones recomendadas

Después de instalar en una máquina nueva:

```bash
npm run lint
npm test
npm run build
```

Probar backend:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/db
```

Registrar usuario por API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Usuario Demo","email":"usuario@sistema.test","password":"demo1234"}'
```

Iniciar sesión por API:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@sistema.test","password":"demo1234"}'
```

Probar endpoint protegido sin token debe devolver `401`:

```bash
curl -i http://localhost:3001/api/projects
```

## Problemas comunes

Si el frontend queda en `Validando...`, revisar que el backend esté iniciado en `http://localhost:3001`.

Si `/health/db` devuelve error, revisar:

- MySQL iniciado.
- Base `softwareestres` creada.
- Contraseña correcta en `backend/.env`.

Si Vite abre `localhost:8081` en vez de `8080`, es normal: significa que `8080` estaba ocupado.

Si el email ya fue registrado, usar `Iniciar sesión` o registrar otro email.

## Carpetas principales

- `src/`: frontend React.
- `backend/`: API Express.
- `database/`: schema SQL y migraciones.
- `shared/`: motor y reglas compartidas.
- `tests/`: pruebas automatizadas.
- `DEFENSA.md`: explicación completa para presentar el TP5.

## Próximos pasos

- Persistir historial real de corridas en una nueva tabla.
- Persistir métricas históricas y recomendaciones cuando el alcance lo requiera.
- Agregar autorización fina por rol en backend.
- Agregar más pruebas si el alcance crece.
