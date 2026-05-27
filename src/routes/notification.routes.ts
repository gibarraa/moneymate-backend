import { Router } from "express";
import {
  createNotifications,
  getNotifications,
  markNotificationRead,
} from "../controllers/notification.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const notificationRouter = Router();

notificationRouter.get("/", asyncHandler(getNotifications));
notificationRouter.post("/", asyncHandler(createNotifications));
notificationRouter.patch("/:id/read", asyncHandler(markNotificationRead));
