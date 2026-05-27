import type { Request, Response } from "express";
import { parseFinanceMetrics } from "../analytics/rules.js";
import { notificationService } from "../services/mongo/notification.service.js";

export async function getNotifications(req: Request, res: Response) {
  const notifications = await notificationService.list(req.userId!);
  res.json(notifications);
}

export async function createNotifications(req: Request, res: Response) {
  if (req.body.metrics) {
    const metrics = parseFinanceMetrics(req.body.metrics);
    if (!metrics) {
      res.status(400).json({ message: "Metricas financieras invalidas" });
      return;
    }

    const notifications = await notificationService.generate(
      req.userId!,
      metrics,
    );
    res.status(201).json(notifications);
    return;
  }

  const { title, message, category } = req.body;
  if (!title || !message || !category) {
    res.status(400).json({ message: "Faltan datos de la notificacion" });
    return;
  }

  const notification = await notificationService.create(req.userId!, {
    title,
    message,
    category,
  });
  res.status(201).json(notification);
}

export async function markNotificationRead(req: Request, res: Response) {
  const id = req.params.id;
  if (typeof id !== "string") {
    res.status(400).json({ message: "Identificador invalido" });
    return;
  }

  const notification = await notificationService.markRead(
    req.userId!,
    id,
  );

  if (!notification) {
    res.status(404).json({ message: "Notificacion no encontrada" });
    return;
  }

  res.json(notification);
}
