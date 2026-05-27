import { Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getGoals = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		const goals = await prisma.savingsGoal.findMany({
			where: {
				userId,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		const goalsWithStats = goals.map((goal) => {
			const targetAmount = new Prisma.Decimal(goal.targetAmount);
			const currentAmount = new Prisma.Decimal(goal.currentAmount);

			const percentageCompleted = targetAmount.equals(0)
				? 0
				: Number(currentAmount.div(targetAmount).mul(100).toFixed(2));

			const remainingAmount = targetAmount.minus(currentAmount);

			return {
				...goal,
				percentageCompleted,
				remainingAmount,
			};
		});

		return res.json(goalsWithStats);
	} catch (error) {
		return res.status(500).json({
			message: "Error al obtener metas",
		});
	}
};

export const createGoal = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { title, targetAmount, currentAmount, deadline } = req.body;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		if (!title || !targetAmount || !deadline) {
			return res.status(400).json({
				message: "Título, monto objetivo y fecha límite son obligatorios",
			});
		}

		if (Number(targetAmount) <= 0) {
			return res.status(400).json({
				message: "El monto objetivo debe ser mayor a cero",
			});
		}

		const goal = await prisma.savingsGoal.create({
			data: {
				userId,
				title,
				targetAmount: new Prisma.Decimal(targetAmount),
				currentAmount: new Prisma.Decimal(currentAmount || 0),
				deadline: new Date(deadline),
			},
		});

		return res.status(201).json(goal);
	} catch (error) {
		return res.status(500).json({
			message: "Error al crear meta",
		});
	}
};

export const updateGoal = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { id } = req.params;
		const { title, targetAmount, currentAmount, deadline } = req.body;

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

		const existingGoal = await prisma.savingsGoal.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!existingGoal) {
			return res.status(404).json({
				message: "Meta no encontrada",
			});
		}

		const goal = await prisma.savingsGoal.update({
			where: {
				id,
			},
			data: {
				...(title ? { title } : {}),
				...(targetAmount ? { targetAmount: new Prisma.Decimal(targetAmount) } : {}),
				...(currentAmount ? { currentAmount: new Prisma.Decimal(currentAmount) } : {}),
				...(deadline ? { deadline: new Date(deadline) } : {}),
			},
		});

		return res.json(goal);
	} catch (error) {
		return res.status(500).json({
			message: "Error al actualizar meta",
		});
	}
};

export const updateGoalProgress = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { id } = req.params;
		const { currentAmount } = req.body;

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

		if (currentAmount === undefined || currentAmount === null) {
			return res.status(400).json({
				message: "El monto actual es obligatorio",
			});
		}

		if (Number(currentAmount) < 0) {
			return res.status(400).json({
				message: "El monto actual no puede ser negativo",
			});
		}

		const existingGoal = await prisma.savingsGoal.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!existingGoal) {
			return res.status(404).json({
				message: "Meta no encontrada",
			});
		}

		const goal = await prisma.savingsGoal.update({
			where: {
				id,
			},
			data: {
				currentAmount: new Prisma.Decimal(currentAmount),
			},
		});

		const targetAmount = new Prisma.Decimal(goal.targetAmount);
		const savedAmount = new Prisma.Decimal(goal.currentAmount);

		const percentageCompleted = targetAmount.equals(0)
			? 0
			: Number(savedAmount.div(targetAmount).mul(100).toFixed(2));

		const remainingAmount = targetAmount.minus(savedAmount);

		return res.json({
			...goal,
			percentageCompleted,
			remainingAmount,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al actualizar progreso de la meta",
		});
	}
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
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

		const existingGoal = await prisma.savingsGoal.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!existingGoal) {
			return res.status(404).json({
				message: "Meta no encontrada",
			});
		}

		await prisma.savingsGoal.delete({
			where: {
				id,
			},
		});

		return res.json({
			message: "Meta eliminada correctamente",
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al eliminar meta",
		});
	}
};
