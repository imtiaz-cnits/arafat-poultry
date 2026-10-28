import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findFirst({ select: { id: true } });
  const adminId = admin ? admin.id : 1n;

  // Check existing stock movements
  const count = await prisma.$queryRawUnsafe("SELECT count(*) as c FROM stock_movements;");
  console.log("Total stock movements:", count);

  // Clean orphan stock movements pointing to non-existent products
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");
  await prisma.$executeRawUnsafe(`
    DELETE FROM stock_movements 
    WHERE product_id NOT IN (SELECT id FROM products);
  `);

  // Ensure stock movements for product 101 and 102 (Poultry Feed) exist
  await prisma.$executeRawUnsafe(`
    INSERT INTO stock_movements 
    (movement_type, reference_type, reference_id, product_id, quantity, unit_price, total_value, stock_after, note, user_id, date, created_at)
    VALUES 
    ('PURCHASE_INWARD', 'PURCHASE', 101, 101, 100.00, 3250.00, 325000.00, 100.00, 'Initial Feed Purchase Kazi Farms', ${adminId}, CURDATE(), NOW()),
    ('PURCHASE_INWARD', 'PURCHASE', 102, 102, 80.00, 3100.00, 248000.00, 80.00, 'Initial Feed Purchase CP Bangladesh', ${adminId}, CURDATE(), NOW()),
    ('INTERNAL_ISSUE', 'INTERNAL_FEED_ISSUE', 101, 101, 10.00, 3250.00, 32500.00, 90.00, 'Feed issued to Shed #1 Broilers', ${adminId}, CURDATE(), NOW()),
    ('INTERNAL_ISSUE', 'INTERNAL_FEED_ISSUE', 102, 102, 10.00, 3100.00, 31000.00, 70.00, 'Feed issued to Pond #1 Fish Batch', ${adminId}, CURDATE(), NOW());
  `);

  // Ensure a default business unit exists
  await prisma.$executeRawUnsafe(`
    INSERT INTO business_units (id, code, name, status, user_id, created_at, updated_at)
    VALUES (1, 'FEED_TRADING', 'Feed Trading Division', 'active', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE name = VALUES(name);
  `);

  // Also clean internal_feed_issues
  await prisma.$executeRawUnsafe(`
    DELETE FROM internal_feed_issues 
    WHERE product_id NOT IN (SELECT id FROM products);
  `);

  // Add 2 authentic internal feed issues for Feed Trading page
  await prisma.$executeRawUnsafe(`
    INSERT INTO internal_feed_issues
    (id, issue_no, product_id, source_business_unit_id, destination_type, destination_id, destination_name, bags, bag_weight_kg, total_kg, unit_cost_per_kg, total_cost, date, note, user_id, created_at)
    VALUES
    (101, 'ISSUE-202610-001', 101, 1, 'POULTRY_FARM', 1, 'Shed #1 - Broiler House', 10.00, 50.00, 500.00, 65.00, 32500.00, CURDATE(), 'Routine weekly feeding distribution', ${adminId}, NOW()),
    (102, 'ISSUE-202610-002', 102, 1, 'FISH_POND', 1, 'Pond A - North Commercial Aqua Lake', 10.00, 50.00, 500.00, 62.00, 31000.00, CURDATE(), 'Floating pellet feed allocation for Rui fish', ${adminId}, NOW())
    ON DUPLICATE KEY UPDATE product_id = VALUES(product_id), total_cost = VALUES(total_cost);
  `);

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("Successfully cleaned and seeded stock_movements & internal_feed_issues!");

  await prisma.$disconnect();
}

main().catch(console.error);
