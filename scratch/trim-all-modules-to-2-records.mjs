import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findFirst({ where: { role: "admin" } });
  const adminId = admin ? admin.id : 1n;

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");

  // 1. Staff: Keep admin and 2 authentic staff (Belal and Kashem), delete test staff
  await prisma.$executeRawUnsafe(`
    DELETE FROM users 
    WHERE email LIKE '%@arafat.test' OR email LIKE '%test%' OR name LIKE '%Test%';
  `);

  // Ensure Belal and Kashem have proper status
  await prisma.$executeRawUnsafe(`
    UPDATE users SET status = 'approved' WHERE id IN (1, 101, 102);
  `);

  // 2. Poultry Flocks: Keep only 2 authentic flocks (FLK-HYLINE-01 & FLK-NOVOGEN-02)
  await prisma.$executeRawUnsafe(`
    DELETE FROM poultry_flocks 
    WHERE flock_code NOT IN ('FLK-HYLINE-01', 'FLK-NOVOGEN-02');
  `);

  // 3. Egg Collections: Keep only 2 authentic collections (COL-20261028-001 & COL-20261028-002)
  await prisma.$executeRawUnsafe(`
    DELETE FROM egg_collection_grades 
    WHERE collection_id NOT IN (
      SELECT id FROM egg_collections WHERE collection_no IN ('COL-20261028-001', 'COL-20261028-002')
    );
  `);

  await prisma.$executeRawUnsafe(`
    DELETE FROM egg_collections 
    WHERE collection_no NOT IN ('COL-20261028-001', 'COL-20261028-002');
  `);

  // 4. Fish Ponds: Keep only Pond A and Pond B
  await prisma.$executeRawUnsafe(`
    DELETE FROM fish_batches 
    WHERE batch_no NOT IN ('BATCH-RUI-2026-A', 'BATCH-TLP-2026-B');
  `);

  await prisma.$executeRawUnsafe(`
    DELETE FROM fish_ponds 
    WHERE pond_code NOT IN ('POND-A-NORTH', 'POND-B-SOUTH');
  `);

  // Ensure the 2 ponds have clean names
  await prisma.$executeRawUnsafe(`
    UPDATE fish_ponds 
    SET pond_name = 'পুকুর ১ (উত্তর বাণিজ্যিক লেক)', area_decimal = 180, water_depth_feet = 7.5, status = 'ACTIVE' 
    WHERE pond_code = 'POND-A-NORTH';
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE fish_ponds 
    SET pond_name = 'পুকুর ২ (দক্ষিণ তেলাপিয়া গ্রোথ পুকুর)', area_decimal = 120, water_depth_feet = 6.0, status = 'ACTIVE' 
    WHERE pond_code = 'POND-B-SOUTH';
  `);

  // 5. Expense Types: Exactly 3 authentic types
  await prisma.$executeRawUnsafe(`
    DELETE FROM expenses;
  `);

  await prisma.$executeRawUnsafe(`
    DELETE FROM expense_types;
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO expense_types (id, type_name, status, user_id, created_at, updated_at)
    VALUES 
    (101, 'খামার বিদ্যুৎ ও জ্বালানি খরচ (Utilities)', 'active', ${adminId}, NOW(), NOW()),
    (102, 'শ্রমিক মজুরি ও বেতন (Labor & Wages)', 'active', ${adminId}, NOW(), NOW()),
    (103, 'শেড জীবনিরাপত্তা ও জীবাণুনাশক (Biosecurity)', 'active', ${adminId}, NOW(), NOW());
  `);

  // 6. Expenses: Exactly 2 authentic records
  await prisma.$executeRawUnsafe(`
    INSERT INTO expenses (id, expense_type_id, expense_amount, date, expense_details, user_id, created_at, updated_at)
    VALUES 
    (101, 101, 18500.00, '2026-10-28', 'Monthly electric grid bill and generator diesel fuel for sheds', ${adminId}, NOW(), NOW()),
    (102, 102, 25000.00, '2026-10-28', 'Regular weekly wage distribution for shed & pond caretakers', ${adminId}, NOW(), NOW());
  `);

  // 7. Customers: Exactly 3 authentic poultry customers
  await prisma.$executeRawUnsafe(`
    DELETE FROM customers WHERE id NOT IN (101, 102, 103);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO customers (id, customer_id, customer_name, mobile, address_details, previous_due_amount, user_id)
    VALUES 
    (101, 'CUST-001', 'Al-Madina Poultry & Layer Farm', '01712345678', 'Gazipur Sadar, Gazipur', '15000.00', ${adminId}),
    (102, 'CUST-002', 'Bismillah Agro & Fisheries Project', '01898765432', 'Mymensingh Bypass Road, Mymensingh', '0.00', ${adminId}),
    (103, 'CUST-003', 'Shahjalal Broiler Trader & Retail', '01934567890', 'Uttara Sector-10, Dhaka', '15000.00', ${adminId})
    ON DUPLICATE KEY UPDATE customer_name = VALUES(customer_name), mobile = VALUES(mobile);
  `);

  // 8. Suppliers: Exactly 3 authentic suppliers
  await prisma.$executeRawUnsafe(`
    DELETE FROM suppliers WHERE id NOT IN (101, 102, 103);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO suppliers (id, supplier_id, name, company, mobile, address, purchase_payable_amount, status, user_id)
    VALUES 
    (101, 'SUP-001', 'Kazi Farms Group Ltd.', 'Kazi Farms Group', '01711002233', 'Dhanmondi, Dhaka', '80000.00', 'active', ${adminId}),
    (102, 'SUP-002', 'CP Bangladesh Co. Ltd.', 'CP Bangladesh', '01811223344', 'Mohakhali DOHS, Dhaka', '45000.00', 'active', ${adminId}),
    (103, 'SUP-003', 'Nourish Poultry & Hatchery Ltd.', 'Nourish Poultry', '01911334455', 'Gulshan-1, Dhaka', '0.00', 'active', ${adminId})
    ON DUPLICATE KEY UPDATE name = VALUES(name), company = VALUES(company);
  `);

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("✓ Successfully trimmed all modules to 2-3 authentic poultry records!");

  await prisma.$disconnect();
}

main().catch(console.error);
