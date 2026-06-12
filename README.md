# Software Estrés - Grupo 9

Software Estrés es una aplicación web para diseñar, guardar y simular arquitecturas distribuidas bajo carga. El usuario arma un flujo con API Gateway, balanceadores, servicios, bases de datos y colas; luego ejecuta una simulación para ver throughput, latencia, error, costo mensual y cuellos de botella.

## Integrantes

- Juan Ignacio Lozano
- Gian Franco Siccardi
- Santiago Rivamar

## Estado actual

- Frontend React + TypeScript con Vite.
- Backend Node.js + Express.
- Base de datos MySQL.
- Registro e inicio de sesión conectados a la tabla `users`.
- Persistencia de proyectos, nodos y conexiones.
- Motor de simulación compartido entre frontend y backend.
- Tests automatizados cortos con Vitest.

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
git switch juan
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

Tablas principales:

- `users`: usuarios registrados.
- `projects`: proyectos guardados por usuario.
- `component_categories`: categorías de componentes.
- `component_types`: tipos de componentes disponibles.
- `projects_nodes`: nodos del diagrama.
- `projects_edges`: conexiones entre nodos.
- `objective_types`: tipos de objetivos.
- `project_objectives`: objetivos por proyecto.
- `simulation_runs`: corridas de simulación.
- `simulation_node_metrics`: métricas por nodo.
- `scaling_recommendations`: recomendaciones de escalado.

## Configurar variables del backend

Copiar el ejemplo:

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` con los datos locales:

```txt
NODE_ENV=development
API_PORT=3001
CORS_ORIGIN=http://localhost:8080
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=softwareestres
DB_USER=root
DB_PASSWORD=tu_contraseña
```

En desarrollo el backend acepta puertos locales de Vite como `8080`, `8081` o similares.

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
7. Ejecutar simulación para ver métricas.
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

## Tests

Ejecutar todos:

```bash
npm test
```

Tests actuales:

- `tests/unitarios.test.ts`: funciones pequeñas del simulador.
- `tests/simulator.test.ts`: reglas de negocio del simulador.
- `tests/integracion.test.ts`: flujo completo gateway -> app -> database.

Ejecutar integración solamente:

```bash
npx vitest run tests/integracion.test.ts
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
- `docs/`: documentación complementaria.

## Próximos pasos

- Guardar historial real de corridas.
- Persistir métricas y recomendaciones de simulación.
- Mejorar roles y permisos.
- Agregar más pruebas si el alcance crece.
