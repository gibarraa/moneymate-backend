import type { Request, Response } from "express";
import { activityLogService } from "../services/mongo/activityLog.service.js";

export async function getActivityLogs(req: Request, res: Response) {
  const logs = await activityLogService.list(req.userId!);
  res.json(logs);
}
