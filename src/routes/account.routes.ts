import { Router } from "express";
import {
	createAccount,
	deleteAccount,
	listAccounts,
	updateAccount,
} from "../controllers/account.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listAccounts);
router.post("/", createAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;
