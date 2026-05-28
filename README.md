# Moneymate Backend

API REST de Moneymate, una aplicacion web para gestionar ingresos, egresos, cuentas, presupuestos, metas de ahorro, reportes y analitica financiera.

## Links

- Repositorio backend: https://github.com/gibarraa/moneymate-backend.git
- API publica actual: https://moneymate-backend-production.up.railway.app
- Health check: https://moneymate-backend-production.up.railway.app/api/health

## Stack

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- MongoDB + Mongoose
- JWT
- bcryptjs
- dotenv
- cors

## Arquitectura

El frontend consume esta API por HTTP. PostgreSQL guarda los datos relacionales principales del usuario y MongoDB guarda datos de soporte como logs, recomendaciones, notificaciones y patrones de gasto.

## Base relacional PostgreSQL

Tablas:

- users
- accounts
- categories
- transactions
- budgets
- savings_goals
- recurring_payments
- reports

## Base no relacional MongoDB

Colecciones:

- activity_logs
- ai_recommendations
- notifications
- spending_patterns

## Variables de entorno

Crear un archivo `.env` local o configurar estas variables en produccion:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
MONGO_URI="mongodb+srv://USER:PASSWORD@CLUSTER/moneymate"
JWT_SECRET="change_this_secret"
PORT=4000
```

`DATABASE_URL` debe ser PostgreSQL. Si apunta a SQLite o esta vacia, Prisma no podra aplicar migraciones ni usar los endpoints principales.

## Comandos

```bash
npm install
npm run build
npm start
```

En produccion, `npm start` intenta ejecutar:

```bash
npx prisma migrate deploy
node dist/server.js
```

Si `DATABASE_URL` no es una URL PostgreSQL valida, la API puede levantar para health checks, pero los endpoints que usan Prisma fallaran hasta corregir la variable y ejecutar:

```bash
npx prisma migrate deploy
```

Para cargar categorias iniciales:

```bash
npx prisma db seed
```

## Endpoints principales

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/accounts`
- `POST /api/accounts`
- `GET /api/categories`
- `GET /api/transactions`
- `POST /api/transactions`
- `DELETE /api/transactions/:id`
- `GET /api/budgets`
- `POST /api/budgets`
- `GET /api/goals`
- `POST /api/goals`
- `GET /api/dashboard`
- `GET /api/reports`
- `POST /api/reports`
- `GET /api/recommendations`
- `POST /api/recommendations/generate`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `GET /api/activity-logs`
- `GET /api/spending-patterns`

Los endpoints protegidos requieren:

```http
Authorization: Bearer TOKEN
```

## Usuario demo

Despues de desplegar y correr migraciones, crear un usuario desde:

```http
POST /api/auth/register
```

Body sugerido:

```json
{
  "name": "Demo User",
  "email": "demo@moneymate.com",
  "password": "123456"
}
```

## Deploy

### Render

- Runtime: Node
- Build command: `npm install && npx prisma generate && npm run build`
- Start command: `npm start`
- Variables requeridas: `DATABASE_URL`, `MONGO_URI`, `JWT_SECRET`, `PORT`

### Railway

Usar el mismo flujo:

- Build: `npm install && npx prisma generate && npm run build`
- Start: `npm start`
- Variables requeridas: `DATABASE_URL`, `MONGO_URI`, `JWT_SECRET`, `PORT`

## Verificacion de produccion

```bash
npm run build
node scripts/prod_tests.js
```

Para probar otra URL:

```bash
$env:API_URL="https://tu-api.com"; node scripts/prod_tests.js
```
