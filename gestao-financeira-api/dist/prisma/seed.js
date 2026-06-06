"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const categories = [
    {
        name: 'income',
        displayName: 'Receitas',
        icon: 'attach-money',
        background: '#7FD1AE',
        isIncome: true,
        isDefault: true,
    },
    {
        name: 'food',
        displayName: 'Alimentação',
        icon: 'restaurant',
        background: '#FFB86B',
        isIncome: false,
        isDefault: true,
    },
    {
        name: 'transport',
        displayName: 'Transporte',
        icon: 'directions-bus',
        background: '#7DB7FF',
        isIncome: false,
        isDefault: true,
    },
    {
        name: 'home',
        displayName: 'Moradia',
        icon: 'home',
        background: '#D7A7FF',
        isIncome: false,
        isDefault: true,
    },
    {
        name: 'leisure',
        displayName: 'Lazer',
        icon: 'sports-esports',
        background: '#FF8AA1',
        isIncome: false,
        isDefault: true,
    },
];
async function main() {
    const passwordHash = await bcryptjs_1.default.hash('123456', 10);
    await prisma.user.upsert({
        where: { email: 'aluno@pdm.com' },
        update: {
            name: 'Gabriel',
            passwordHash,
        },
        create: {
            name: 'Gabriel',
            email: 'aluno@pdm.com',
            passwordHash,
        },
    });
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: category,
            create: category,
        });
    }
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
