import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const faCols = await prisma.$queryRawUnsafe("DESCRIBE financial_accounts;");
  console.log("financial_accounts columns:", faCols.map(c => ({ field: c.Field, null: c.Null, default: c.Default })));
  await prisma.$disconnect();
}

main().catch(console.error);
