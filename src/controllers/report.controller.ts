import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getMonthlyReport = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { month, year } = req.query;

		const now = new Date();

		const selectedMonth = month ? Number(month) : now.getMonth() + 1;
		const selectedYear = year ? Number(year) : now.getFullYear();

		const startDate = new Date(selectedYear, selectedMonth - 1, 1);
		const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

		const incomeResult = await prisma.transaction.aggregate({
			where: {
				userId,
				type: "income",
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			_sum: {
				amount: true,
			},
		});

		const expenseResult = await prisma.transaction.aggregate({
			where: {
				userId,
				type: "expense",
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			_sum: {
				amount: true,
			},
		});

		const totalIncome = new Prisma.Decimal(incomeResult._sum.amount || 0);
		const totalExpense = new Prisma.Decimal(expenseResult._sum.amount || 0);
		const balance = totalIncome.minus(totalExpense);

		const transactions = await prisma.transaction.findMany({
			where: {
				userId,
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			include: {
				category: true,
				account: true,
			},
			orderBy: {
				date: "desc",
			},
		});

		const expenses = transactions.filter(
			(transaction) => transaction.type === "expense"
		);

		const categoryTotals = new Map<string, Prisma.Decimal>();

		expenses.forEach((transaction) => {
			const categoryName = transaction.category.name;
			const current = categoryTotals.get(categoryName) || new Prisma.Decimal(0);

			categoryTotals.set(
				categoryName,
				current.plus(new Prisma.Decimal(transaction.amount))
			);
		});

		let topExpenseCategory = null as null | {
			category: string;
			amount: number;
		};

		categoryTotals.forEach((amount, category) => {
			if (!topExpenseCategory || Number(amount) > topExpenseCategory.amount) {
				topExpenseCategory = {
					category,
					amount: Number(amount),
				};
			}
		});

		return res.json({
			month: selectedMonth,
			year: selectedYear,
			totalIncome: Number(totalIncome),
			totalExpense: Number(totalExpense),
			balance: Number(balance),
			topExpenseCategory,
			transactionCount: transactions.length,
			transactions,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al obtener reporte mensual",
		});
	}
};

export const generateReport = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId!;
		const { month, year } = req.body;

		const now = new Date();

		const selectedMonth = month ? Number(month) : now.getMonth() + 1;
		const selectedYear = year ? Number(year) : now.getFullYear();

		const startDate = new Date(selectedYear, selectedMonth - 1, 1);
		const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

		const incomeResult = await prisma.transaction.aggregate({
			where: {
				userId,
				type: "income",
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			_sum: {
				amount: true,
			},
		});

		const expenseResult = await prisma.transaction.aggregate({
			where: {
				userId,
				type: "expense",
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			_sum: {
				amount: true,
			},
		});

		const totalIncome = new Prisma.Decimal(incomeResult._sum.amount || 0);
		const totalExpense = new Prisma.Decimal(expenseResult._sum.amount || 0);
		const balance = totalIncome.minus(totalExpense);

		const existingReport = await prisma.report.findFirst({
			where: {
				userId,
				month: selectedMonth,
				year: selectedYear,
			},
		});

		let report;

		if (existingReport) {
			report = await prisma.report.update({
				where: {
					id: existingReport.id,
				},
				data: {
					totalIncome,
					totalExpense,
					balance,
					generatedAt: new Date(),
				},
			});
		} else {
			report = await prisma.report.create({
				data: {
					userId,
					month: selectedMonth,
					year: selectedYear,
					totalIncome,
					totalExpense,
					balance,
				},
			});
		}

		return res.status(201).json({
			message: "Reporte generado correctamente",
			report,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al generar reporte",
		});
	}
};
