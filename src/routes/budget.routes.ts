import { Router } from "express";
import {
	createBudget,
	deleteBudget,
	getBudgets,
	updateBudget,
} from "../controllers/budget.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getBudgets);
router.post("/", authMiddleware, createBudget);
router.put("/:id", authMiddleware, updateBudget);
router.delete("/:id", authMiddleware, deleteBudget);

export default router;
