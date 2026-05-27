import { Router } from "express";
import {
	createGoal,
	deleteGoal,
	getGoals,
	updateGoal,
	updateGoalProgress,
} from "../controllers/goal.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getGoals);
router.post("/", authMiddleware, createGoal);
router.put("/:id", authMiddleware, updateGoal);
router.patch("/:id/progress", authMiddleware, updateGoalProgress);
router.delete("/:id", authMiddleware, deleteGoal);

export default router;
