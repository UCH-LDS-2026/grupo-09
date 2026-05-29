# Arquitectura del Proyecto

```text
softwareestres-main/
├── src/                              # FRONTEND (React + TypeScript + Vite)
│   ├── components/                   # Componentes reutilizables
│   │   ├── ui/                       # Componentes base de interfaz (botones, inputs, paneles)
│   │   └── SimulatorDashboard.tsx    # Editor visual del sistema distribuido
│   │
│   ├── controllers/                  # Controladores del frontend
│   │   ├── AppController.tsx         # Decide si mostrar login o simulador
│   │   └── useAuthController.ts      # Controla el estado de autenticacion
│   │
│   ├── hooks/                        # Hooks reutilizables
│   │   └── use-mobile.tsx            # Hook para detectar vista mobile
│   │
│   ├── lib/                          # Logica auxiliar del frontend
│   │   ├── simulator.ts              # Logica de simulacion: carga, latencia, errores y costo
│   │   ├── node-icons.ts             # Iconos de los componentes del simulador
│   │   └── utils.ts                  # Utilidades generales
│   │
│   ├── models/                       # Modelos y tipos del frontend
│   │   └── auth.ts                   # Tipos de usuario, login y sesion
│   │
│   ├── routes/                       # Rutas de la aplicacion
│   │   ├── __root.tsx                # Layout raiz, metadata y pagina 404
│   │   └── index.tsx                 # Ruta principal
│   │
│   ├── services/                     # Servicios del frontend
│   │   └── authService.ts            # Servicio de autenticacion temporal
│   │
│   ├── views/                        # Vistas principales
│   │   ├── auth/                     # Pantallas de autenticacion
│   │   │   └── LoginView.tsx         # Login del sistema
│   │   │
│   │   └── simulator/                # Pantallas del simulador
│   │       └── SimulatorView.tsx     # Vista que carga el dashboard del simulador
│   │
│   ├── router.tsx                    # Configuracion del router
│   ├── routeTree.gen.ts              # Archivo generado por TanStack Router
│   └── styles.css                    # Estilos globales
│
├── backend/                          # BACKEND (Node.js)
│   ├── package.json                  # Configuracion del backend
│   ├── .env.example                  # Variables de entorno de ejemplo
│   │
│   └── src/                          # Codigo fuente del backend
│       ├── config/                   # Configuracion general
│       ├── controllers/              # Controladores HTTP
│       ├── middlewares/              # Middlewares de autenticacion, errores, validaciones
│       ├── models/                   # Modelos de datos y consultas
│       ├── routes/                   # Rutas/endpoints de la API
│       ├── services/                 # Logica de negocio
│       └── utils/                    # Funciones auxiliares
│
├── database/                         # BASE DE DATOS
│   ├── schema.sql                    # Script SQL principal
│   └── README.md                     # Explicacion de las tablas
│
├── docs/                             # DOCUMENTACION
│   ├── arquitectura.md               # Explicacion MVC inicial
│   ├── arquitectura-proyecto.md      # Arbol de arquitectura del proyecto
│   │
│   └── diagrams/                     # Diagramas tecnicos
│       ├── class-diagram.mmd         # Diagrama de clases
│       ├── use-case-diagram.mmd      # Diagrama de casos de uso
│       └── README.md                 # Explicacion de diagramas
│
├── dist/                             # BUILD GENERADO
│   ├── client/                       # Archivos compilados del frontend
│   └── server/                       # Archivos compilados del servidor SSR
│
├── node_modules/                     # Dependencias instaladas
├── package.json                      # Configuracion principal del frontend
├── package-lock.json                 # Lockfile de npm
├── bun.lockb                         # Lockfile de bun
├── bunfig.toml                       # Configuracion de bun
├── components.json                   # Configuracion de componentes UI
├── eslint.config.js                  # Configuracion de ESLint
├── tsconfig.json                     # Configuracion de TypeScript
├── vite.config.ts                    # Configuracion de Vite
└── wrangler.jsonc                    # Configuracion para despliegue/Cloudflare
```

## Flujo Principal

```text
Usuario
  ↓
Frontend (src/)
  ↓
Servicios del frontend
  ↓
Backend (backend/)
  ↓
Base de datos (database/)
```

## Flujo MVC

```text
Vista
  ↓
Controlador
  ↓
Servicio
  ↓
Modelo
  ↓
Base de datos
```

## Nota Importante

```text
dist/ no se edita manualmente.
```

Los cambios reales se hacen en:

```text
src/
backend/
database/
docs/
```
