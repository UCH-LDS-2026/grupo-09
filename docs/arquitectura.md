# Arquitectura MVC del Sistema

## Objetivo

El sistema es la version grafica de un simulador de arquitecturas distribuidas. La aplicacion debe permitir iniciar sesion, crear componentes, conectarlos, simular trafico y visualizar metricas como latencia, costo, errores y cuellos de botella.

## Patron MVC aplicado

La aplicacion usa React + TanStack Router, pero se organiza con responsabilidades MVC:

- **Modelo (`src/models`)**: define los datos del dominio. Ejemplo: usuario, credenciales y sesion.
- **Vista (`src/views`)**: renderiza pantallas completas y recibe datos/acciones por props. Ejemplo: `LoginView`, `SimulatorView`.
- **Controlador (`src/controllers`)**: coordina estado, reglas de flujo y comunicacion con servicios. Ejemplo: `AppController`, `useAuthController`.
- **Servicios (`src/services`)**: encapsulan acceso a datos externos o persistencia. Ejemplo: `authService`, preparado para reemplazar `localStorage` por API real.
- **Componentes reutilizables (`src/components`)**: piezas visuales compartidas y UI del simulador.
- **Librerias de dominio (`src/lib`)**: logica pura reutilizable, como calculos de simulacion e iconos por tipo de nodo.
- **Rutas (`src/routes`)**: conectan URLs con controladores/pantallas.

## Estructura inicial

```text
src/
  controllers/
    AppController.tsx
    useAuthController.ts
  models/
    auth.ts
  services/
    authService.ts
  views/
    auth/
      LoginView.tsx
    simulator/
      SimulatorView.tsx
  components/
    SimulatorDashboard.tsx
    ui/
  lib/
    simulator.ts
    node-icons.ts
    utils.ts
  routes/
    __root.tsx
    index.tsx
```

## Flujo de login

1. `src/routes/index.tsx` carga `AppController`.
2. `AppController` consulta `useAuthController`.
3. `useAuthController` recupera la sesion desde `authService`.
4. Si no hay sesion, se renderiza `LoginView`.
5. Si las credenciales son validas, `authService` guarda la sesion y el controlador muestra `SimulatorView`.
6. `SimulatorView` carga el dashboard grafico y permite cerrar sesion.

Credenciales demo:

```text
admin@sistema.test / admin123
arquitecto@sistema.test / demo1234
```

## Reglas para seguir construyendo

- Las vistas no deben consultar directamente APIs ni `localStorage`.
- Los controladores no deben mezclar estilos o JSX complejo de pantalla.
- Los servicios pueden cambiar de implementacion sin romper las vistas.
- Los modelos deben ser la fuente de verdad para tipos e interfaces.
- La logica de simulacion debe mantenerse como dominio puro en `src/lib` o moverse luego a `src/models/simulator` si crece.

## Proximos modulos sugeridos

- Proyectos de arquitectura: crear, listar, abrir y guardar diagramas.
- Usuarios y roles: admin, arquitecto y visor.
- Persistencia real: API para guardar nodos, conexiones y configuraciones.
- Validaciones: limites de conexiones, nombres duplicados y componentes obligatorios.
- Exportacion: guardar arquitectura como JSON o imagen.
