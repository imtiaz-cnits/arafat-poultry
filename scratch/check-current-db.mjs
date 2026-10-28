import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const currentDb = await prisma.$queryRawUnsafe("SELECT DATABASE();");
  console.log("Current Database:", currentDb);
  const tables = await prisma.$queryRawUnsafe("SHOW TABLES;");
  console.log("Tables:", tables);
  await prisma.$disconnect();
}

main().catch(console.error);
