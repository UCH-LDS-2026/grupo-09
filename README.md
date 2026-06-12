# Software Estrés — Grupo 9

Breve guía del proyecto: diseño, simulación y análisis de arquitecturas distribuidas.

Resumen
- Aplicación web para diseñar arquitecturas (gateway, load balancer, servicios, DB, colas) y simular tráfico por ciclos.
- Muestra métricas (throughput, latencia, error, costo, cuellos de botella) y sugiere escalado básico.

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
- Interfaz visual para armar diagramas con componentes.
- Motor de simulación por ciclos que propaga tráfico y calcula métricas.
- Persistencia de proyectos en MySQL y endpoint `POST /api/simulations/run`.

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
- Pendientes principales: autenticación real, guardar histórico de corridas, más tests automatizados y mejoras de roles.

Créditos
- Grupo 9: Juan Ignacio Lozano, Gian Franco Siccardi, Santiago Rivamar

Para más detalles ver `docs/` y `backend/.env.example`.
