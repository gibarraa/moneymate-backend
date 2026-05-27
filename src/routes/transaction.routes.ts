import { Router } from "express";
import {
	createTransaction,
	deleteTransaction,
	listTransactions,
} from "../controllers/transaction.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listTransactions);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);

export default router;
