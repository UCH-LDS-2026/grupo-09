# Software Estrés - Grupo 9

## Integrantes

- Juan Ignacio Lozano
- Gian Franco Siccardi
- Santiago Rivamar

## Descripción del proyecto

Software Estrés es una aplicación web para crear proyectos de simulación de pruebas de estrés sobre arquitecturas distribuidas.

El usuario puede armar un diagrama con componentes como API Gateway, Load Balancer, Servicio de Aplicación, Caché, Base de Datos y Cola. Luego puede ejecutar una simulación de carga y analizar métricas como latencia, errores, throughput, costo mensual y posibles cuellos de botella.

## Problema que resuelve

El sistema busca ayudar a estudiantes, docentes y desarrolladores a comprender de forma visual cómo se comporta una arquitectura distribuida bajo carga, sin necesidad de usar infraestructura real ni herramientas complejas.

## Funcionalidades principales

- Crear proyectos de simulación.
- Diseñar una arquitectura con componentes conectados.
- Configurar componentes.
- Ejecutar pruebas de estrés simuladas.
- Ver métricas de rendimiento.
- Detectar cuellos de botella.
- Recibir recomendaciones de escalado.
- Consultar historial de simulaciones.

## Stack tecnológico

- Frontend: React 19 con TypeScript.
- Build tool: Vite 7.
- Router: TanStack Router.
- UI: Tailwind CSS, Radix UI y lucide-react.
- Base de datos: MySQL 8.
- Gestor de paquetes: npm.

## Justificación del stack

Se eligió React con TypeScript porque permite construir una interfaz interactiva, ordenada y mantenible para diseñar diagramas y mostrar métricas. Vite se usa por su rapidez para levantar el proyecto en desarrollo. MySQL fue elegido porque el sistema trabaja con entidades relacionadas entre sí, como usuarios, proyectos, componentes, conexiones, simulaciones y métricas.

## Versiones usadas

```bash
node v22.21.1
npm 10.9.4
mysql 8.0
