import { Router } from "express";
import {
	generateReport,
	getMonthlyReport,
} from "../controllers/report.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/monthly", authMiddleware, getMonthlyReport);
router.post("/generate", authMiddleware, generateReport);

export default router;
