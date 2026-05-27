import type { FinanceMetrics } from "../../analytics/rules.js";
import { buildRecommendations } from "../../analytics/rules.js";
import { AIRecommendation } from "../../models/mongo/AIRecommendation.js";

interface RecommendationInput {
  title: string;
  message: string;
  type: "saving" | "warning" | "habit" | "budget" | "goal";
  priority: "low" | "medium" | "high";
  source?: string;
}

export const recommendationService = {
  list(userId: string) {
    return AIRecommendation.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  create(userId: string, input: RecommendationInput) {
    return AIRecommendation.create({ ...input, userId });
  },

  async generate(userId: string, metrics: FinanceMetrics) {
    const drafts = buildRecommendations(metrics);
    return drafts.length
      ? AIRecommendation.insertMany(
          drafts.map((recommendation) => ({ ...recommendation, userId })),
        )
      : [];
  },

  markRead(userId: string, id: string) {
    return AIRecommendation.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true },
    );
  },
};
