# Moneymate Backend

Backend de MoneyMate, una aplicación web de gestión financiera personal que permite registrar ingresos, egresos, cuentas, presupuestos, metas de ahorro y reportes mensuales.

## Tecnologías utilizadas

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- bcryptjs
- dotenv
- cors

## Arquitectura

El backend está construido como una API REST usando Express y TypeScript.

La base de datos principal es PostgreSQL, administrada con Prisma ORM. Esta base almacena la información relacional del sistema, como usuarios, cuentas, categorías, transacciones, presupuestos, metas de ahorro, pagos recurrentes y reportes.

## Estructura de carpetas

```txt
src/
├── config/
│   ├── env.ts
│   ├── prisma.ts
│   └── mongo.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── account.controller.ts
│   ├── transaction.controller.ts
│   ├── budget.controller.ts
│   ├── goal.controller.ts
│   ├── dashboard.controller.ts
│   └── report.controller.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── routes/
│   ├── auth.routes.ts
│   ├── account.routes.ts
│   ├── transaction.routes.ts
│   ├── budget.routes.ts
│   ├── goal.routes.ts
│   ├── dashboard.routes.ts
│   └── report.routes.ts
├── utils/
│   └── generateToken.ts
├── app.ts
└── server.ts
```

## Base de datos relacional

PostgreSQL contiene 8 tablas principales:

- users
- accounts
- categories
- transactions
- budgets
- savings_goals
- recurring_payments
- reports

## Despliegue con Docker

Si quieres correr la API en un contenedor:

```bash
docker build -t moneymate-backend .
docker run -p 4000:4000 --env-file .env moneymate-backend
```

La API expone por defecto el puerto `4000` y usa `npm start` en producción.