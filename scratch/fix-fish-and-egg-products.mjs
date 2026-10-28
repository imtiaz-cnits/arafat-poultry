import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findFirst({ select: { id: true } });
  const adminId = admin ? admin.id : 1n;

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");

  // Check fish_harvests
  const harvests = await prisma.$queryRawUnsafe("SELECT id, product_id FROM fish_harvests;");
  console.log("Existing fish_harvests:", harvests);

  // Clean orphan fish_harvests
  await prisma.$executeRawUnsafe(`
    DELETE FROM fish_harvests 
    WHERE product_id NOT IN (SELECT id FROM products);
  `);

  // Clean orphan fish_batches product_id
  await prisma.$executeRawUnsafe(`
    UPDATE fish_batches 
    SET product_id = 105 
    WHERE product_id IS NOT NULL AND product_id NOT IN (SELECT id FROM products);
  `);

  // Clean orphan egg_collections
  await prisma.$executeRawUnsafe(`
    DELETE FROM egg_collection_grades 
    WHERE product_id NOT IN (SELECT id FROM products);
  `);

  await prisma.$executeRawUnsafe(`
    DELETE FROM egg_regradings 
    WHERE source_product_id NOT IN (SELECT id FROM products) 
       OR destination_product_id NOT IN (SELECT id FROM products);
  `);

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("Successfully cleaned all orphan foreign keys for fish and eggs!");

  await prisma.$disconnect();
}

main().catch(console.error);
