import { Schema, model } from "mongoose";

const spendingPatternSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, trim: true },
    totalSpent: { type: Number, required: true, min: 0 },
    transactionCount: { type: Number, required: true, min: 0 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },
    pattern: { type: String, required: true, trim: true },
    riskLevel: { type: String, required: true, enum: ["low", "medium", "high"] },
  },
  { timestamps: true, collection: "spending_patterns" },
);

spendingPatternSchema.index(
  { userId: 1, category: 1, month: 1, year: 1 },
  { unique: true },
);

export const SpendingPattern = model("SpendingPattern", spendingPatternSchema);
