# Review de uso del sistema

Este sistema es un simulador visual de arquitecturas distribuidas. Sirve para armar una arquitectura simple con componentes, configurar capacidad y costo, simular tráfico, detectar saturación/cuello de botella y guardar el proyecto en base de datos.

## Para qué sirve

- Diseñar una arquitectura técnica de forma visual.
- Ver cómo fluye el tráfico entre componentes.
- Probar si una capacidad alcanza para cierto tráfico.
- Detectar qué nodo se satura primero.
- Ver cola, errores, latencia y costo.
- Guardar y recuperar proyectos.

## Elementos de la pantalla

### Barra superior

- **Nombre del proyecto:** permite nombrar el diseño actual.
- **Selector de proyectos guardados:** carga proyectos persistidos en MySQL.
- **Nuevo:** limpia el estado actual y empieza otro proyecto.
- **Guardar:** envía el proyecto al backend y lo persiste en DB.
- **Ejecutar/Detener:** activa o pausa la simulación.
- **Menú de acciones:** duplica, limpia o borra proyecto.

### Panel izquierdo

Contiene la biblioteca de componentes. Desde acá se agregan nodos al canvas.

Componentes MVP:

- **API Gateway:** entrada del tráfico.
- **Load Balancer:** distribuye tráfico hacia servicios.
- **App Service:** procesa pedidos.
- **Database:** representa almacenamiento.
- **Queue:** representa procesamiento asincrónico.

También contiene la sección de conexiones:

- Seleccionar un nodo.
- Presionar **Conectar**.
- Elegir el nodo destino.
- El sistema valida si esa conexión está permitida.

### Canvas central

Es el área donde se arma la arquitectura.

Cada componente muestra:

- Estado visual.
- Cantidad de instancias.
- Capacidad.
- Porcentaje de carga.
- Cola.
- Error.
- Barra de utilización.

### Panel derecho

Cuando se selecciona un componente, muestra propiedades editables:

- **Name:** nombre visible del nodo.
- **Instances:** cantidad de instancias.
- **Capacity:** capacidad por instancia.
- **Base latency:** latencia base.
- **Queue size:** cola interna disponible.
- **Timeout:** tiempo máximo de espera.
- **Cost per instance:** costo mensual por instancia.

También muestra resultados calculados:

- Capacidad total.
- Costo mensual.
- Entrada.
- Carga.
- Salida procesada.
- Cola.
- Error.
- Latencia.
- Estado.

### Métricas inferiores

Resumen global de la arquitectura:

- Tráfico total.
- Latencia promedio.
- Salida procesada.
- Tasa de error.
- Costo mensual estimado.

### Conclusión automática

Explica si la arquitectura está estable o saturada. Si hay saturación, indica el cuello de botella y sugiere aumentar instancias del nodo problemático.

## Cómo funciona la simulación

La simulación corre en ciclos discretos. El motor está centralizado en `shared/simulator-core.js` y lo usan frontend y backend.

En cada ciclo:

1. Entra tráfico a los nodos fuente.
2. Cada nodo calcula su capacidad total: `instances * capacity`.
3. Procesa hasta su capacidad.
4. Si sobra tráfico, intenta guardarlo en cola.
5. Si la cola no alcanza, el exceso se marca como error/descarte.
6. La salida procesada se propaga al siguiente nodo.

El backend expone:

```text
POST /api/simulations/run
```

El frontend consulta ese endpoint. Si el backend no responde, conserva un fallback local para no romper la experiencia.

## Reglas de conexión

Reglas MVP:

- `API Gateway -> Load Balancer`
- `API Gateway -> App Service`
- `Load Balancer -> App Service`
- `App Service -> App Service`
- `App Service -> Database`
- `App Service -> Queue`
- `Queue -> App Service`

No se permiten:

- Conectarse a sí mismo.
- Conexiones duplicadas.
- Ciclos.
- Conexiones que rompan el flujo del MVP, por ejemplo `Load Balancer -> Database`.

Estas reglas están centralizadas y se validan tanto en frontend como en backend.

## Cómo hacer una demo simple

Arquitectura recomendada:

```text
API Gateway -> Load Balancer -> App Service -> Database
```

Pasos:

1. Crear proyecto nuevo.
2. Agregar los cuatro componentes.
3. Conectarlos en orden.
4. Poner tráfico en `600 req/s`.
5. Ejecutar simulación.
6. Mostrar métricas estables.
7. Subir tráfico a `3000 req/s`.
8. Mostrar saturación, cola, error y cuello de botella.
9. Subir instancias del nodo saturado.
10. Mostrar que mejora la carga/error y sube el costo.
11. Guardar proyecto.
12. Cargarlo desde el selector para demostrar persistencia.

## Pruebas para mostrar

### Prueba estable

- Tráfico: `600 req/s`.
- Resultado esperado: error bajo o cero, salida procesada alta, estado estable.

### Prueba de saturación

- Tráfico: `3000 req/s`.
- Resultado esperado: nodo saturado, cola, error y recomendación.

### Prueba de escalado

- Aumentar instancias del nodo saturado.
- Resultado esperado: baja carga/error, sube costo.

### Prueba de conexión inválida

- Intentar `Load Balancer -> Database`.
- Resultado esperado: el sistema lo bloquea.

### Prueba de persistencia

- Guardar proyecto.
- Cargar proyecto.
- Confirmar que nodos, conexiones y valores editados siguen iguales.

## Estado técnico actual

Completado:

- Frontend funcional.
- Backend Express funcional.
- MySQL conectado.
- CRUD de proyectos.
- Simulación por ciclos en backend y frontend.
- Reglas centralizadas en módulo compartido.
- Validaciones backend de proyecto y simulación.
- Headers mínimos de seguridad.
- Rate limit simple por IP.

Pendiente para siguientes fases:

- Autenticación real.
- Guardar historial de corridas.
- Tests automatizados completos.
- Recomendaciones persistidas.
- Mejorar responsive móvil.
- Despliegue/documentación final.
