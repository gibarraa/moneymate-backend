import dotenv from "dotenv";

dotenv.config();

export const env = {
	port: process.env.PORT || "4000",
	databaseUrl: process.env.DATABASE_URL || "",
	mongoUri: process.env.MONGO_URI || "",
	jwtSecret: process.env.JWT_SECRET || "default_secret",
};
