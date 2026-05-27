import cors from "cors";
import express from "express";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { activityLogRouter } from "./routes/activityLog.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { recommendationRouter } from "./routes/recommendation.routes.js";
import { spendingPatternRouter } from "./routes/spendingPattern.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Moneymate API running" });
});

app.use("/api/recommendations", authMiddleware, recommendationRouter);
app.use("/api/notifications", authMiddleware, notificationRouter);
app.use("/api/activity-logs", authMiddleware, activityLogRouter);
app.use("/api/spending-patterns", authMiddleware, spendingPatternRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
