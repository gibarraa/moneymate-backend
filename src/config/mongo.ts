import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectMongo(): Promise<void> {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI no esta configurada");
  }

  await mongoose.connect(env.mongoUri);
  console.info("MongoDB conectado");
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
