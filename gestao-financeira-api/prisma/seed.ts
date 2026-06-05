import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
