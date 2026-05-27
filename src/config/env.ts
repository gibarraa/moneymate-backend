import "dotenv/config";

const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT debe ser un numero entero positivo");
}

export const env = {
  port,
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongoUri: process.env.MONGO_URI ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
};

export function validateServerEnv(): void {
  const missing = [
    !env.mongoUri && "MONGO_URI",
    !env.jwtSecret && "JWT_SECRET",
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Variables de entorno requeridas: ${missing.join(", ")}`);
  }
}
