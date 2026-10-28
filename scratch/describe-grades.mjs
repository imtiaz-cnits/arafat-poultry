import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ecgCols = await prisma.$queryRawUnsafe("DESCRIBE egg_collection_grades;");
  console.log("egg_collection_grades columns:", ecgCols.map(c => c.Field));

  const fsCols = await prisma.$queryRawUnsafe("DESCRIBE fish_species;");
  console.log("fish_species columns:", fsCols.map(c => c.Field));

  await prisma.$disconnect();
}

main().catch(console.error);
