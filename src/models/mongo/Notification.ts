import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "notifications" },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = model("Notification", notificationSchema);
