import { ActivityLog } from "../../models/mongo/ActivityLog.js";

interface RecordActivityInput {
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export const activityLogService = {
  record(input: RecordActivityInput) {
    return ActivityLog.create(input);
  },

  list(userId: string) {
    return ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(100).lean();
  },
};
