# Moneymate Backend

API REST para la aplicación de finanzas personales Moneymate. Este avance
corresponde al módulo de **Persona 3: MongoDB, analytics, recomendaciones,
notificaciones, documentación y preparación de deploy**.

## Repositorios

- Backend: <https://github.com/gibarraa/moneymate-backend.git>
- Frontend: <https://github.com/gibarraa/moneymate-frontend.git>

## Estado actual

El repositorio oficial estaba vacío al iniciar este módulo. Esta rama aporta la
parte MongoDB de forma ejecutable e independiente, lista para integrarse cuando
la rama de Persona 2 agregue PostgreSQL, Prisma, auth y CRUD principales.

| Entregable Persona 3 | Estado |
| --- | --- |
| Conexión Mongoose configurable | Implementado |
| 4 modelos/colecciones MongoDB | Implementado |
| Endpoints de recomendaciones | Implementado |
| Endpoints de notificaciones | Implementado |
| Endpoints de logs | Implementado |
| Generación de patrones de gasto | Implementado |
| Reglas automáticas y pruebas | Implementado |
| README backend/frontend | Implementado |
| MongoDB Atlas real | Requiere cuenta/credenciales del equipo |
| Deploy frontend/backend | Frontend publicado; backend pendiente de Render |
| Usuario demo | Requiere auth y PostgreSQL de Persona 2 |

## Arquitectura

```text
Frontend React + TypeScript
          |
          | REST / JWT
          v
Express + TypeScript
   |              |
   |              +-- MongoDB / Mongoose
   |                    activity_logs
   |                    ai_recommendations
   |                    notifications
   |                    spending_patterns
   |
   +-- PostgreSQL / Prisma (se integra desde Persona 2)
         users, accounts, categories, transactions, budgets,
         savings_goals, recurring_payments, reports
```

## Tecnologías

- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT para proteger las rutas del módulo
- `node:test` para verificar reglas de recomendaciones

## Instalación

```bash
git checkout mongodb-docs-deploy
npm install
cp .env.example .env
npm run dev
```

Configura `.env` antes de iniciar:

```env
PORT=4000
JWT_SECRET="mismo_secreto_que_usara_auth"
MONGO_URI="mongodb+srv://usuario:password@cluster.mongodb.net/moneymate"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Nunca subir `.env` al repositorio.

## MongoDB

Crear en MongoDB Atlas una base `moneymate` y configurar `MONGO_URI`. Al
utilizar el API se crean estas cuatro colecciones:

| Colección | Propósito | Campos principales |
| --- | --- | --- |
| `activity_logs` | Auditoría de acciones | `userId`, `action`, `description`, `ipAddress`, `metadata` |
| `ai_recommendations` | Recomendaciones basadas en reglas | `userId`, `title`, `message`, `type`, `priority`, `read` |
| `notifications` | Alertas visibles para usuario | `userId`, `title`, `message`, `category`, `read` |
| `spending_patterns` | Análisis mensual por categoría | `userId`, `category`, `totalSpent`, `month`, `year`, `riskLevel` |

## Base de datos relacional

La rama de Persona 2 integrará PostgreSQL con Prisma para las ocho tablas
principales del producto:

1. `users`
2. `accounts`
3. `categories`
4. `transactions`
5. `budgets`
6. `savings_goals`
7. `recurring_payments`
8. `reports`

## Base de datos no relacional

MongoDB incorpora las cuatro colecciones implementadas por Persona 3:

1. `activity_logs`
2. `ai_recommendations`
3. `notifications`
4. `spending_patterns`

Al integrar ambas ramas, el sistema contará con las 12 tablas/colecciones
solicitadas.

## API del módulo MongoDB

Todas las rutas excepto `/api/health` requieren:

```http
Authorization: Bearer JWT_TOKEN
```

El JWT debe contener `userId`, `id` o `sub`. Cuando Persona 2 integre su
middleware, puede reemplazar `src/middleware/auth.middleware.ts` conservando
`req.userId`.

| Método | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/api/health` | Salud del servidor |
| `GET` | `/api/recommendations` | Listar recomendaciones |
| `POST` | `/api/recommendations` | Crear o generar recomendaciones |
| `PATCH` | `/api/recommendations/:id/read` | Marcar como leída |
| `GET` | `/api/notifications` | Listar notificaciones |
| `POST` | `/api/notifications` | Crear o generar notificaciones |
| `PATCH` | `/api/notifications/:id/read` | Marcar como leída |
| `GET` | `/api/activity-logs` | Consultar auditoría del usuario |
| `GET` | `/api/spending-patterns` | Consultar patrones |
| `POST` | `/api/spending-patterns/generate` | Analizar transacciones |

### Generar recomendaciones automáticas

```http
POST /api/recommendations
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "metrics": {
    "income": 8000,
    "expenses": 6500,
    "foodExpenses": 2500,
    "goalsCount": 0,
    "maximumBudgetUsedPercent": 92,
    "maximumGoalProgressPercent": 80,
    "previousMonthExpenses": 5000
  }
}
```

Reglas disponibles:

- Egresa más que sus ingresos: advertencia de prioridad alta.
- Comida representa más de 30% del gasto: recomendación de hábito.
- No existen metas: sugerencia para crear una.
- Un presupuesto supera 90%: advertencia de presupuesto.
- Existe ahorro positivo: sugerencia para aumentar la meta.

Las notificaciones automáticas cubren presupuesto superior al 100%, meta con
progreso de al menos 80% y egresos superiores en más de 20% al mes anterior.

### Generar patrones de gasto

```http
POST /api/spending-patterns/generate
Content-Type: application/json
Authorization: Bearer JWT_TOKEN

{
  "month": 5,
  "year": 2026,
  "transactions": [
    { "category": "Comida", "amount": 650, "type": "expense" },
    { "category": "Transporte", "amount": 250, "type": "expense" }
  ]
}
```

## Integración con Persona 2

El archivo `src/integrations/analyticsEvents.ts` expone las funciones que los
controladores PostgreSQL deberán llamar después de una operación exitosa:

| Evento backend principal | Función |
| --- | --- |
| Login correcto | `logUserLogin` |
| Crear transacción | `logTransactionCreated` |
| Eliminar transacción | `logTransactionDeleted` |
| Crear presupuesto | `logBudgetCreated` |
| Crear meta | `logGoalCreated` |
| Generar reporte | `logReportGenerated` |
| Calcular dashboard mensual | `generateMonthlyInsights` |

## Comandos

```bash
npm run dev       # Desarrollo
npm run build     # Compilar TypeScript
npm test          # Probar reglas financieras
npm start         # Ejecutar dist/server.js
```

## Deploy pendiente de integración

Backend en Render:

1. Importar `moneymate-backend` o usar el archivo `render.yaml` incluido.
2. Usar build command `npm install && npm run build && npx prisma generate`
   una vez que Prisma esté integrado.
3. Usar start command `npm start`.
4. Agregar `DATABASE_URL`, `MONGO_URI`, `JWT_SECRET` y `PORT`.
5. Verificar `https://URL_BACKEND/api/health`.

Frontend en Vercel:

1. Frontend publicado en <https://moneymate-frontend-lake.vercel.app/login>.
2. Configurar `VITE_API_URL=https://URL_BACKEND/api`.
3. Usar output directory `dist`.

## Links finales y acceso demo

- Frontend publicado: <https://moneymate-frontend-lake.vercel.app/login>
- Link de API backend: `PENDIENTE_DE_DEPLOY`
- Usuario demo: `PENDIENTE` hasta integrar autenticación PostgreSQL
