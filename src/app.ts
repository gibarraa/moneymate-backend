import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import accountRoutes from "./routes/account.routes";
import transactionRoutes from "./routes/transaction.routes";
import budgetRoutes from "./routes/budget.routes";
import goalRoutes from "./routes/goal.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import reportRoutes from "./routes/report.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
	res.json({
		status: "ok",
		message: "Moneymate API running",
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);

app.use(errorMiddleware);
