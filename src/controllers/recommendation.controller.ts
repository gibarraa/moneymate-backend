import type { Request, Response } from "express";
import { parseFinanceMetrics } from "../analytics/rules.js";
import { activityLogService } from "../services/mongo/activityLog.service.js";
import { recommendationService } from "../services/mongo/recommendation.service.js";

export async function getRecommendations(req: Request, res: Response) {
  const recommendations = await recommendationService.list(req.userId!);
  res.json(recommendations);
}

export async function createRecommendations(req: Request, res: Response) {
  if (req.body.metrics) {
    const metrics = parseFinanceMetrics(req.body.metrics);
    if (!metrics) {
      res.status(400).json({ message: "Metricas financieras invalidas" });
      return;
    }

    const recommendations = await recommendationService.generate(
      req.userId!,
      metrics,
    );
    await activityLogService.record({
      userId: req.userId!,
      action: "RECOMMENDATIONS_GENERATED",
      description: "Se generaron recomendaciones financieras.",
      metadata: { count: recommendations.length },
    });
    res.status(201).json(recommendations);
    return;
  }

  const { title, message, type, priority, source } = req.body;
  if (!title || !message || !type || !priority) {
    res.status(400).json({ message: "Faltan datos de la recomendacion" });
    return;
  }

  const recommendation = await recommendationService.create(req.userId!, {
    title,
    message,
    type,
    priority,
    source,
  });
  res.status(201).json(recommendation);
}

export async function markRecommendationRead(req: Request, res: Response) {
  const id = req.params.id;
  if (typeof id !== "string") {
    res.status(400).json({ message: "Identificador invalido" });
    return;
  }

  const recommendation = await recommendationService.markRead(
    req.userId!,
    id,
  );

  if (!recommendation) {
    res.status(404).json({ message: "Recomendacion no encontrada" });
    return;
  }

  res.json(recommendation);
}
