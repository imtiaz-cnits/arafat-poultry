import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const fCols = await prisma.$queryRawUnsafe("DESCRIBE poultry_flocks;");
  console.log("poultry_flocks columns:", fCols.map(c => c.Field));

  const ecCols = await prisma.$queryRawUnsafe("DESCRIBE egg_collections;");
  console.log("egg_collections columns:", ecCols.map(c => c.Field));

  const fpCols = await prisma.$queryRawUnsafe("DESCRIBE fish_ponds;");
  console.log("fish_ponds columns:", fpCols.map(c => c.Field));

  const fbCols = await prisma.$queryRawUnsafe("DESCRIBE fish_batches;");
  console.log("fish_batches columns:", fbCols.map(c => c.Field));

  await prisma.$disconnect();
}

main().catch(console.error);
