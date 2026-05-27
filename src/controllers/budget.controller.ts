import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getBudgets = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { month, year } = req.query;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		const currentDate = new Date();

		const selectedMonth = month ? Number(month) : currentDate.getMonth() + 1;
		const selectedYear = year ? Number(year) : currentDate.getFullYear();

		const budgets = await prisma.budget.findMany({
			where: {
				userId,
				month: selectedMonth,
				year: selectedYear,
			},
			include: {
				category: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		const budgetsWithStats = await Promise.all(
			budgets.map(async (budget) => {
				const startDate = new Date(selectedYear, selectedMonth - 1, 1);
				const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

				const spent = await prisma.transaction.aggregate({
					where: {
						userId,
						categoryId: budget.categoryId,
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

				const spentAmount = new Prisma.Decimal(spent._sum?.amount || 0);
				const limitAmount = new Prisma.Decimal(budget.limitAmount);

				const percentageUsed = limitAmount.equals(0)
					? 0
					: Number(spentAmount.div(limitAmount).mul(100).toFixed(2));

				const remainingAmount = limitAmount.minus(spentAmount);

				return {
					...budget,
					spentAmount,
					percentageUsed,
					remainingAmount,
				};
			})
		);

		return res.json(budgetsWithStats);
	} catch (error) {
		return res.status(500).json({
			message: "Error al obtener presupuestos",
		});
	}
};

export const createBudget = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { categoryId, limitAmount, month, year } = req.body;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		if (!categoryId || !limitAmount || !month || !year) {
			return res.status(400).json({
				message: "Categoría, límite, mes y año son obligatorios",
			});
		}

		if (Number(limitAmount) <= 0) {
			return res.status(400).json({
				message: "El límite debe ser mayor a cero",
			});
		}

		const category = await prisma.category.findUnique({
			where: {
				id: categoryId,
			},
		});

		if (!category) {
			return res.status(404).json({
				message: "Categoría no encontrada",
			});
		}

		const existingBudget = await prisma.budget.findFirst({
			where: {
				userId,
				categoryId,
				month: Number(month),
				year: Number(year),
			},
		});

		if (existingBudget) {
			return res.status(400).json({
				message: "Ya existe un presupuesto para esta categoría en este mes",
			});
		}

		const budget = await prisma.budget.create({
			data: {
				userId,
				categoryId,
				limitAmount: new Prisma.Decimal(limitAmount),
				month: Number(month),
				year: Number(year),
			},
			include: {
				category: true,
			},
		});

		return res.status(201).json(budget);
	} catch (error) {
		return res.status(500).json({
			message: "Error al crear presupuesto",
		});
	}
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { id } = req.params;
		const { limitAmount, month, year } = req.body;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		if (typeof id !== "string") {
			return res.status(400).json({
				message: "Id inválido",
			});
		}

		const existingBudget = await prisma.budget.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!existingBudget) {
			return res.status(404).json({
				message: "Presupuesto no encontrado",
			});
		}

		const budget = await prisma.budget.update({
			where: {
				id,
			},
			data: {
				...(limitAmount ? { limitAmount: new Prisma.Decimal(limitAmount) } : {}),
				...(month ? { month: Number(month) } : {}),
				...(year ? { year: Number(year) } : {}),
			},
			include: {
				category: true,
			},
		});

		return res.json(budget);
	} catch (error) {
		return res.status(500).json({
			message: "Error al actualizar presupuesto",
		});
	}
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { id } = req.params;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		if (typeof id !== "string") {
			return res.status(400).json({
				message: "Id inválido",
			});
		}

		const existingBudget = await prisma.budget.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!existingBudget) {
			return res.status(404).json({
				message: "Presupuesto no encontrado",
			});
		}

		await prisma.budget.delete({
			where: {
				id,
			},
		});

		return res.json({
			message: "Presupuesto eliminado correctamente",
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al eliminar presupuesto",
		});
	}
};
