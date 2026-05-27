import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { generateToken } from "../utils/generateToken";
import { AuthRequest } from "../middleware/auth.middleware";

export const register = async (req: Request, res: Response) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({
				message: "Nombre, correo y contraseña son obligatorios",
			});
		}

		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return res.status(400).json({
				message: "El correo ya está registrado",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				accounts: {
					create: {
						name: "Efectivo",
						type: "cash",
						balance: 0,
					},
				},
			},
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
			},
		});

		const token = generateToken(user.id);

		return res.status(201).json({
			token,
			user,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al registrar usuario",
		});
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				message: "Correo y contraseña son obligatorios",
			});
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(401).json({
				message: "Credenciales incorrectas",
			});
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({
				message: "Credenciales incorrectas",
			});
		}

		const token = generateToken(user.id);

		return res.json({
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error al iniciar sesión",
		});
	}
};

export const me = async (req: AuthRequest, res: Response) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.userId,
			},
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
			},
		});

		if (!user) {
			return res.status(404).json({
				message: "Usuario no encontrado",
			});
		}

		return res.json(user);
	} catch (error) {
		return res.status(500).json({
			message: "Error al obtener perfil",
		});
	}
};
