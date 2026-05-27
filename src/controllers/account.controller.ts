import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const validAccountTypes = ["cash", "debit", "credit", "savings"] as const;

const isValidAccountType = (value: unknown): value is (typeof validAccountTypes)[number] =>
	typeof value === "string" && validAccountTypes.includes(value as any);

export const listAccounts = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		const accounts = await prisma.account.findMany({
			where: { userId: req.userId },
			orderBy: { createdAt: "desc" },
		});

		return res.json(accounts);
	} catch (error) {
		return res.status(500).json({
			message: "Error al obtener cuentas",
		});
	}
};

export const createAccount = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { name, type, balance = 0 } = req.body;

		if (!userId) {
			return res.status(401).json({
				message: "No autorizado",
			});
		}

		if (!name || !type) {
			return res.status(400).json({
				message: "Nombre y tipo de cuenta son obligatorios",
			});
		}

		if (!isValidAccountType(type)) {
			return res.status(400).json({
				message: "Tipo de cuenta inválido",
			});
		}

		const account = await prisma.account.create({
			data: {
				userId,
				name,
				type,
				balance: Number(balance) || 0,
			},
		});

		return res.status(201).json(account);
	} catch (error) {
		return res.status(500).json({
			message: "Error al crear cuenta",
		});
	}
};

export const updateAccount = async (req: AuthRequest, res: Response) => {
	try {
		const userId = req.userId;
		const { id } = req.params;
		const { name, type, balance } = req.body;

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

		const account = await prisma.account.findFirst({
			where: { id, userId },
		});

		if (!account) {
			return res.status(404).json({
				message: "Cuenta no encontrada",
			});
		}

		if (type && !isValidAccountType(type)) {
			return res.status(400).json({
				message: "Tipo de cuenta inválido",
			});
		}

		const updatedAccount = await prisma.account.update({
			where: { id },
			data: {
				name: name ?? account.name,
				type: type ?? account.type,
				balance: balance !== undefined ? Number(balance) : account.balance,
			},
		});

		return res.json(updatedAccount);
	} catch (error) {
		return res.status(500).json({
			message: "Error al actualizar cuenta",
		});
	}
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
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

		const account = await prisma.account.findFirst({
			where: { id, userId },
		});

		if (!account) {
			return res.status(404).json({
				message: "Cuenta no encontrada",
			});
		}

		await prisma.account.delete({
			where: { id },
		});

		return res.json({
			message: "Cuenta eliminada",
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al eliminar cuenta",
		});
	}
};
