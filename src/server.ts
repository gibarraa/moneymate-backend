import { app } from "./app";
import { env } from "./config/env";
import { connectMongo } from "./config/mongo";

const startServer = async () => {
	await connectMongo();

	app.listen(env.port, () => {
		console.log(`Moneymate API running on port ${env.port}`);
	});
};

startServer();
