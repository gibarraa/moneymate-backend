import { Schema, model } from "mongoose";

export const recommendationTypes = [
  "saving",
  "warning",
  "habit",
  "budget",
  "goal",
] as const;
export const recommendationPriorities = ["low", "medium", "high"] as const;

const aiRecommendationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: recommendationTypes },
    priority: { type: String, required: true, enum: recommendationPriorities },
    source: { type: String, default: "rules-engine", trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "ai_recommendations" },
);

aiRecommendationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const AIRecommendation = model(
  "AIRecommendation",
  aiRecommendationSchema,
);
