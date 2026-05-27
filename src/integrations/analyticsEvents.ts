import type { FinanceMetrics } from "../analytics/rules.js";
import { activityLogService } from "../services/mongo/activityLog.service.js";
import { notificationService } from "../services/mongo/notification.service.js";
import { recommendationService } from "../services/mongo/recommendation.service.js";

interface EventContext {
  userId: string;
  description: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export async function logUserLogin(context: EventContext): Promise<void> {
  await activityLogService.record({ ...context, action: "USER_LOGIN" });
}

export async function logTransactionCreated(context: EventContext): Promise<void> {
  await activityLogService.record({ ...context, action: "TRANSACTION_CREATED" });
}

export async function logTransactionDeleted(context: EventContext): Promise<void> {
  await activityLogService.record({ ...context, action: "TRANSACTION_DELETED" });
}

export async function logBudgetCreated(context: EventContext): Promise<void> {
  await activityLogService.record({ ...context, action: "BUDGET_CREATED" });
}

export async function logGoalCreated(context: EventContext): Promise<void> {
  await activityLogService.record({ ...context, action: "GOAL_CREATED" });
}

export async function logReportGenerated(context: EventContext): Promise<void> {
  await activityLogService.record({ ...context, action: "REPORT_GENERATED" });
}

export async function generateMonthlyInsights(
  userId: string,
  metrics: FinanceMetrics,
): Promise<void> {
  await Promise.all([
    recommendationService.generate(userId, metrics),
    notificationService.generate(userId, metrics),
  ]);
}
