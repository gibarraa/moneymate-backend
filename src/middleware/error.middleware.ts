import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
};

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (
    error instanceof Error &&
    (error.name === "ValidationError" || error.name === "CastError")
  ) {
    res.status(400).json({ message: "Datos invalidos" });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Error interno del servidor" });
};
