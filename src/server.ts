import { app } from "./app.js";
import { connectMongo } from "./config/mongo.js";
import { env, validateServerEnv } from "./config/env.js";

async function startServer(): Promise<void> {
  validateServerEnv();
  await connectMongo();
  app.listen(env.port, () => {
    console.info(`Moneymate API escuchando en puerto ${env.port}`);
  });
}

void startServer().catch((error: unknown) => {
  console.error("No fue posible iniciar el servidor", error);
  process.exitCode = 1;
});
