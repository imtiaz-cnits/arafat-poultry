import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up legacy tiles/ceramics records from `arafat_poultry_db`...");

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");

  // 1. Delete legacy ceramic purchases and payment details
  await prisma.$executeRawUnsafe("DELETE FROM purchase_payment_details WHERE purchases_id = 1;");
  await prisma.$executeRawUnsafe("DELETE FROM purchase_order_details WHERE purchase_id = 1;");
  await prisma.$executeRawUnsafe("DELETE FROM purchases WHERE id = 1 OR supplier_id < 100;");

  // 2. Delete duplicate test purchases if any
  await prisma.$executeRawUnsafe("DELETE FROM purchase_payment_details WHERE purchases_id IN (2, 3);");
  await prisma.$executeRawUnsafe("DELETE FROM purchase_order_details WHERE purchase_id IN (2, 3);");
  await prisma.$executeRawUnsafe("DELETE FROM purchases WHERE id IN (2, 3);");

  // 3. Delete legacy ceramic suppliers
  await prisma.$executeRawUnsafe("DELETE FROM suppliers WHERE id < 100;");

  // 4. Delete legacy ceramic orders & details
  await prisma.$executeRawUnsafe("DELETE FROM order_payment_details WHERE order_id < 100;");
  await prisma.$executeRawUnsafe("DELETE FROM order_details WHERE order_id < 100;");
  await prisma.$executeRawUnsafe("DELETE FROM orders WHERE id < 100;");

  // 5. Delete legacy ceramic customers
  await prisma.$executeRawUnsafe("DELETE FROM customers WHERE id < 100;");

  // 6. Delete legacy ceramic products
  await prisma.$executeRawUnsafe("DELETE FROM products WHERE id < 100;");

  // 7. Delete legacy ceramic categories
  await prisma.$executeRawUnsafe(`
    DELETE FROM categories 
    WHERE category_name IN ('Tiles', 'Basin', 'Commodes', 'PAN', 'FAUCET', 'PUTTY')
       OR id < 100;
  `);

  // 8. Delete legacy ceramic brands
  await prisma.$executeRawUnsafe(`
    DELETE FROM brands 
    WHERE name IN ('Fresh Ceramics', 'FRESH SANITARY', 'ASTRA', 'SATTAR METAL', 'RFL', 'MOON GALLARY', 'RASEL TRADING', 'PUTTY', 'CHINA', 'ATI CERAMICS')
       OR id < 100;
  `);

  // 9. Delete legacy units < 100
  await prisma.$executeRawUnsafe("DELETE FROM units WHERE id < 100;");

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("✓ Legacy tiles and ceramics data purged cleanly from `arafat_poultry_db`!");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
