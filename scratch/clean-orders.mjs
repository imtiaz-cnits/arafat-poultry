import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");

  await prisma.$executeRawUnsafe(`
    DELETE FROM order_payment_details 
    WHERE order_id NOT IN (101, 102);
  `);

  await prisma.$executeRawUnsafe(`
    DELETE FROM order_details 
    WHERE order_id NOT IN (101, 102);
  `);

  await prisma.$executeRawUnsafe(`
    DELETE FROM orders 
    WHERE id NOT IN (101, 102);
  `);

  // Update order 101 and 102 customer_id to ensure exact match with our customers
  await prisma.$executeRawUnsafe(`
    UPDATE orders SET customer_id = 101, order_note = '20 bags Broiler feed & 10 trays fresh eggs delivery', sub_total = 72450.00, paid_amount = 50000.00, due_amount = 22450.00 WHERE id = 101;
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE orders SET customer_id = 102, order_note = '150 kg fresh harvested Rui fish dispatch', sub_total = 42000.00, paid_amount = 42000.00, due_amount = 0.00 WHERE id = 102;
  `);

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("✓ Orders cleanly synchronized with authentic poultry customers!");

  await prisma.$disconnect();
}

main().catch(console.error);
