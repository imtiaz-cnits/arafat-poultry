import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.$queryRawUnsafe("SELECT id, product_name, category_id, brand_id, unit_id FROM products;");
  console.log("Raw products:", prods);

  // Clean any products that don't belong to categories 101-105
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");
  await prisma.$executeRawUnsafe("DELETE FROM products WHERE category_id NOT IN (101, 102, 103, 104, 105) OR brand_id NOT IN (101, 102, 103, 104, 105) OR unit_id NOT IN (101, 102, 103, 104, 105);");
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");

  const cleanProds = await prisma.$queryRawUnsafe("SELECT id, product_name, category_id, brand_id, unit_id FROM products;");
  console.log("Clean products:", cleanProds);

  await prisma.$disconnect();
}

main().catch(console.error);
