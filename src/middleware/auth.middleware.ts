import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

interface JwtPayload {
	userId: string;
}

export interface AuthRequest extends Request {
	userId?: string;
}

export const authMiddleware = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		const token = authHeader.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		const decoded = jwt.verify(token, env.jwtSecret) as unknown as JwtPayload;

		req.userId = decoded.userId;

		next();
	} catch (error) {
		return res.status(401).json({
			message: "Token inválido o expirado",
		});
	}
};
