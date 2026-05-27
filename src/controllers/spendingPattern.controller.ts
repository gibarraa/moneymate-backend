import type { Request, Response } from "express";
import { activityLogService } from "../services/mongo/activityLog.service.js";
import {
  spendingPatternService,
  type ExpenseTransaction,
} from "../services/mongo/spendingPattern.service.js";

export async function getSpendingPatterns(req: Request, res: Response) {
  const patterns = await spendingPatternService.list(req.userId!);
  res.json(patterns);
}

export async function generateSpendingPatterns(req: Request, res: Response) {
  const { transactions, month, year } = req.body as {
    transactions?: ExpenseTransaction[];
    month?: number;
    year?: number;
  };

  if (!Array.isArray(transactions) || !month || !year) {
    res.status(400).json({ message: "Se requieren transacciones, mes y anio" });
    return;
  }

  const validPeriod =
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    Number.isInteger(year) &&
    year >= 2000;
  const validTransactions = transactions.every(
    (item) =>
      typeof item.category === "string" &&
      item.category.trim().length > 0 &&
      typeof item.amount === "number" &&
      Number.isFinite(item.amount) &&
      item.amount >= 0 &&
      (item.type === "income" || item.type === "expense"),
  );

  if (!validPeriod || !validTransactions) {
    res.status(400).json({ message: "Datos de patrones invalidos" });
    return;
  }

  const patterns = await spendingPatternService.generate({
    userId: req.userId!,
    transactions,
    month,
    year,
  });
  await activityLogService.record({
    userId: req.userId!,
    action: "SPENDING_PATTERNS_GENERATED",
    description: "Se analizaron los patrones de gasto.",
    metadata: { count: patterns.length, month, year },
  });
  res.status(201).json(patterns);
}
