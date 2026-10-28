import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.categories.findMany();
  console.log("Categories:", cats.map(c => ({ id: c.id, name: c.category_name })));

  const brands = await prisma.brands.findMany();
  console.log("Brands:", brands.map(b => ({ id: b.id, name: b.name })));

  await prisma.$disconnect();
}

main().catch(console.error);
