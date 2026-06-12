# Software Estrés — Grupo 9

Software Estrés es un simulador web para diseñar, guardar y probar arquitecturas distribuidas bajo carga. La idea del sistema es que un estudiante o docente pueda armar un flujo con API Gateway, balanceadores, servicios, bases de datos y colas, ejecutar tráfico simulado y ver rápidamente dónde aparecen saturación, errores, latencia, costo y cuellos de botella.

Integrantes
- Juan Ignacio Lozano
- Gian Franco Siccardi
- Santiago Rivamar

Estado actual
- MVP funcional con frontend, backend, MySQL y simulador compartido.
- Login y registro conectados con la tabla `users`.
- Persistencia de proyectos, nodos y conexiones en MySQL.
- Tests cortos con Vitest para reglas unitarias y una integración del motor.

Instalación rápida
1. Instalar dependencias (raíz):

```bash
npm install
```

2. Iniciar frontend:

```bash
npm run dev
# Accede en http://localhost:8080/
```

3. Iniciar backend:

```bash
cd backend
npm install
npm run dev
# API en http://localhost:3001/
```

Base de datos
- Ejecutar el DDL en `database/schema.sql` para crear la DB y tablas:

```bash
mysql -u root -p < database/schema.sql
```

Variables de entorno
- Copiar `backend/.env.example` → `backend/.env` y ajustar `DB_*`, `API_PORT`, `CORS_ORIGIN`.

Qué es el MVP
- Registro e inicio de sesión con email y contraseña.
- Interfaz visual para armar diagramas con componentes.
- Motor de simulación por ciclos que propaga tráfico y calcula métricas.
- Persistencia de proyectos en MySQL.
- Endpoint `POST /api/simulations/run` para ejecutar simulaciones desde backend.

Arquitectura del repositorio
- `src/` frontend (React + TypeScript + Vite)
- `backend/` API (Node.js + Express)
- `shared/` reglas y motor de simulación reutilizable
- `database/` scripts SQL

Stack resumido
- Frontend: React 19, TypeScript, Vite, Tailwind, TanStack Router
- Backend: Node.js, Express
- DB: MySQL 8
- Tests: Vitest

Tests
- Ejecutar todos: `npm test` (usa Vitest y corre `tests/`).
- Test unitarios: archivos en `tests/*unit*.ts`.
- Test de simulador: `tests/simulator.test.ts` (reglas del motor).
- Test de integración: `tests/integracion.test.ts` (simula flujo gateway→app→db).
- Ejecutar un test específico:

```bash
npx vitest run tests/integracion.test.ts
```

Estado y próximos pasos
- MVP funcional: frontend, backend, persistencia de proyectos y simulador.
- Pendientes principales: guardar histórico de corridas, ampliar roles, mejorar validaciones y sumar más cobertura si el alcance crece.

Para más detalles ver `docs/` y `backend/.env.example`.
