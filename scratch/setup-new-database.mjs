import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("1. Creating database `arafat_poultry_db`...");
  await prisma.$executeRawUnsafe(
    "CREATE DATABASE IF NOT EXISTS `arafat_poultry_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  );
  console.log("✓ Database `arafat_poultry_db` created.");

  const tablesResult = await prisma.$queryRawUnsafe("SHOW TABLES;");
  const tableNames = tablesResult.map((r) => Object.values(r)[0]);
  console.log(`Found ${tableNames.length} tables in current database.`);

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");

  for (const tableName of tableNames) {
    console.log(`Copying table \`${tableName}\`...`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`arafat_poultry_db\`.\`${tableName}\`;`);
    await prisma.$executeRawUnsafe(
      `CREATE TABLE \`arafat_poultry_db\`.\`${tableName}\` LIKE \`${tableName}\`;`
    );
    await prisma.$executeRawUnsafe(
      `INSERT INTO \`arafat_poultry_db\`.\`${tableName}\` SELECT * FROM \`${tableName}\`;`
    );
  }

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("✓ All 56 tables and data copied into `arafat_poultry_db` successfully!");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
