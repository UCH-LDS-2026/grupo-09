# Arquitectura del MVP

El MVP es un simulador visual básico de arquitectura distribuida.

El usuario puede:

1. Crear un proyecto.
2. Arrastrar componentes al canvas.
3. Conectar componentes válidos.
4. Configurar tráfico.
5. Ejecutar o detener la simulación.
6. Ver carga, salida procesada, latencia, error, costo, cuello de botella y conclusión.
7. Guardar y cargar proyectos desde backend/base de datos.

## Capas

- `src/controllers`: coordina la pantalla principal.
- `src/views`: monta la vista del simulador.
- `src/components`: contiene el dashboard y piezas visuales del simulador.
- `src/lib/simulator.ts`: reglas de conexión, cálculo de métricas y estados.
- `src/services/projectService.ts`: conexión frontend-backend para proyectos.
- `backend/src`: API HTTP, servicios y acceso a MySQL.
- `database`: schema y migraciones.

## Flujo Principal

```txt
SimulatorDashboard
  -> projectService
  -> backend /api/projects
  -> MySQL
```

## Componentes Del MVP

- API Gateway
- Load Balancer
- App Service
- Database
- Queue

Cache queda desactivado por ahora para mantener simple la explicación.

## Seguridad Actual

El MVP usa un usuario demo fijo para guardar proyectos. Esto evita simular un login real inseguro.

Para una fase posterior:

- autenticación real,
- sesiones,
- permisos por usuario,
- validación backend más estricta.
