# Software Estrés - Grupo 9

## Integrantes

- Juan Ignacio Lozano
- Gian Franco Siccardi
- Santiago Rivamar

## Descripción del proyecto

Software Estrés es una aplicación web para diseñar, visualizar y simular arquitecturas distribuidas.

El sistema permite que un usuario construya gráficamente un esquema de arquitectura usando componentes como Puerta de Enlace API, Balanceador de Carga, Servicio de Aplicación, Caché, Base de Datos y Cola de Mensajes. Luego puede ejecutar una simulación de tráfico para analizar el comportamiento del sistema bajo carga.

La aplicación muestra métricas como tráfico total, latencia promedio, rendimiento, tasa de error, costo mensual estimado y cuellos de botella. También permite configurar cada componente y recibir recomendaciones básicas de escalado.

## Problema que resuelve

El sistema busca ayudar a estudiantes, docentes y desarrolladores a comprender de forma visual cómo se comporta una arquitectura distribuida cuando recibe carga.

Normalmente, probar este tipo de escenarios requiere infraestructura real, herramientas complejas o conocimientos avanzados de monitoreo. Software Estrés propone una alternativa didáctica e interactiva para experimentar con conceptos como escalabilidad, latencia, saturación, errores y costos sin desplegar servicios reales.

## Estado actual del proyecto

Actualmente el proyecto cuenta con una primera versión funcional del frontend.

Ya se implementó:

- Pantalla de login básica y moderna.
- Arquitectura frontend organizada con enfoque MVC.
- Simulador visual de arquitectura distribuida.
- Biblioteca de componentes para arrastrar al lienzo.
- Canvas central para ubicar componentes.
- Panel derecho para configurar el componente seleccionado.
- Opción para eliminar componentes agregados al diagrama.
- Simulación de tráfico entrante.
- Cálculo visual de métricas generales.
- Detección de componentes saturados o fallando.
- Recomendaciones básicas de escalado.
- Documentación inicial de arquitectura.
- Estructura inicial para backend con Node.js.
- Script SQL inicial para la base de datos.

Todavía falta conectar el backend real, la base de datos y la persistencia de proyectos.

## Funcionalidades principales

- Iniciar sesión en el sistema.
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

## Funcionalidades pendientes

- Implementar backend real con Node.js.
- Crear servidor principal del backend.
- Crear endpoints de autenticación.
- Conectar el login con el backend.
- Conectar el sistema con MySQL.
- Persistir usuarios en base de datos.
- Crear, guardar y listar proyectos.
- Guardar nodos y conexiones del diagrama.
- Cargar proyectos previamente guardados.
- Guardar historial de simulaciones.
- Persistir métricas de cada corrida.
- Implementar recomendaciones de escalado desde backend.
- Agregar validaciones más completas.
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
└── lib/          Lógica auxiliar y simulación

Actualmente el frontend es la parte más avanzada del proyecto. Ya permite iniciar sesión con credenciales demo y usar el simulador visual.

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
- El package.json del backend ya existe.
- El archivo .env.example ya existe.
- Todavía no se implementó el servidor principal.
- Todavía no hay endpoints.
- Todavía no está conectado a MySQL.

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

## Instalación del proyecto

Desde la raíz del proyecto, instalar las dependencias:

npm install

## Cómo iniciar el frontend

Desde la raíz del proyecto:

npm run dev

El frontend queda disponible en:

http://localhost:8080/

Credenciales demo:

admin@sistema.test / admin123
arquitecto@sistema.test / demo1234

## Cómo iniciar el backend

El backend todavía no tiene servidor implementado.

La carpeta ya existe y está preparada en:

backend/

Cuando se implemente el servidor principal, se podrá iniciar entrando a la carpeta backend:

cd backend

Y luego ejecutando:

npm run dev

Por ahora este comando está preparado en el package.json del backend, pero falta crear el archivo principal del servidor.

## Cómo preparar la base de datos

La base de datos está definida en:

database/schema.sql

Para usarla, se debe ejecutar ese script en MySQL.

Ejemplo esperado:

mysql -u root -p < database/schema.sql

Esto creará la base de datos softwareestres y sus tablas principales.

## Comandos útiles

Instalar dependencias del frontend:

npm install

Levantar frontend:

npm run dev

Generar build:

npm run build

Ejecutar lint:

npm run lint

Entrar al backend:

cd backend

Levantar backend cuando esté implementado:

npm run dev

## Estado resumido

Frontend:
- Funcional en desarrollo.
- Tiene login demo.
- Tiene simulador visual.
- Tiene agregado y eliminación de componentes.
- Tiene métricas y alertas visuales.

Backend:
- Solo tiene estructura inicial.
- Falta implementar servidor, rutas, controladores, servicios y modelos.

Base de datos:
- Tiene script SQL inicial.
- Falta conectarla con el backend.

Documentación:
- Tiene documentación inicial de arquitectura.
- Tiene diagramas y README de base de datos.

## Nota importante

La carpeta dist/ contiene archivos generados por el build. No debe modificarse manualmente.

Los cambios reales del sistema deben hacerse en:

src/
backend/
database/
docs/

```bash
node v22.21.1
npm 10.9.4
mysql 8.0
