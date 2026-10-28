import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findFirst({ select: { id: true } });
  const adminId = admin ? admin.id : 1n;

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");

  // Clean orphan product_returns
  await prisma.$executeRawUnsafe(`
    DELETE FROM product_returns 
    WHERE customer_id NOT IN (SELECT id FROM customers)
       OR order_id NOT IN (SELECT id FROM orders)
       OR product_id NOT IN (SELECT id FROM products);
  `);

  // Clean orphan purchase_returns
  await prisma.$executeRawUnsafe(`
    DELETE FROM purchase_returns 
    WHERE supplier_id NOT IN (SELECT id FROM suppliers)
       OR purchase_id NOT IN (SELECT id FROM purchases)
       OR product_id NOT IN (SELECT id FROM products);
  `);

  // Seed 2 authentic sales returns (1 for customer 101, 1 for customer 102)
  await prisma.$executeRawUnsafe(`
    INSERT INTO product_returns 
    (id, order_id, customer_id, product_id, quantity, amount, discount_amount, due_amount, date, user_id, created_at, updated_at)
    VALUES 
    (101, 101, 101, 103, 10, '115.00', '0.00', '0.00', '2026-10-28', ${adminId}, NOW(), NOW()),
    (102, 102, 102, 105, 5, '1400.00', '0.00', '0.00', '2026-10-28', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE amount = VALUES(amount);
  `);

  // Seed 2 authentic purchase returns (1 for supplier 101, 1 for supplier 102)
  await prisma.$executeRawUnsafe(`
    INSERT INTO purchase_returns 
    (id, purchase_id, supplier_id, product_id, quantity, amount, date, user_id, created_at, updated_at)
    VALUES 
    (101, 101, 101, 101, 2, 6500.00, CURDATE(), ${adminId}, NOW(), NOW()),
    (102, 102, 102, 102, 1, 3100.00, CURDATE(), ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE amount = VALUES(amount);
  `);

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("Successfully cleaned and seeded product_returns and purchase_returns!");

  await prisma.$disconnect();
}

main().catch(console.error);
