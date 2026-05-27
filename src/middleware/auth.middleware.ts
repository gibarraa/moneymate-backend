import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface TokenPayload extends jwt.JwtPayload {
  userId?: string;
  id?: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.header("Authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : undefined;

  if (!token || !env.jwtSecret) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const userId = payload.userId ?? payload.id ?? payload.sub;

    if (!userId) {
      res.status(401).json({ message: "Token sin usuario" });
      return;
    }

    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ message: "Token invalido" });
  }
}
