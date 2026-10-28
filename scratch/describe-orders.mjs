import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const oCols = await prisma.$queryRawUnsafe("DESCRIBE orders;");
  console.log("orders columns:", oCols.map(c => c.Field));

  const odCols = await prisma.$queryRawUnsafe("DESCRIBE order_details;");
  console.log("order_details columns:", odCols.map(c => c.Field));

  const opdCols = await prisma.$queryRawUnsafe("DESCRIBE order_payment_details;");
  console.log("order_payment_details columns:", opdCols.map(c => c.Field));

  await prisma.$disconnect();
}

main().catch(console.error);
