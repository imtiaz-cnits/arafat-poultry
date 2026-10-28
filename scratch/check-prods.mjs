import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.products.findMany({
    orderBy: { id: "asc" },
    include: { categories: true, brands: true, units: true },
  });
  console.log("Products in arafat_poultry_db:", prods.map(p => ({
    id: p.id,
    name: p.product_name,
    category: p.categories?.category_name,
    brand: p.brands?.name,
    unit: p.units?.unit_name,
    cost: p.cost_price,
    sell: p.sell_price,
    stock: p.quantity,
  })));

  await prisma.$disconnect();
}

main().catch(console.error);
