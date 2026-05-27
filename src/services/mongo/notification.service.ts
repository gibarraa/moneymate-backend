import type { FinanceMetrics } from "../../analytics/rules.js";
import { buildNotifications } from "../../analytics/rules.js";
import { Notification } from "../../models/mongo/Notification.js";

interface NotificationInput {
  title: string;
  message: string;
  category: string;
}

export const notificationService = {
  list(userId: string) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  create(userId: string, input: NotificationInput) {
    return Notification.create({ ...input, userId });
  },

  async generate(userId: string, metrics: FinanceMetrics) {
    const drafts = buildNotifications(metrics);
    return drafts.length
      ? Notification.insertMany(
          drafts.map((notification) => ({ ...notification, userId })),
        )
      : [];
  },

  markRead(userId: string, id: string) {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true },
    );
  },
};
