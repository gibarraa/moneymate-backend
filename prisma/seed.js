"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const categories = [
        {
            name: "Comida",
            type: "expense",
            icon: "utensils",
            color: "#EF4444",
        },
        {
            name: "Transporte",
            type: "expense",
            icon: "car",
            color: "#F97316",
        },
        {
            name: "Entretenimiento",
            type: "expense",
            icon: "gamepad-2",
            color: "#A855F7",
        },
        {
            name: "Salud",
            type: "expense",
            icon: "heart-pulse",
            color: "#EC4899",
        },
        {
            name: "Educación",
            type: "expense",
            icon: "graduation-cap",
            color: "#3B82F6",
        },
        {
            name: "Hogar",
            type: "expense",
            icon: "home",
            color: "#14B8A6",
        },
        {
            name: "Sueldo",
            type: "income",
            icon: "wallet",
            color: "#22C55E",
        },
        {
            name: "Freelance",
            type: "income",
            icon: "laptop",
            color: "#38BDF8",
        },
        {
            name: "Ahorro",
            type: "income",
            icon: "piggy-bank",
            color: "#84CC16",
        },
        {
            name: "Otros",
            type: "expense",
            icon: "circle",
            color: "#94A3B8",
        },
    ];
    for (const category of categories) {
        await prisma.category.upsert({
            where: {
                name: category.name,
            },
            update: { ...category },
            create: { ...category },
        });
    }
    console.log("Categorías iniciales creadas correctamente");
}
main()
    .catch((error) => {
    console.error("Error al crear seed:", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map