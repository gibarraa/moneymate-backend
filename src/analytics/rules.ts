export interface FinanceMetrics {
  income: number;
  expenses: number;
  foodExpenses?: number;
  goalsCount?: number;
  maximumBudgetUsedPercent?: number;
  maximumGoalProgressPercent?: number;
  previousMonthExpenses?: number;
}

export interface RecommendationDraft {
  title: string;
  message: string;
  type: "saving" | "warning" | "habit" | "budget" | "goal";
  priority: "low" | "medium" | "high";
  source: "rules-engine";
}

export interface NotificationDraft {
  title: string;
  message: string;
  category: string;
}

export function buildRecommendations(
  metrics: FinanceMetrics,
): RecommendationDraft[] {
  const items: RecommendationDraft[] = [];
  const foodShare =
    metrics.expenses > 0 ? (metrics.foodExpenses ?? 0) / metrics.expenses : 0;

  if (metrics.expenses > metrics.income) {
    items.push({
      title: "Gastos mayores a ingresos",
      message: "Este mes gastaste mas de lo que ingresaste.",
      type: "warning",
      priority: "high",
      source: "rules-engine",
    });
  }

  if (foodShare > 0.3) {
    items.push({
      title: "Gasto elevado en comida",
      message: "Tu gasto en comida representa una parte alta de tus egresos.",
      type: "habit",
      priority: "medium",
      source: "rules-engine",
    });
  }

  if ((metrics.goalsCount ?? 0) === 0) {
    items.push({
      title: "Define una meta",
      message: "Crea una meta de ahorro para mejorar tu control financiero.",
      type: "goal",
      priority: "low",
      source: "rules-engine",
    });
  }

  if ((metrics.maximumBudgetUsedPercent ?? 0) > 90) {
    items.push({
      title: "Presupuesto por agotarse",
      message: "Estas cerca de superar tu presupuesto.",
      type: "budget",
      priority: "high",
      source: "rules-engine",
    });
  }

  if (metrics.income > metrics.expenses) {
    items.push({
      title: "Ahorro disponible",
      message: "Vas bien, podrias aumentar tu meta de ahorro.",
      type: "saving",
      priority: "low",
      source: "rules-engine",
    });
  }

  return items;
}

export function buildNotifications(metrics: FinanceMetrics): NotificationDraft[] {
  const items: NotificationDraft[] = [];
  const previousExpenses = metrics.previousMonthExpenses ?? 0;

  if ((metrics.maximumBudgetUsedPercent ?? 0) > 100) {
    items.push({
      title: "Presupuesto superado",
      message: "Has superado tu presupuesto de esta categoria.",
      category: "budget",
    });
  }

  if ((metrics.maximumGoalProgressPercent ?? 0) >= 80) {
    items.push({
      title: "Meta cerca de completarse",
      message: "Estas cerca de completar tu meta de ahorro.",
      category: "goal",
    });
  }

  if (
    previousExpenses > 0 &&
    metrics.expenses > previousExpenses * 1.2
  ) {
    items.push({
      title: "Gastos altos",
      message: "Tus egresos estan aumentando este mes.",
      category: "spending",
    });
  }

  return items;
}

export function parseFinanceMetrics(value: unknown): FinanceMetrics | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const metrics = value as Record<string, unknown>;
  if (!isNonNegativeNumber(metrics.income) || !isNonNegativeNumber(metrics.expenses)) {
    return null;
  }

  const optionalKeys = [
    "foodExpenses",
    "goalsCount",
    "maximumBudgetUsedPercent",
    "maximumGoalProgressPercent",
    "previousMonthExpenses",
  ] as const;

  for (const key of optionalKeys) {
    if (metrics[key] !== undefined && !isNonNegativeNumber(metrics[key])) {
      return null;
    }
  }

  return metrics as unknown as FinanceMetrics;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
