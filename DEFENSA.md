# DEFENSA TP5 - Software Estres

Este archivo concentra lo necesario para defender el proyecto final de Laboratorio de Desarrollo de Software. Esta pensado para que los tres integrantes puedan explicar el sistema frente a un profesor, mostrar la demo, responder preguntas y justificar decisiones tecnicas.

## 1. Resumen corto del proyecto

Software Estres es una aplicacion web para disenar y simular arquitecturas distribuidas bajo carga.

El usuario se registra o inicia sesion, entra a un simulador visual, agrega componentes como puerta de enlace API, balanceador de carga, servicio de aplicacion, base de datos y cola, conecta esos componentes, configura parametros tecnicos y observa si la arquitectura soporta el trafico configurado.

El sistema calcula:

- Trafico procesado.
- Latencia promedio.
- Tasa de error.
- Costo mensual estimado.
- Estado de cada componente.
- Cuello de botella.
- Recomendacion basica de mejora.

## 2. Problema que resuelve

Cuando se disena un sistema distribuido, no siempre es facil ver que componente va a fallar primero. Por ejemplo, una API puede soportar muchas requests, pero la base de datos puede saturarse antes. Esta app permite construir una arquitectura simple y probar escenarios de carga sin tener que desplegar infraestructura real.

Valor del proyecto:

- Ayuda a entender conceptos de arquitectura distribuida.
- Permite explicar capacidad, latencia, throughput y cuellos de botella de forma visual.
- Sirve como herramienta educativa para comparar decisiones de diseno.
- Integra frontend, backend, base de datos, autenticacion, CRUD y tests.

## 3. MVP real

El MVP implementado permite:

- Registrar usuario.
- Iniciar sesion.
- Cerrar sesion.
- Entrar al simulador solo si hay sesion.
- Crear una arquitectura visual.
- Agregar componentes.
- Conectar componentes validos.
- Editar parametros de componentes.
- Configurar requests por segundo.
- Ver simulacion siempre activa.
- Ver resultado tecnico.
- Guardar proyectos en MySQL.
- Cargar proyectos guardados.
- Borrar proyectos.
- Ejecutar tests automatizados.

No esta implementado como version completa:

- Panel administrativo real.
- Historial persistido de cada corrida de simulacion.
- Graficos historicos avanzados.
- Exportacion de resultados.

## 4. Stack tecnologico

Frontend:

- React 19.
- TypeScript.
- Vite.
- TanStack Router.
- Tailwind CSS.
- lucide-react para iconos.

Backend:

- Node.js.
- Express.
- mysql2/promise.
- dotenv.
- cors.

Base de datos:

- MySQL 8.
- Script principal: `database/schema.sql`.
- Seed de demo: `database/seed-demo.sql`.

Testing:

- Vitest.
- Tests en carpeta `tests/`.

## 5. Estructura real del repositorio

Carpetas principales:

- `src/`: frontend de React.
- `src/views/`: pantallas principales.
- `src/components/`: componentes visuales.
- `src/components/simulator/`: paneles y UI del simulador.
- `src/controllers/`: controlador React del flujo de app y auth.
- `src/services/`: servicios frontend que consumen la API.
- `src/lib/`: utilidades y wrapper del simulador.
- `backend/src/`: API Express.
- `backend/src/routes/`: rutas HTTP.
- `backend/src/controllers/`: controllers de la API.
- `backend/src/services/`: logica de negocio y acceso a datos.
- `backend/src/middlewares/`: seguridad, errores, rate limit, auth.
- `backend/src/config/`: variables de entorno y conexion MySQL.
- `shared/`: motor de simulacion compartido.
- `database/`: schema, migraciones y datos demo.
- `tests/`: pruebas automatizadas.

Archivos importantes:

- `README.md`: instrucciones generales.
- `DEFENSA.md`: este archivo.
- `package.json`: scripts del frontend y tests.
- `backend/package.json`: scripts del backend.
- `vite.config.ts`: configuracion frontend.
- `vitest.config.ts`: configuracion de tests.
- `database/schema.sql`: crea la base desde cero.
- `database/seed-demo.sql`: carga usuario y proyectos demo.

## 6. Arquitectura MVC aplicada

El proyecto no es MVC clasico con vistas server-side, porque usa frontend separado en React, pero la separacion conceptual existe.

Model:

- Esta representado por las tablas de MySQL:
- `users`.
- `projects`.
- `component_categories`.
- `component_types`.
- `projects_nodes`.
- `projects_edges`.

View:

- Es el frontend React.
- Pantallas principales:
- `src/views/auth/LoginView.tsx`.
- `src/views/simulator/SimulatorView.tsx`.
- `src/components/SimulatorDashboard.tsx`.

Controller:

- Backend:
- `backend/src/controllers/auth.controller.js`.
- `backend/src/controllers/projects.controller.js`.
- `backend/src/controllers/simulations.controller.js`.
- `backend/src/controllers/health.controller.js`.

Service:

- Backend:
- `backend/src/services/auth.service.js`.
- `backend/src/services/projects.service.js`.
- `backend/src/services/simulations.service.js`.
- `backend/src/services/health.service.js`.

Acceso a datos:

- Actualmente esta dentro de los services usando `mysql2/promise`.
- No hay carpeta `repositories`.
- Para este MVP es aceptable, aunque una mejora futura seria separar repositories/DAO.

Motor compartido:

- `shared/simulator-core.js`.
- Lo usa el backend, el frontend y los tests.
- Esto evita duplicar reglas de negocio.

## 7. Flujo de usuario para demo

1. Abrir el frontend.
2. Mostrar pantalla de login.
3. Iniciar sesion con usuario demo o registrar usuario nuevo.
4. Entrar al simulador.
5. Mostrar el proyecto inicial o cargar un proyecto demo.
6. Agregar componentes desde la biblioteca.
7. Seleccionar un componente.
8. Editar instancias, capacidad, latencia o cola.
9. Usar el boton `Conectar`.
10. Elegir componente destino.
11. Mostrar que una conexion invalida genera error visible.
12. Ajustar requests por segundo.
13. Mostrar que la simulacion se actualiza automaticamente.
14. Mostrar metricas inferiores.
15. Mostrar conclusion tecnica.
16. Guardar proyecto.
17. Cargar proyecto guardado.
18. Borrar proyecto como ejemplo de CRUD.
19. Ejecutar tests.

## 8. Componentes del simulador

Tipos disponibles en el motor:

- `api_gateway`: entrada principal del sistema.
- `load_balancer`: distribuye trafico.
- `app_service`: procesa requests.
- `database`: almacenamiento.
- `queue`: mensajeria asincronica.
- `cache`: existe en el motor y base, pero en el catalogo del MVP aparece desactivado en `schema.sql`.

Componentes visibles en la UI:

- API Gateway.
- Balanceador de carga.
- Servicio de aplicacion.
- Base de datos.
- Cola.

## 9. Reglas de conexion

Archivo central: `shared/simulator-core.js`.

Conexiones permitidas:

- Puerta de enlace API -> Balanceador de carga.
- Puerta de enlace API -> Servicio de aplicacion.
- Balanceador de carga -> Servicio de aplicacion.
- Servicio de aplicacion -> Servicio de aplicacion.
- Servicio de aplicacion -> Base de datos.
- Servicio de aplicacion -> Cola.
- Cola -> Servicio de aplicacion.

Validaciones:

- No permite conectar un componente consigo mismo.
- No permite conexiones duplicadas.
- No permite conexiones con nodos inexistentes.
- No permite ciclos para este MVP.
- No permite que la base de datos sea origen de trafico.

## 10. Que significa requests por segundo

Requests por segundo, o req/s, representa la carga entrante al sistema.

Ejemplo:

- 300 req/s: carga moderada.
- 900 req/s: carga alta.
- 1800 req/s: puede saturar algun componente.

El usuario cambia este valor con un slider. Cuando sube el trafico, cada componente recibe mas carga segun las conexiones. Si la carga supera la capacidad, aparecen cola, descartes, tasa de error y saturacion.

## 11. Logica de simulacion

Archivo: `shared/simulator-core.js`.

Entrada:

- Lista de nodos.
- Lista de conexiones.
- Trafico entrante.

Proceso:

1. Construye mapas de conexiones entrantes y salientes.
2. Detecta nodos fuente, priorizando API Gateway.
3. Divide el trafico inicial entre fuentes.
4. Corre 6 ciclos discretos.
5. En cada ciclo calcula:
- trafico recibido;
- capacidad total;
- throughput;
- exceso;
- cola retenida;
- trafico descartado;
- propagacion al siguiente nodo.
6. Al final calcula promedio por nodo.
7. Calcula latencia segun carga.
8. Calcula tasa de error.
9. Calcula costo mensual.
10. Determina cuello de botella.

Formula de capacidad:

```txt
capacidad total = instancias * capacidad por instancia
```

Estados posibles:

- `healthy`: estable.
- `warning`: advertencia.
- `high_load`: alta carga.
- `saturated`: saturado.
- `error`: con errores.

Cuello de botella:

- Es el nodo activo con mayor carga relativa.
- Si recibe mas trafico que su capacidad, la conclusion lo marca como problema principal.

## 12. Resultado de simulacion

El sistema muestra:

- Trafico total.
- Latencia promedio.
- Salida procesada.
- Tasa de error.
- Costo mensual estimado.
- Estado por componente.
- Cola.
- Error por nodo.
- Conclusion final.

Ejemplo de conclusion estable:

```txt
Con 300 req/s, la arquitectura funcionaria normalmente.
El primer cuello de botella probable sera la base de datos.
```

Ejemplo de conclusion con falla:

```txt
La arquitectura esta saturada.
El cuello de botella es el servicio de aplicacion o la base de datos.
Recomendacion: aumentar instancias.
```

## 13. Autenticacion y seguridad

Registro:

- Endpoint: `POST /api/auth/register`.
- Valida nombre, email y password.
- Password minimo: 6 caracteres.
- Guarda password hasheada.

Login:

- Endpoint: `POST /api/auth/login`.
- Verifica email y password.
- Devuelve una sesion con token.

Password:

- Se usa PBKDF2 con salt.
- No se guarda password plano.

Sesion:

- El backend genera token firmado con HMAC.
- El frontend guarda la sesion en `localStorage`.
- Las llamadas privadas mandan:

```txt
Authorization: Bearer <token>
```

Endpoints protegidos:

- `/api/projects`.
- `/api/simulations/run`.

Privacidad:

- Los proyectos se listan usando el usuario autenticado.
- Ya no dependen de pasar `userEmail` por query.

Variables sensibles:

- `.env` esta en `.gitignore`.
- Existe `backend/.env.example`.

Limitaciones:

- No hay expiracion de token.
- No hay refresh token.
- No hay permisos diferenciados en UI por rol.
- Para TP universitario es seguridad basica defendible.

## 14. Roles o perfiles

La base soporta roles:

- `admin`.
- `architect`.
- `viewer`.

Pero la UI actual no implementa pantallas ni permisos distintos por cada rol.

Perfiles reales que se pueden demostrar:

1. Usuario no autenticado:
- Solo ve login/registro.
- No puede entrar al simulador.
- No puede llamar proyectos o simulacion sin token.

2. Usuario autenticado:
- Puede usar el simulador.
- Puede guardar proyectos.
- Puede cargar proyectos.
- Puede borrar proyectos.
- Ve simulaciones activas en tiempo real.

3. Rol lector (`viewer`):
- Puede ver y cargar proyectos.
- No puede crear, editar, conectar, guardar, duplicar, limpiar ni borrar desde la UI.

4. Rol arquitecto (`architect`):
- Puede crear, editar, conectar, guardar y borrar proyectos.

Respuesta si preguntan por los dos perfiles:

```txt
Tenemos roles en la base y controles visibles en la interfaz.
El lector puede ver/cargar proyectos y el arquitecto puede crear, editar, conectar, guardar y borrar.
```

## 15. Base de datos

Archivo principal:

- `database/schema.sql`.

Seed demo:

- `database/seed-demo.sql`.
- Es opcional para desarrollar, pero recomendable para la defensa.
- Se ejecuta despues de `schema.sql`.
- Crea el usuario `demo@softwareestres.test` y tres escenarios listos: estable, saturado y cuello de botella en API.

Tablas principales:

`users`:

- Guarda usuarios.
- Campos: id, name, email, password_hash, role.

`projects`:

- Guarda proyectos del usuario.
- Relaciona con `users`.
- Guarda nombre, slug, descripcion, trafico y estado.

`component_categories`:

- Categorias del catalogo de componentes.

`component_types`:

- Tipos disponibles: puerta de enlace API, balanceador de carga, servicio de aplicacion, cache, base de datos y cola.
- Guarda defaults de capacidad, latencia, cola, costo.

`projects_nodes`:

- Nodos concretos de cada proyecto.
- Guarda posicion, instancia, capacidad, latencia, cola y costo.

`projects_edges`:

- Conexiones entre nodos.
- Relaciona origen y destino.

Tablas retiradas para simplificar el MVP:

- `objective_types`.
- `project_objectives`.
- `simulation_runs`.
- `simulation_node_metrics`.
- `scaling_recommendations`.

No las consulta ni escribe el backend actual. Se eliminaron del `schema.sql` y una base ya creada se puede limpiar con `database/migrations/003-drop-unused-mvp-tables.sql`.

Recrear base:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p softwareestres < database/seed-demo.sql
```

Usuario demo:

```txt
Email: demo@softwareestres.test
Password: demo1234
```

Proyectos demo:

- Demo estable.
- Demo falla por exceso.
- Demo cuello de botella API.

## 16. Backend

Tecnologia:

- Node.js.
- Express.
- MySQL.

Puerto:

- `3001` por defecto.

Comando:

```bash
cd backend
npm run dev
```

Endpoints principales:

Health:

```txt
GET /health
GET /health/db
GET /api/health
```

Auth:

```txt
POST /api/auth/register
POST /api/auth/login
```

Projects:

```txt
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

Simulation:

```txt
POST /api/simulations/run
```

Controllers:

- Reciben request.
- Validan ids basicos.
- Llaman services.
- Responden JSON.

Services:

- Auth: registro, login, hash, token.
- Projects: CRUD y persistencia de nodos/conexiones.
- Simulations: normaliza payload y llama motor.

Middlewares:

- CORS.
- Rate limit.
- Security headers.
- Auth.
- Not found.
- Error handler.

## 17. Frontend

Tecnologia:

- React.
- TypeScript.
- Vite.
- Tailwind.

Puerto:

- Normalmente `8080`.
- Si esta ocupado, Vite puede usar otro.

Comando:

```bash
npm run dev
```

Pantallas:

- Login/registro.
- Simulador principal.

Componentes clave:

- `LoginView`: formulario de auth.
- `AppController`: decide si mostrar login o simulador.
- `SimulatorDashboard`: pantalla principal del simulador.
- `PropertiesPanel`: edicion de parametros.
- `ConnectionsPanel`: manejo de conexiones.
- `SystemConclusion`: conclusion tecnica.

UX para demo:

- El panel izquierdo agrega componentes.
- El canvas muestra nodos y conexiones.
- El panel derecho edita parametros.
- Las metricas inferiores muestran resultado global.
- La conclusion inferior resume el estado tecnico.
- Los mensajes flotantes muestran errores o confirmaciones.

Validaciones visibles:

- Email/password invalidos.
- Guardar sin componentes.
- Conexion invalida.
- Conexion duplicada.
- Conexion que genera ciclo.

## 18. CRUD real

Create:

- Guardar proyecto nuevo.
- Endpoint: `POST /api/projects`.

Read:

- Listar proyectos guardados.
- Cargar proyecto.
- Endpoints: `GET /api/projects`, `GET /api/projects/:id`.

Update:

- Modificar proyecto existente y guardar.
- Endpoint: `PUT /api/projects/:id`.

Delete:

- Borrar proyecto.
- Endpoint: `DELETE /api/projects/:id`.

## 19. Tests

Comando unico:

```bash
npm test
```

Framework:

- Vitest.

Ubicacion:

- `tests/unitarios.test.ts`.
- `tests/simulator.test.ts`.
- `tests/integracion.test.ts`.

Que prueban:

`tests/unitarios.test.ts`:

- `calculateNodeCapacity`: capacidad total = instancias * capacidad.
- `statusFor`: estado segun carga y error.
- `calculateLatency`: latencia aumenta con la carga.
- `validateRegistrationPayload`: rechaza email invalido.

`tests/simulator.test.ts`:

- Calcula capacidad, carga, throughput y error.
- Detecta saturacion y perdida de trafico.
- Recomienda instancias minimas.
- Permite conexion valida puerta de enlace API -> balanceador de carga.
- Rechaza conexion invalida base de datos -> puerta de enlace API.

`tests/integracion.test.ts`:

- Simula flujo completo puerta de enlace -> aplicacion -> base de datos.
- Verifica que no haya perdidas con carga normal.
- Verifica throughput.
- Verifica costo total.
- Verifica que la base de datos sea cuello de botella.

Por que se hicieron:

- Para cubrir la logica central del negocio.
- Porque el simulador es la parte mas importante del proyecto.
- Para demostrar que las reglas no dependen solo de la UI.
- Para cumplir TP4: calidad y testing.

Patron Preparacion / Ejecucion / Verificacion:

- Preparacion: preparar nodos, trafico y datos.
- Ejecucion: ejecutar funcion o simulacion.
- Verificacion: verificar resultado esperado.

Comandos verificados:

```bash
npm test
npm run build
npm run lint
```

Estado verificado:

- Tests pasan.
- Build pasa.
- Lint pasa.
- Backend responde health.
- Base responde health/db.

## 20. Repaso TP1 a TP4

TP1 - Product Discovery:

- Se definio el problema: evaluar arquitecturas distribuidas bajo carga.
- Se definio MVP: login, simulador visual, componentes, conexiones, parametros y resultado.
- Se identifico valor educativo y tecnico.

TP2 - Setup tecnico:

- Se eligio React + TypeScript para frontend.
- Se eligio Node + Express para backend.
- Se eligio MySQL para persistencia relacional.
- Se organizo repo en frontend, backend, database, shared y tests.

TP3 - Diseno del sistema:

- Se modelo base de datos con usuarios, proyectos, nodos y conexiones.
- Se separo UI, API, servicios y motor de simulacion.
- Se reflejo MVC de forma adaptada a app web moderna.
- Se centralizo la logica de simulacion en `shared/simulator-core.js`.

TP4 - Calidad y testing:

- Se agregaron tests unitarios.
- Se agregaron tests de reglas de negocio.
- Se agrego test de integracion del motor.
- Se usa Vitest y comando unico `npm test`.

TP5 - Proyecto final:

- Sistema funcionando.
- Demo en vivo.
- Auth real.
- Datos reales en MySQL.
- CRUD real sobre proyectos.
- Validaciones visibles.
- Tests ejecutandose.
- README actualizado.
- SQL para recrear base.
- Archivo de defensa con explicacion tecnica.

## 21. Guion de demo de 10 minutos

Integrante 1 - Contexto y arquitectura:

1. Presentar problema.
2. Explicar MVP.
3. Explicar stack.
4. Mostrar estructura del repo.
5. Mostrar `shared/simulator-core.js`.
6. Explicar MVC aplicado.

Integrante 2 - Demo funcional:

1. Abrir `http://localhost:8080/`.
2. Mostrar login.
3. Entrar con usuario demo.
4. Cargar `Demo estable`.
5. Explicar componentes y conexiones.
6. Cambiar requests por segundo.
7. Mostrar resultado estable.
8. Cargar o forzar escenario de falla.
9. Mostrar cuello de botella.
10. Mostrar validacion de conexion invalida.
11. Guardar/cargar/borrar proyecto.

Integrante 3 - Backend, DB, seguridad y tests:

1. Mostrar endpoints.
2. Explicar token y password hash.
3. Mostrar `database/schema.sql`.
4. Explicar tablas principales.
5. Ejecutar `npm test`.
6. Explicar que prueba un test.
7. Cerrar con limitaciones y mejoras futuras.

## 22. Preguntas posibles del profesor

Pregunta: Que problema resuelve la app?

Respuesta: Permite simular una arquitectura distribuida bajo carga para detectar cuellos de botella, errores y recomendaciones antes de implementar infraestructura real.

Pregunta: Cual es el MVP?

Respuesta: Auth, simulador visual, componentes, conexiones, parametros, ejecucion de simulacion, resultado tecnico y CRUD de proyectos.

Pregunta: Por que eligieron este stack?

Respuesta: React + TypeScript facilita UI interactiva; Express permite API simple; MySQL modela bien usuarios, proyectos, nodos y conexiones; Vitest permite tests rapidos.

Pregunta: Donde esta la logica de simulacion?

Respuesta: En `shared/simulator-core.js`, compartida por frontend, backend y tests.

Pregunta: Como calculan el cuello de botella?

Respuesta: Calculamos la carga relativa de cada nodo activo. El cuello de botella es el nodo con mayor relacion entre trafico recibido y capacidad total.

Pregunta: Que significa requests por segundo?

Respuesta: Es la carga entrante al sistema. Si sube, cada componente recibe mas trabajo y puede saturarse.

Pregunta: Que pasa si un componente no soporta la carga?

Respuesta: Procesa hasta su capacidad, acumula cola hasta el limite y descarta exceso. Eso aumenta error y puede marcar estado saturated o error.

Pregunta: Que pasa si un usuario no esta logueado?

Respuesta: Ve login/registro. Los endpoints privados devuelven 401 sin token.

Pregunta: Que se guarda en la base?

Respuesta: Usuarios, proyectos, tipos de componentes, nodos, conexiones y tablas preparadas para resultados/metrica de simulacion.

Pregunta: Que test me podes explicar?

Respuesta: El test de integracion arma puerta de enlace -> aplicacion -> base de datos con 300 req/s, ejecuta `simulate`, verifica salida procesada, costo, ausencia de perdidas y que la base de datos sea cuello de botella.

Pregunta: Que cambiarian si lo volvieran a hacer?

Respuesta: Separaria repositories, agregaria permisos reales por rol, persistiria historial de simulaciones y agregaria tests HTTP de endpoints protegidos.

## 23. Comandos para preparar la defensa

Instalar dependencias:

```bash
npm install
cd backend
npm install
cd ..
```

Preparar base:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p softwareestres < database/seed-demo.sql
```

Configurar backend:

```bash
cp backend/.env.example backend/.env
```

Editar:

```txt
DB_USER=root
DB_PASSWORD=tu_password
SESSION_SECRET=clave_local_para_demo
```

Levantar backend:

```bash
cd backend
npm run dev
```

Levantar frontend:

```bash
npm run dev
```

Ejecutar tests:

```bash
npm test
```

Verificar build:

```bash
npm run build
```

Verificar lint:

```bash
npm run lint
```

Verificar API:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/health/db
```

URL de demo:

```txt
http://localhost:8080/
```

Usuario demo:

```txt
demo@softwareestres.test
demo1234
```

## 24. Checklist 10 minutos antes de presentar

- MySQL encendido.
- Base creada.
- Seed cargado.
- Backend corriendo en puerto 3001.
- Frontend corriendo en puerto 8080 o el que indique Vite.
- Login demo probado.
- Proyecto `Demo estable` carga bien.
- Proyecto de falla muestra cuello de botella.
- Guardar proyecto funciona.
- Borrar proyecto funciona.
- `npm test` pasa.
- Tener abierto el repo en el editor.
- Tener preparada una respuesta sobre roles.
- Tener preparada una respuesta sobre limitaciones.

## 25. Limitaciones y mejoras futuras

Limitaciones actuales:

- Roles existen en base, pero no hay UI diferenciada por rol.
- No se persiste historial de cada corrida de simulacion.
- No hay expiracion de token.
- No hay dashboard admin.
- No hay graficos historicos.

Mejoras futuras:

- Permisos reales para `viewer`, `architect` y `admin`.
- Repositories separados para acceso a datos.
- Persistir historial de resultados en una nueva tabla cuando el alcance lo requiera.
- Agregar graficos de evolucion.
- Exportar reporte de simulacion.
- Tests HTTP de auth y permisos.
- Mejorar modelo de trafico con probabilidades por conexion.
