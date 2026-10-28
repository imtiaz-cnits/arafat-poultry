import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pCols = await prisma.$queryRawUnsafe("DESCRIBE purchases;");
  console.log("purchases columns:", pCols.map(c => c.Field));

  const podCols = await prisma.$queryRawUnsafe("DESCRIBE purchase_order_details;");
  console.log("purchase_order_details columns:", podCols.map(c => c.Field));

  const ppdCols = await prisma.$queryRawUnsafe("DESCRIBE purchase_payment_details;");
  console.log("purchase_payment_details columns:", ppdCols.map(c => c.Field));

  await prisma.$disconnect();
}

main().catch(console.error);
