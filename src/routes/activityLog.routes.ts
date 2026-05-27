import { Router } from "express";
import { getActivityLogs } from "../controllers/activityLog.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const activityLogRouter = Router();

activityLogRouter.get("/", asyncHandler(getActivityLogs));
