# Software Estrés - Grupo 9

Aplicación web para diseñar, guardar y simular arquitecturas distribuidas bajo carga. El usuario arma un flujo con componentes como puerta de enlace API, balanceadores, servicios, bases de datos y colas; el sistema calcula salida procesada, latencia, error, costo mensual y cuellos de botella.

## Integrantes

- Juan Ignacio Lozano
- Gian Franco Siccardi
- Santiago Rivamar

## Stack

- Frontend: React + TypeScript + Vite.
- Backend: Node.js + Express.
- Base de datos: MySQL 8.
- Tests: Vitest.
- Motor compartido: `shared/simulator-core.js`.

## Arquitectura

El backend mantiene una separación tipo MVC:

- `backend/src/routes/`: define URLs y delega a controladores.
- `backend/src/controllers/`: recibe request/response y llama servicios.
- `backend/src/services/`: contiene lógica de negocio, validaciones, DB y simulación.
- `backend/src/middlewares/`: autenticación, errores, seguridad y rate limit.
- `backend/src/config/`: variables de entorno y pool MySQL.
- `database/`: esquema, migraciones y datos demo.

El frontend se organiza así:

- `src/views/`: pantallas principales.
- `src/components/`: componentes visuales.
- `src/controllers/`: estado de aplicación/autenticación.
- `src/services/`: cliente HTTP hacia el backend.
- `src/models/`: tipos TypeScript.
- `src/lib/`: utilidades y puente al motor compartido.

## Instalación

```bash
npm install
cd backend
npm install
cd ..
```

## Base de datos

Crear estructura y catálogo inicial:

```bash
mysql -u root -p < database/schema.sql
```

Cargar datos demo opcionales:

```bash
mysql -u root -p softwareestres < database/seed-demo.sql
```

Tablas actuales:

- `usuarios`: cuentas, email, contraseña hasheada y rol.
- `proyectos`: proyectos guardados por usuario.
- `categorias_componentes`: agrupaciones del catálogo.
- `tipos_componentes`: tipos de nodos disponibles y valores predeterminados.
- `nodos_proyectos`: nodos colocados en el canvas.
- `conexiones_proyectos`: conexiones entre nodos.

## Variables de entorno

Copiar ejemplo:

```bash
cp backend/.env.example backend/.env
```

Valores esperados:

```txt
NODE_ENV=development
API_PORT=3001
CORS_ORIGIN=http://localhost:8080
SESSION_SECRET=reemplazar_por_un_valor_largo_y_privado
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=softwareestres
DB_USER=root
DB_PASSWORD=
```

No subir `backend/.env` al repositorio.

## Levantar

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
npm run dev
```

URLs locales:

```txt
Frontend: http://localhost:8080/
Backend:  http://localhost:3001/
```

## Endpoints

Health:

```txt
GET http://localhost:3001/health
GET http://localhost:3001/api/health
GET http://localhost:3001/api/health/db
```

Autenticación:

```txt
POST http://localhost:3001/api/autenticacion/registro
POST http://localhost:3001/api/autenticacion/login
```

Proyectos:

```txt
GET    http://localhost:3001/api/proyectos
POST   http://localhost:3001/api/proyectos
GET    http://localhost:3001/api/proyectos/:id
PUT    http://localhost:3001/api/proyectos/:id
DELETE http://localhost:3001/api/proyectos/:id
```

Simulación:

```txt
POST http://localhost:3001/api/simulaciones/ejecutar
```

Los endpoints privados requieren:

```txt
Authorization: Bearer <token>
```

## Tests y validaciones

Ejecutar todo:

```bash
npm test
npm run lint
npm run build
```

Tests actuales:

- `tests/unitarios.test.ts`: funciones aisladas, reglas de negocio y validación de auth.
- `tests/integracion.test.ts`: simulación completa de una arquitectura puerta de enlace -> aplicación -> base de datos.

Total actual:

```txt
2 archivos
10 tests
```

## Seguridad Aplicada

- Contraseñas con PBKDF2 + salt.
- Tokens firmados con HMAC.
- Tokens con expiración.
- Endpoints privados protegidos por middleware de autenticación.
- Rate limit básico en `/api`.
- Headers de seguridad básicos.
- Errores 500 sin stack trace en respuesta HTTP.
- Variables sensibles fuera del repositorio.

## Notas

El motor interno de simulación usa nombres técnicos como `nodes`, `edges` y `kind` porque es un módulo compartido. El contrato HTTP, backend y base de datos usan nombres en español.
