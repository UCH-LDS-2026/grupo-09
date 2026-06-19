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

- `usuarios`: cuentas, email, contraseña hasheada y rol.
- `proyectos`: proyectos guardados por usuario.
- `categorias_componentes`: agrupaciones del catálogo.
- `tipos_componentes`: tipos de nodos disponibles y valores predeterminados.
- `nodos_proyectos`: nodos colocados en el canvas.
- `conexiones_proyectos`: conexiones entre nodos.

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
```

Tests actuales:

- `tests/unitarios.test.ts`: funciones aisladas, reglas de negocio y validación de auth.
- `tests/integracion.test.ts`: simulación completa de una arquitectura puerta de enlace -> aplicación -> base de datos.

Total actual:

```txt
2 archivos
10 tests
```

## Seguridad Aplicada

- Contraseñas con PBKDF2 + salt.
- Tokens firmados con HMAC.
- Tokens con expiración.
- Endpoints privados protegidos por middleware de autenticación.
- Rate limit básico en `/api`.
- Headers de seguridad básicos.
- Errores 500 sin stack trace en respuesta HTTP.
- Variables sensibles fuera del repositorio.

## Notas

El motor interno de simulación usa nombres técnicos como `nodes`, `edges` y `kind` porque es un módulo compartido. El contrato HTTP, backend y base de datos usan nombres en español.
