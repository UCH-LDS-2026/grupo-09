# Software Estrés - Grupo 9

## Integrantes

- Juan Ignacio Lozano
- Gian Franco Siccardi
- Santiago Rivamar

## Descripción del proyecto

Software Estrés es una aplicación web para diseñar, visualizar y simular arquitecturas distribuidas.

El sistema permite que un usuario construya gráficamente un esquema de arquitectura usando componentes como Puerta de Enlace API, Balanceador de Carga, Servicio de Aplicación, Base de Datos y Cola de Mensajes. Luego puede ejecutar una simulación de tráfico por ciclos para analizar el comportamiento del sistema bajo carga.

La aplicación muestra métricas como tráfico total, latencia promedio, rendimiento, tasa de error, costo mensual estimado y cuellos de botella. También permite configurar cada componente y recibir recomendaciones básicas de escalado.

## Problema que resuelve

El sistema busca ayudar a estudiantes, docentes y desarrolladores a comprender de forma visual cómo se comporta una arquitectura distribuida cuando recibe carga.

Normalmente, probar este tipo de escenarios requiere infraestructura real, herramientas complejas o conocimientos avanzados de monitoreo. Software Estrés propone una alternativa didáctica e interactiva para experimentar con conceptos como escalabilidad, latencia, saturación, errores y costos sin desplegar servicios reales.

## Estado actual del proyecto

Actualmente el proyecto cuenta con un MVP funcional con frontend, backend, MySQL, persistencia de proyectos, simulación backend y validaciones mínimas de seguridad.

Ya se implementó:

- Usuario demo para acceder al simulador sin autenticación real.
- Arquitectura frontend organizada por vistas, controladores, componentes y servicios.
- Simulador visual de arquitectura distribuida.
- Biblioteca de componentes para arrastrar al lienzo.
- Canvas central para ubicar componentes.
- Panel derecho para configurar el componente seleccionado.
- Opción para eliminar componentes agregados al diagrama.
- Simulación de tráfico entrante por ciclos.
- Cálculo visual de métricas generales.
- Detección de componentes saturados o fallando.
- Recomendaciones básicas de escalado.
- Documentación inicial de arquitectura.
- Backend con Node.js, Express, endpoints de health, proyectos y simulación.
- Conexión configurada para MySQL desde el backend.
- API para guardar, listar, cargar, actualizar y borrar proyectos.
- Persistencia de nodos y conexiones del diagrama en MySQL.
- Botón Guardar conectado al backend.
- Script SQL inicial para la base de datos.
- Motor y reglas de simulación centralizados en `shared/simulator-core.js`.
- Endpoint backend `POST /api/simulations/run`.
- Headers mínimos de seguridad y rate limit simple para `/api`.

Todavía falta autenticación real, historial persistido de corridas, tests automatizados completos y preparación final de entrega.

## Funcionalidades principales

- Entrar con usuario demo.
- Diseñar una arquitectura distribuida de forma visual.
- Agregar componentes al esquema.
- Eliminar componentes del esquema.
- Mover componentes dentro del canvas.
- Configurar propiedades de cada componente.
- Simular tráfico entrante.
- Visualizar métricas de rendimiento.
- Detectar cuellos de botella.
- Ver alertas de saturación o falla.
- Recibir recomendaciones de escalado.
- Consultar costo mensual estimado de la arquitectura.
- Guardar, cargar, actualizar y borrar proyectos.
- Ejecutar simulación desde backend con fallback local.

## Funcionalidades pendientes

- Crear endpoints de autenticación.
- Conectar el login con el backend.
- Persistir usuarios en base de datos.
- Guardar historial de simulaciones.
- Persistir métricas de cada corrida.
- Implementar recomendaciones de escalado desde backend.
- Agregar tests automatizados y validaciones con schemas formales si el alcance crece.
- Mejorar control de roles de usuario.
- Agregar exportación del diagrama o resultados.
- Preparar despliegue del sistema.

## Stack tecnológico

- Frontend: React 19 con TypeScript.
- Build tool: Vite 7.
- Ruteo: TanStack Router.
- UI: Tailwind CSS.
- Iconos: Lucide React.
- Backend: Node.js.
- Base de datos: MySQL 8.
- Gestor de paquetes: npm.

## Justificación del stack

Se eligió React con TypeScript porque permite construir una interfaz interactiva, ordenada y mantenible para diseñar diagramas, configurar componentes y mostrar métricas en tiempo real.

Vite se usa por su rapidez para levantar el proyecto en desarrollo y generar builds optimizados.

Tailwind CSS permite construir una interfaz moderna, flexible y consistente sin depender de hojas de estilo extensas.

TanStack Router se usa para organizar las rutas del frontend.

Node.js fue elegido para el backend porque permite construir una API liviana y compatible con el ecosistema JavaScript del frontend.

MySQL fue elegido porque el sistema trabaja con entidades relacionadas entre sí, como usuarios, proyectos, componentes, conexiones, simulaciones, métricas y recomendaciones.

## Arquitectura del proyecto

El proyecto está separado en frontend, backend, base de datos y documentación.

softwareestres-main/
├── src/          Frontend React + TypeScript
├── backend/      Backend Node.js
├── database/     Scripts y documentación de base de datos
├── shared/       Reglas compartidas de simulación y validación
├── docs/         Documentación técnica
└── dist/         Build generado

## Frontend

El frontend se encuentra en la carpeta:

src/

Está desarrollado con React, TypeScript, Vite, Tailwind CSS y TanStack Router.

Estructura principal:

src/
├── views/        Vistas principales
├── controllers/  Controladores del frontend
├── services/     Servicios del frontend
├── models/       Modelos y tipos
├── components/   Componentes reutilizables
├── routes/       Rutas de la aplicación
└── lib/          Fachadas frontend y utilidades

Actualmente el frontend permite entrar con usuario demo, usar el simulador visual, configurar componentes, consumir simulación backend y persistir proyectos.

## Backend

El backend se encuentra en la carpeta:

backend/

Está preparado para ser desarrollado con Node.js.

Estructura actual:

backend/
├── package.json
├── .env.example
└── src/
    ├── config/
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── services/
    └── utils/

Estado actual del backend:

- La estructura de carpetas ya fue creada.
- El servidor principal ya existe en `backend/src/server.js`.
- La aplicación Express ya existe en `backend/src/app.js`.
- Ya existen endpoints de health: `GET /health`, `GET /health/db` y `GET /api/health`.
- La conexión a MySQL está configurada en `backend/src/config/database.js`.
- Ya existen endpoints de proyectos: `GET`, `POST`, `PUT` y `DELETE /api/projects`.
- Ya existe endpoint de simulación: `POST /api/simulations/run`.
- Ya existen validaciones backend de grafo, conexiones, ciclos e ids.
- Todavía faltan autenticación real, historial de corridas y recomendaciones persistidas.

## Base de datos

La base de datos se encuentra en la carpeta:

database/

Archivos principales:

database/
├── schema.sql
└── README.md

La base de datos está pensada para almacenar:

- Usuarios.
- Proyectos.
- Tipos de componentes.
- Nodos del diagrama.
- Conexiones entre nodos.
- Objetivos de simulación.
- Corridas de simulación.
- Métricas por componente.
- Recomendaciones de escalado.

El script principal se encuentra en:

database/schema.sql

## Documentación

La documentación se encuentra en la carpeta:

docs/

Archivos principales:

docs/
├── arquitectura.md
├── arquitectura-proyecto.md
└── diagrams/

## Versiones usadas

node v22.21.1
npm 10.9.4
mysql 8.0
express 5.2.1
mysql2 3.22.4
vite 7.3.3
react 19.2.6
typescript 5.9.3

## Fase 1 - Base del proyecto

Esta fase deja el proyecto listo para trabajar con frontend, backend y documentación mínima de comandos.

### Qué se revisó

- `.gitignore` ya ignora dependencias, builds, variables de entorno, logs y archivos temporales.
- `node_modules/` no se debe subir al repositorio.
- `dist/` no se debe editar manualmente ni usar como fuente de cambios.
- `.env` no se debe subir al repositorio.
- Los archivos `.env.example` sí se pueden subir porque documentan variables sin secretos.
- Los lockfiles `package-lock.json` y `backend/package-lock.json` sí conviene mantenerlos para instalar las mismas versiones.
- El backend ya tiene servidor Express y endpoints de health.
- El frontend arranca correctamente con Vite.
- El backend instala sus dependencias correctamente.

### Comandos generales

Ver versión de Node:

```bash
node --version
```

Ver versión de npm:

```bash
npm --version
```

Ver estado de Git:

```bash
git status
```

### Instalación del frontend

Desde la raíz del proyecto, instalar las dependencias:

```bash
npm install
```

## Cómo iniciar el frontend

Desde la raíz del proyecto:

```bash
npm run dev
```

El frontend queda disponible en:

```txt
http://localhost:8080/
```

Credenciales demo:

```txt
admin@sistema.test / admin123
arquitecto@sistema.test / demo1234
```

Para verificar que el frontend arranca sin dejarlo corriendo:

```bash
timeout 5s npm run dev -- --host 127.0.0.1
```

Si el frontend está bien, se debe ver un mensaje parecido a:

```txt
VITE v7.3.3 ready
Local: http://127.0.0.1:8080/
```

### Comandos útiles del frontend

Ejecutar lint:

```bash
npm run lint
```

Generar build de producción:

```bash
npm run build
```

Previsualizar el build:

```bash
npm run preview
```

## Cómo iniciar el backend

El backend se encuentra en:

```txt
backend/
```

Instalar dependencias del backend:

```bash
cd backend
npm install
```

Iniciar backend en modo desarrollo:

```bash
cd backend
npm run dev
```

Por defecto queda disponible en:

```txt
http://localhost:3001/
```

Endpoints disponibles en esta fase:

```txt
GET http://localhost:3001/health
GET http://localhost:3001/health/db
GET http://localhost:3001/api/health
```

Ejemplo para probar health:

```bash
curl http://localhost:3001/health
```

Ejemplo para probar conexión con base de datos:

```bash
curl http://localhost:3001/health/db
```

Si MySQL no está iniciado o las credenciales no coinciden, `/health/db` devuelve error `503`.

## Cómo preparar la base de datos

La base de datos está definida en:

```txt
database/schema.sql
```

Para usarla, se debe ejecutar ese script en MySQL.

Ejemplo:

```bash
mysql -u root -p < database/schema.sql
```

Variables esperadas por el backend:

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

Estas variables están documentadas en:

```txt
backend/.env.example
```

Para trabajar localmente, crear un archivo `.env` dentro de `backend/` con esos valores ajustados a la PC.

## Verificación de la Fase 1

Resultado de la revisión:

- Frontend: arranca correctamente en `http://127.0.0.1:8080/`.
- Backend: dependencias instaladas correctamente.
- Backend: `GET /health` responde `200`.
- Backend: `GET /health/db` puede responder `503` hasta configurar MySQL y `backend/.env`; en Fase 2 quedó validado en `200`.
- Lint frontend: `0` errores y `7` warnings de Fast Refresh.
- `.gitignore`: cubre dependencias, builds, logs y variables de entorno.

Warnings actuales de lint:

```txt
react-refresh/only-export-components
```

Estos warnings no frenan el proyecto, pero se pueden limpiar más adelante separando constantes o helpers de algunos componentes UI.

## Fase 2 - Backend y base de datos

Esta fase deja validada la conexión entre el backend y MySQL.

### Datos locales usados

```txt
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=softwareestres
DB_USER=root
```

La contraseña real va solamente en `backend/.env`. No se sube al repositorio.

### Archivo local del backend

Crear este archivo:

```txt
backend/.env
```

Contenido esperado:

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

### Verificar MySQL

Ver versión de MySQL y confirmar que existe la base:

```bash
MYSQL_PWD='tu_contraseña' mysql -h 127.0.0.1 -P 3306 -u root -e "SELECT VERSION() AS mysql_version; SHOW DATABASES LIKE 'softwareestres';"
```

Verificar tablas y datos base:

```bash
MYSQL_PWD='tu_contraseña' mysql -h 127.0.0.1 -P 3306 -u root softwareestres -e "SELECT COUNT(*) AS tables_count FROM information_schema.tables WHERE table_schema = 'softwareestres'; SELECT COUNT(*) AS component_types_count FROM component_types; SELECT COUNT(*) AS objective_types_count FROM objective_types;"
```

Resultado esperado:

```txt
tables_count: 11
component_types_count: 6
objective_types_count: 4
```

### Cargar o actualizar schema

Si la base no existe o faltan tablas, ejecutar desde la raíz:

```bash
MYSQL_PWD='tu_contraseña' mysql -h 127.0.0.1 -P 3306 -u root < database/schema.sql
```

El script usa `CREATE DATABASE IF NOT EXISTS` y `CREATE TABLE IF NOT EXISTS`, por eso se puede ejecutar de forma segura para preparar la base.

### Verificar conexión desde backend

Desde la raíz del proyecto:

```bash
node -e "import('./backend/src/services/database-health.service.js').then(async ({databaseHealthService}) => { const {closeDatabasePool} = await import('./backend/src/config/database.js'); try { console.log(JSON.stringify(await databaseHealthService.getStatus())); } finally { await closeDatabasePool(); } });"
```

Resultado esperado:

```txt
{"status":"ok","database":"softwareestres","host":"127.0.0.1","latencyMs":...}
```

También se puede verificar levantando el backend:

```bash
cd backend
npm run dev
```

Y en otra terminal:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/db
```

### Verificación de la Fase 2

Resultado de la revisión:

- MySQL local responde en `127.0.0.1:3306`.
- Versión detectada: `8.0.45-0ubuntu0.24.04.1`.
- La base `softwareestres` existe.
- El schema tiene `11` tablas.
- Hay `6` tipos de componentes cargados.
- Hay `4` tipos de objetivos cargados.
- `backend/.env` quedó creado localmente y está ignorado por Git.
- `backend/.env.example` usa `DB_HOST=127.0.0.1` como referencia local.
- El backend puede cargar `backend/.env` incluso si se ejecuta una verificación desde la raíz del proyecto.
- La conexión del backend con MySQL responde `status: ok`.

## Fase 3 - Persistencia principal

Esta fase conecta el simulador con MySQL para guardar y cargar proyectos reales.

### Qué se implementó

- API de proyectos en el backend.
- Creación automática del usuario demo en MySQL al guardar un proyecto.
- Guardado de proyecto, tráfico, estado de ejecución, nodos y conexiones.
- Listado de proyectos guardados por usuario.
- Carga de un proyecto guardado con sus nodos y conexiones.
- Actualización de un proyecto existente al volver a presionar `Guardar`.
- Botón `Guardar` conectado al backend desde el simulador.
- Selector de proyectos guardados en la barra superior del simulador.
- Nombre de proyecto editable antes de guardar.

### Endpoints agregados

```txt
GET  /api/projects?userEmail=correo@ejemplo.com
POST /api/projects
GET  /api/projects/:id
PUT  /api/projects/:id
```

### Archivos principales de la fase

```txt
backend/src/routes/projects.routes.js
backend/src/controllers/projects.controller.js
backend/src/services/projects.service.js
src/services/projectService.ts
src/components/SimulatorDashboard.tsx
```

### Cómo probarlo desde la app

1. Levantar el backend:

```bash
cd backend
npm run dev
```

2. Levantar el frontend:

```bash
npm run dev
```

3. Entrar con usuario demo:

```txt
admin@sistema.test / admin123
```

4. Cambiar el nombre del proyecto en la barra superior.
5. Mover o editar algún componente.
6. Presionar `Guardar`.
7. Reiniciar o recargar la app.
8. Usar el selector `Proyectos guardados` para cargar el proyecto.

### Cómo probar la API con curl

Listar proyectos de un usuario:

```bash
curl "http://localhost:3001/api/projects?userEmail=admin@sistema.test"
```

Obtener un proyecto por id:

```bash
curl "http://localhost:3001/api/projects/1"
```

### Verificación de la Fase 3

Resultado de la revisión:

- TypeScript: `npx tsc --noEmit` sin errores.
- Lint: `0` errores y `7` warnings conocidos de Fast Refresh.
- Servicio de proyectos probado contra MySQL:
  - crear proyecto: ok
  - listar proyecto: ok
  - cargar proyecto: ok
  - actualizar proyecto: ok
- Endpoints HTTP probados:
  - `POST /api/projects`: `201`
  - `GET /api/projects`: `200`
  - `GET /api/projects/:id`: `200`

## Estado actualizado del MVP

El proyecto quedó actualizado hasta Fase 3 del MVP:

- **Fase 0:** estabilización del MVP, front-back-DB conectados.
- **Fase 1:** panel derecho de configuración completo.
- **Fase 2:** motor de simulación por ciclos.
- **Fase 3:** validaciones backend, seguridad mínima y reglas centralizadas.

El motor de simulación y las reglas de conexión viven en:

```txt
shared/simulator-core.js
```

El frontend lo usa mediante:

```txt
src/lib/simulator.ts
src/services/simulationService.ts
```

El backend lo usa mediante:

```txt
backend/src/services/projects.service.js
backend/src/services/simulations.service.js
```

Endpoint de simulación:

```txt
POST /api/simulations/run
```

Pendiente principal:

- Fase 4: guardar corridas de simulación, métricas y recomendaciones.
- Fase 5: autenticación real.
- Fase 6: README final de entrega, checklist y demo.

## Nota importante

La carpeta `dist/` contiene archivos generados por el build. No debe modificarse manualmente.

Los cambios reales del sistema deben hacerse en:

```txt
src/
backend/
database/
docs/
README.md
```
