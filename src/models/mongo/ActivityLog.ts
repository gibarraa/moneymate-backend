import { Schema, model } from "mongoose";

const activityLogSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    ipAddress: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, collection: "activity_logs" },
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

export const ActivityLog = model("ActivityLog", activityLogSchema);
