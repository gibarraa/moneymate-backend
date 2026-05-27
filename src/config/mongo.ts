import mongoose from "mongoose";
import { env } from "./env";

export const connectMongo = async () => {
	try {
		if (!env.mongoUri) {
			console.log("MongoDB URI no configurada. Se omitió conexión a MongoDB.");
			return;
		}

		await mongoose.connect(env.mongoUri);
		console.log("MongoDB conectado correctamente");
	} catch (error) {
		console.error("Error al conectar MongoDB:", error);
	}
};
