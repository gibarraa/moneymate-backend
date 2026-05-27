import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildNotifications,
  buildRecommendations,
  parseFinanceMetrics,
} from "./rules.js";

describe("reglas financieras", () => {
  it("genera alertas cuando egresos y presupuesto son altos", () => {
    const metrics = {
      income: 1000,
      expenses: 1400,
      foodExpenses: 500,
      goalsCount: 0,
      maximumBudgetUsedPercent: 105,
      maximumGoalProgressPercent: 80,
      previousMonthExpenses: 1000,
    };

    const recommendations = buildRecommendations(metrics);
    const notifications = buildNotifications(metrics);

    assert.ok(recommendations.some((item) => item.type === "warning"));
    assert.ok(recommendations.some((item) => item.type === "budget"));
    assert.equal(notifications.length, 3);
  });

  it("sugiere aumentar ahorro cuando el balance es positivo", () => {
    const recommendations = buildRecommendations({
      income: 3000,
      expenses: 1200,
      goalsCount: 1,
    });

    assert.ok(recommendations.some((item) => item.type === "saving"));
  });

  it("rechaza metricas invalidas antes de generar datos", () => {
    assert.equal(parseFinanceMetrics({ income: "3000", expenses: 1200 }), null);
    assert.deepEqual(parseFinanceMetrics({ income: 3000, expenses: 1200 }), {
      income: 3000,
      expenses: 1200,
    });
  });
});
