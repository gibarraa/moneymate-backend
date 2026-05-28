import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const listCategories = async (_req: Request, res: Response) => {
	try {
		const categories = await prisma.category.findMany({
			orderBy: [{ type: "asc" }, { name: "asc" }],
		});

		return res.json(categories);
	} catch (error) {
		console.error("LIST_CATEGORIES_ERROR", error);
		return res.status(500).json({
			message: "Error al obtener categorias",
		});
	}
};
