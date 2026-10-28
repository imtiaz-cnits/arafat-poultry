import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const etCols = await prisma.$queryRawUnsafe("DESCRIBE expense_types;");
  console.log("expense_types columns:", etCols.map(c => ({ field: c.Field, null: c.Null, default: c.Default })));
  await prisma.$disconnect();
}

main().catch(console.error);
