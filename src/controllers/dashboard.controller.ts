import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getDashboard = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;

		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		const startOfMonth = new Date(currentYear, currentMonth, 1);
		const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

		const accounts = await prisma.account.findMany({
			where: {
				userId,
			},
		});

		const balance = accounts.reduce((total, account) => {
			return total.plus(new Prisma.Decimal(account.balance));
		}, new Prisma.Decimal(0));

		const monthlyIncomeResult = await prisma.transaction.aggregate({
			where: {
				userId,
				type: "income",
				date: {
					gte: startOfMonth,
					lte: endOfMonth,
				},
			},
			_sum: {
				amount: true,
			},
		});

		const monthlyExpenseResult = await prisma.transaction.aggregate({
			where: {
				userId,
				type: "expense",
				date: {
					gte: startOfMonth,
					lte: endOfMonth,
				},
			},
			_sum: {
				amount: true,
			},
		});

		const monthlyIncome = new Prisma.Decimal(
			monthlyIncomeResult._sum.amount || 0
		);

		const monthlyExpense = new Prisma.Decimal(
			monthlyExpenseResult._sum.amount || 0
		);

		const estimatedSavings = monthlyIncome.minus(monthlyExpense);

		const recentTransactions = await prisma.transaction.findMany({
			where: {
				userId,
			},
			include: {
				account: true,
				category: true,
			},
			orderBy: {
				date: "desc",
			},
			take: 5,
		});

		const expenseTransactions = await prisma.transaction.findMany({
			where: {
				userId,
				type: "expense",
				date: {
					gte: startOfMonth,
					lte: endOfMonth,
				},
			},
			include: {
				category: true,
			},
		});

		const expensesByCategoryMap = new Map<string, Prisma.Decimal>();

		expenseTransactions.forEach((transaction) => {
			const categoryName = transaction.category.name;
			const currentAmount =
				expensesByCategoryMap.get(categoryName) || new Prisma.Decimal(0);

			expensesByCategoryMap.set(
				categoryName,
				currentAmount.plus(new Prisma.Decimal(transaction.amount))
			);
		});

		const expensesByCategory = Array.from(expensesByCategoryMap.entries()).map(
			([category, amount]) => ({
				category,
				amount: Number(amount),
			})
		);

		const incomeVsExpense = [
			{
				name: "Ingresos",
				amount: Number(monthlyIncome),
			},
			{
				name: "Egresos",
				amount: Number(monthlyExpense),
			},
		];

		return res.json({
			balance: Number(balance),
			monthlyIncome: Number(monthlyIncome),
			monthlyExpense: Number(monthlyExpense),
			estimatedSavings: Number(estimatedSavings),
			recentTransactions,
			expensesByCategory,
			incomeVsExpense,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al obtener dashboard",
		});
	}
};
