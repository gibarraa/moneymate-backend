import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const validTransactionTypes = ["income", "expense"] as const;

const isValidTransactionType = (
	value: unknown
): value is (typeof validTransactionTypes)[number] =>
	typeof value === "string" && validTransactionTypes.includes(value as any);

export const listTransactions = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		const transactions = await prisma.transaction.findMany({
			where: { userId },
			orderBy: { date: "desc" },
			include: {
				account: true,
				category: true,
			},
		});

		return res.json(transactions);
	} catch (error) {
		return res.status(500).json({
			message: "Error al obtener transacciones",
		});
	}
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { accountId, categoryId, amount, type, description, date } = req.body;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		if (!accountId || !categoryId || amount === undefined || !type || !description || !date) {
			return res.status(400).json({
				message: "Faltan campos obligatorios",
			});
		}

		if (!isValidTransactionType(type)) {
			return res.status(400).json({
				message: "Tipo de transacción inválido",
			});
		}

		const account = await prisma.account.findFirst({
			where: { id: accountId, userId },
		});

		if (!account) {
			return res.status(404).json({
				message: "Cuenta no encontrada",
			});
		}

		const category = await prisma.category.findUnique({
			where: { id: categoryId },
		});

		if (!category) {
			return res.status(404).json({
				message: "Categoría no encontrada",
			});
		}

		const transactionAmount = Number(amount);

		const transaction = await prisma.$transaction(async (tx) => {
			const createdTransaction = await tx.transaction.create({
				data: {
					userId,
					accountId,
					categoryId,
					amount: transactionAmount,
					type,
					description,
					date: new Date(date),
				},
			});

			await tx.account.update({
				where: { id: accountId },
				data: {
					balance:
						type === "income"
							? { increment: transactionAmount }
							: { decrement: transactionAmount },
				},
			});

			return createdTransaction;
		});

		return res.status(201).json(transaction);
	} catch (error) {
		return res.status(500).json({
			message: "Error al crear transacción",
		});
	}
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
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

		const transaction = await prisma.transaction.findFirst({
			where: { id, userId },
		});

		if (!transaction) {
			return res.status(404).json({
				message: "Transacción no encontrada",
			});
		}

		await prisma.transaction.delete({
			where: { id },
		});

		return res.json({
			message: "Transacción eliminada",
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al eliminar transacción",
		});
	}
};
