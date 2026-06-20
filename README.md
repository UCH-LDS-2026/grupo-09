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

## Instalación rápida

Estos son los pasos para dejar el proyecto corriendo desde cero en una Mac. Para la defensa se debe usar la rama `segundamain`.

### Comandos rápidos

```bash
brew install git node mysql
brew services start mysql

git clone https://github.com/UCH-LDS-2026/grupo-09.git
cd grupo-09
git checkout segundamain
git pull origin segundamain

npm install
cd backend
npm install
cd ..

cp backend/.env.example backend/.env
mysql -u root -p < database/schema.sql
```

Para levantar el backend:

```bash
cd backend
npm run dev
```

Para levantar el frontend, en otra terminal desde la carpeta `grupo-09`:

```bash
npm run dev
```

Abrir:

```txt
http://localhost:8080
```

### Paso a paso

1. Instalar Homebrew si no está instalado:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Instalar Git, Node y MySQL:

   ```bash
   brew install git node mysql
   ```

3. Levantar MySQL:

   ```bash
   brew services start mysql
   ```

4. Clonar el repositorio:

   ```bash
   git clone https://github.com/UCH-LDS-2026/grupo-09.git
   ```

5. Entrar al proyecto:

   ```bash
   cd grupo-09
   ```

6. Cambiar a la rama correcta:

   ```bash
   git checkout segundamain
   git pull origin segundamain
   ```

7. Instalar dependencias del frontend:

   ```bash
   npm install
   ```

8. Instalar dependencias del backend:

   ```bash
   cd backend
   npm install
   cd ..
   ```

9. Crear archivo `.env` del backend:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Si MySQL tiene contraseña, completar `DB_PASSWORD` dentro de `backend/.env`.

   Valores esperados para desarrollo local:

   ```txt
   NODE_ENV=development
   API_PORT=3001
   CORS_ORIGIN=http://localhost:8080
   SESSION_SECRET=clave_larga_para_desarrollo
   SESSION_COOKIE_NAME=softwareestres_session
   SESSION_COOKIE_SECURE=false
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=softwareestres
   DB_USER=root
   DB_PASSWORD=
   ```

10. Crear la base de datos:

    ```bash
    mysql -u root -p < database/schema.sql
    ```

    Si MySQL no tiene contraseña:

    ```bash
    mysql -u root < database/schema.sql
    ```

11. Opcional: cargar datos de prueba:

    ```bash
    mysql -u root -p softwareestres < database/seed-demo.sql
    ```

    Si ya existe una base creada antes de habilitar cache, aplicar la migracion:

    ```bash
    mysql -u root -p softwareestres < database/migrations/005-enable-cache-component.sql
    ```

12. Levantar backend en una terminal:

    ```bash
    cd backend
    npm run dev
    ```

13. Levantar frontend en otra terminal, desde la carpeta `grupo-09`:

    ```bash
    npm run dev
    ```

14. Abrir el sistema:

    ```txt
    http://localhost:8080
    ```

15. Verificar backend:

    ```txt
    http://localhost:3001/health
    ```

16. Ejecutar tests desde la carpeta `grupo-09`:

    ```bash
    npm test
    ```

## Base de datos

Tablas actuales:

- `usuarios`: guarda las cuentas del sistema. Incluye nombre, email, contraseña hasheada y rol (`administrador`, `arquitecto` o `lector`).
- `proyectos`: guarda cada arquitectura creada por un usuario. Incluye nombre, descripcion, slug, trafico entrante y estado de ejecucion.
- `categorias_componentes`: agrupa visualmente los tipos de componentes del simulador, por ejemplo trafico, computo, mensajeria y almacenamiento.
- `tipos_componentes`: define el catalogo de nodos disponibles, como puerta de enlace API, balanceador, servicio, cache, base de datos y cola. Tambien guarda valores por defecto de capacidad, latencia, cola y costo.
- `nodos_proyectos`: guarda los componentes colocados dentro de cada proyecto, con posicion, instancias, capacidad, latencia, cola, timeout y costo.
- `conexiones_proyectos`: guarda las conexiones entre nodos de un proyecto. Permite reconstruir el grafo de la arquitectura y ejecutar la simulacion.

Relaciones principales:

- Un `usuario` tiene muchos `proyectos`.
- Un `proyecto` tiene muchos `nodos_proyectos`.
- Un `proyecto` tiene muchas `conexiones_proyectos`.
- Cada nodo pertenece a un `tipo_componente`.
- Las conexiones apuntan a un nodo origen y a un nodo destino.

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
npm run security:audit
```

Tests actuales:

- `tests/unitarios.test.ts`: prueba funciones aisladas del simulador, autenticacion y middlewares de seguridad. Verifica capacidad total de nodos, estados por carga, calculo de latencia, metricas de trafico, recomendaciones de instancias, reglas de conexion, validacion de email/contrasena, limites de dominio, CSRF y rate limit de login.
- `tests/integracion.test.ts`: prueba el motor completo de simulacion con arquitecturas puerta de enlace API -> servicio de aplicacion -> base de datos y con cache de punta a punta. Verifica ciclos, throughput, errores, costo, nodos sin perdida, reduccion de trafico por cache y deteccion de cuello de botella.

Estos tests son importantes porque validan la logica central del proyecto sin depender de la interfaz visual. Si pasan, sabemos que las reglas principales del simulador siguen funcionando aunque se modifique el frontend o el backend.

Total actual:

```txt
2 archivos
19 tests
```

## Seguridad Aplicada

- Contraseñas con PBKDF2 + salt y minimo de 10 caracteres.
- Sesion firmada con HMAC en cookie `HttpOnly`, `SameSite=Lax` y `Secure` configurable para produccion.
- Token CSRF obligatorio en requests con cambios cuando la autenticacion entra por cookie.
- Endpoints privados protegidos por middleware de autenticacion y autorizacion por rol.
- Rate limit general en `/api` y rate limit especifico para login por IP + email.
- Headers de seguridad: CSP, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` y CORP.
- Configuracion de produccion falla al iniciar si falta `SESSION_SECRET`, `CORS_ORIGIN`, password de DB o si `DB_USER=root`.
- Errores 500 sin stack trace en respuesta HTTP.
- Variables sensibles fuera del repositorio; `.env.example` solo contiene placeholders.
- Auditoria de dependencias con `npm run security:audit`.
- CI en GitHub Actions con `npm ci`, lint, tests, build y auditoria de dependencias de produccion.
- Limites de dominio para simulacion/proyectos: maximo de nodos, conexiones, trafico y valores numericos.

## Checklist de produccion

Antes de desplegar:

1. Definir `NODE_ENV=production`.
2. Usar un `SESSION_SECRET` privado de al menos 32 caracteres.
3. Configurar `CORS_ORIGIN` con origenes exactos, sin `*`.
4. Usar usuario MySQL dedicado, no `root`, con password obligatorio.
5. Definir `SESSION_COOKIE_SECURE=true` si la API corre detras de HTTPS.
6. Ejecutar `npm run security:audit`, `npm test`, `npm run lint` y `npm run build`.
7. Aplicar migraciones SQL pendientes antes de levantar la API.

## Notas

El motor interno de simulación usa nombres técnicos como `nodes`, `edges` y `kind` porque es un módulo compartido. El contrato HTTP, backend y base de datos usan nombres en español.
