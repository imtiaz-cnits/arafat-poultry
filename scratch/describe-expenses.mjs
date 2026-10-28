import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const expCols = await prisma.$queryRawUnsafe("DESCRIBE expenses;");
  console.log("expenses columns:", expCols.map(c => ({ field: c.Field, null: c.Null, default: c.Default })));
  await prisma.$disconnect();
}

main().catch(console.error);
