import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding authentic Arafat Poultry & Fisheries data into `arafat_poultry_db`...");

  // 1. Get or create Admin user
  let admin = await prisma.users.findFirst({ where: { role: "admin" } });
  if (!admin) {
    const passwordHash = await bcrypt.hash("admin123456", 10);
    admin = await prisma.users.create({
      data: {
        name: "MD. Arafat Hossain",
        email: "admin@arafatpoultry.com",
        mobile: "01711000000",
        password: passwordHash,
        role: "admin",
        status: "approved",
        otp: "000000",
      },
    });
  }
  const adminId = admin.id;

  // 2. Staff Members
  const staffHash = await bcrypt.hash("123456", 10);
  await prisma.$executeRawUnsafe(`
    INSERT INTO users (id, name, email, mobile, role, password, status, otp, created_at, updated_at)
    VALUES 
      (101, 'Md. Belal Hossain', 'belal@arafatpoultry.com', '01733112233', 'staff', '${staffHash}', 'approved', '000000', NOW(), NOW()),
      (102, 'Abul Kashem', 'kashem@arafatpoultry.com', '01844334455', 'staff', '${staffHash}', 'approved', '000000', NOW(), NOW())
    ON DUPLICATE KEY UPDATE name=VALUES(name), mobile=VALUES(mobile);
  `);

  // 3. Units
  await prisma.$executeRawUnsafe(`
    INSERT INTO units (id, unit_name, status, user_id, created_at, updated_at)
    VALUES 
      (101, 'Bag', 'active', ${adminId}, NOW(), NOW()),
      (102, 'Kg', 'active', ${adminId}, NOW(), NOW()),
      (103, 'Piece', 'active', ${adminId}, NOW(), NOW()),
      (104, 'Dozen', 'active', ${adminId}, NOW(), NOW()),
      (105, 'Tray', 'active', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE unit_name=VALUES(unit_name);
  `);

  // 4. Categories
  await prisma.$executeRawUnsafe(`
    INSERT INTO categories (id, category_name, status, user_id, created_at, updated_at)
    VALUES 
      (101, 'Poultry Feed', 'active', ${adminId}, NOW(), NOW()),
      (102, 'Poultry Eggs', 'active', ${adminId}, NOW(), NOW()),
      (103, 'Fisheries & Aqua', 'active', ${adminId}, NOW(), NOW()),
      (104, 'Day-Old Chicks', 'active', ${adminId}, NOW(), NOW()),
      (105, 'Veterinary Medicine', 'active', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);
  `);

  // 5. Brands
  await prisma.$executeRawUnsafe(`
    INSERT INTO brands (id, name, status, user_id, created_at, updated_at)
    VALUES 
      (101, 'Kazi Farms Group', 'active', ${adminId}, NOW(), NOW()),
      (102, 'CP Bangladesh', 'active', ${adminId}, NOW(), NOW()),
      (103, 'Nourish Poultry & Hatchery', 'active', ${adminId}, NOW(), NOW()),
      (104, 'ACI Godrej Agrovet', 'active', ${adminId}, NOW(), NOW()),
      (105, 'Paragon Feed & Poultry', 'active', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE name=VALUES(name);
  `);

  // 6. Suppliers
  await prisma.$executeRawUnsafe(`
    INSERT INTO suppliers (id, supplier_id, name, company, mobile, address, status, purchase_payable_amount, user_id, created_at, updated_at)
    VALUES 
      (101, 'SUP-KAZI-01', 'Kazi Farms Feeds & Hatchery Ltd.', 'Kazi Group Bangladesh', '01711234567', 'Gazipur Feed Plant & Regional Depot', 'active', '125000.00', ${adminId}, NOW(), NOW()),
      (102, 'SUP-CP-02', 'CP Bangladesh Feed Mill Division', 'Charoen Pokphand Group', '01819876543', 'Valuka Mymensingh Feed Industrial Area', 'active', '0.00', ${adminId}, NOW(), NOW()),
      (103, 'SUP-NOUR-03', 'Nourish Hatchery & Parent Stock', 'Nourish Agro Ltd.', '01912345678', 'Mirzapur Tangail Breeding Facility', 'active', '0.00', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE name=VALUES(name), mobile=VALUES(mobile);
  `);

  // 7. Customers
  await prisma.$executeRawUnsafe(`
    INSERT INTO customers (id, customer_id, customer_name, mobile, address_details, previous_due_amount, user_id, created_at, updated_at)
    VALUES 
      (101, 'CUST-MADINA-01', 'Al-Madina Poultry & Layer Farm', '01712345678', 'Kapasia, Gazipur', '22450.00', ${adminId}, NOW(), NOW()),
      (102, 'CUST-BISM-02', 'Bismillah Agro & Fisheries Project', '01823456789', 'Gopalpur, Tangail', '0.00', ${adminId}, NOW(), NOW()),
      (103, 'CUST-SHAH-03', 'Shahjalal Broiler Trader & Retail', '01934567890', 'Uttara Sector-10, Dhaka', '15000.00', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name), mobile=VALUES(mobile);
  `);

  // 8. Products & Feed Products
  await prisma.$executeRawUnsafe(`
    INSERT INTO products (id, product_name, product_code, cost_price, sell_price, quantity, category_id, brand_id, unit_id, status, user_id, created_at, updated_at)
    VALUES 
      (101, 'Kazi Broiler Grower Feed (50kg Bag)', '["FEED-KZ-BG50"]', '3250.00', '3450.00', '150', 101, 101, 101, 'active', ${adminId}, NOW(), NOW()),
      (102, 'CP Layer Starter Feed (50kg Bag)', '["FEED-CP-LS50"]', '3100.00', '3300.00', '120', 101, 102, 101, 'active', ${adminId}, NOW(), NOW()),
      (103, 'Brown Table Eggs - Grade A (Large)', '["EGG-BR-GR-A"]', '9.50', '11.50', '2500', 102, 103, 103, 'active', ${adminId}, NOW(), NOW()),
      (104, 'White Table Eggs - Grade B (Medium)', '["EGG-WH-GR-B"]', '8.80', '10.50', '1800', 102, 105, 103, 'active', ${adminId}, NOW(), NOW()),
      (105, 'Live Rui Fish (1.2 Kg - 1.5 Kg Size)', '["FISH-RUI-MED"]', '220.00', '280.00', '650', 103, 101, 102, 'active', ${adminId}, NOW(), NOW()),
      (106, 'Monosex Tilapia Fish (Medium Grade)', '["FISH-TLP-MED"]', '140.00', '190.00', '800', 103, 105, 102, 'active', ${adminId}, NOW(), NOW()),
      (107, 'Cobb 500 Broiler Day-Old Chicks (DOC)', '["DOC-CB-500"]', '45.00', '55.00', '1000', 104, 101, 103, 'active', ${adminId}, NOW(), NOW()),
      (108, 'ACI Vitamino Plus (Feed Supplement 1L)', '["MED-ACI-VIT1L"]', '480.00', '580.00', '50', 105, 104, 103, 'active', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE product_name=VALUES(product_name), cost_price=VALUES(cost_price), sell_price=VALUES(sell_price), quantity=VALUES(quantity);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO feed_products (product_id, bag_weight_kg, feed_type, target_type, user_id, created_at, updated_at)
    VALUES 
      (101, 50, 'BROILER_GROWER', 'POULTRY', ${adminId}, NOW(), NOW()),
      (102, 50, 'LAYER_STARTER', 'POULTRY', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE bag_weight_kg=VALUES(bag_weight_kg);
  `);

  // 9. Purchases
  await prisma.$executeRawUnsafe(`
    INSERT INTO purchases (id, purchase_id, supplier_id, grand_subtotal, paid_amount, due_amount, purchase_payable_amount, date, referance_no, user_id, created_at, updated_at)
    VALUES 
      (101, 'PUR-20261028-8811', 101, '325000.00', '200000.00', '125000.00', '125000.00', NOW(), 'MEMO-KZ-7721', ${adminId}, NOW(), NOW()),
      (102, 'PUR-20261028-8822', 102, '248000.00', '248000.00', '0.00', '0.00', NOW(), 'INV-CP-5541', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE purchase_id=VALUES(purchase_id);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO purchase_order_details (id, purchase_id, product_id, quantity, cost_price, subtotal, user_id, created_at, updated_at)
    VALUES 
      (101, 101, 101, '100.00', '3250.00', '325000.00', ${adminId}, NOW(), NOW()),
      (102, 102, 102, '80.00', '3100.00', '248000.00', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO purchase_payment_details (id, purchases_id, paid_amount, payment_method, payment_status, transaction_id, purchase_due_collection_date, user_id, created_at, updated_at)
    VALUES 
      (101, 101, '200000.00', 'Bank', 'Partial', 'IBBL-TXN-90214', NOW(), ${adminId}, NOW(), NOW()),
      (102, 102, '248000.00', 'Cash', 'Paid', 'CASH-REC-0012', NOW(), ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE paid_amount=VALUES(paid_amount);
  `);

  // 10. Orders (Invoices)
  await prisma.$executeRawUnsafe(`
    INSERT INTO orders (id, order_no, customer_id, sub_total, delivery_charge, discount_amount, paid_amount, due_amount, previous_due_amount, order_note, invoice_date, user_id, challan_status, created_at, updated_at)
    VALUES 
      (101, 'ORD-20261028-7101', 101, 72450.00, 500.00, 500.00, 50000.00, 22450.00, 0.00, '20 bags Broiler feed & 10 trays fresh eggs delivery', NOW(), ${adminId}, 'NOT_REQUIRED', NOW(), NOW()),
      (102, 'ORD-20261028-7202', 102, 42000.00, 0.00, 0.00, 42000.00, 0.00, 0.00, '150 kg fresh harvested Rui fish dispatch', NOW(), ${adminId}, 'NOT_REQUIRED', NOW(), NOW())
    ON DUPLICATE KEY UPDATE order_no=VALUES(order_no);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO order_details (id, order_id, product_id, quantity, price, selling_price, user_id, stock_lifecycle_state, created_at, updated_at)
    VALUES 
      (101, 101, 101, '20.00', '3250.00', '3450.00', ${adminId}, 'DEDUCTED_AT_INVOICE', NOW(), NOW()),
      (102, 101, 103, '300.00', '9.50', '11.50', ${adminId}, 'DEDUCTED_AT_INVOICE', NOW(), NOW()),
      (103, 102, 105, '150.00', '220.00', '280.00', ${adminId}, 'DEDUCTED_AT_INVOICE', NOW(), NOW())
    ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO order_payment_details (id, order_id, paid_amount, payment_method, payment_status, user_id, created_at, updated_at)
    VALUES 
      (101, 101, 50000.00, 'Cash', 'Partial Paid', ${adminId}, NOW(), NOW()),
      (102, 102, 42000.00, 'Bank', 'Paid', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE paid_amount=VALUES(paid_amount);
  `);

  // 11. Flocks & Egg Collections
  await prisma.$executeRawUnsafe(`
    INSERT INTO poultry_flocks (id, flock_code, shed_name, breed, initial_chicks_count, current_birds_count, housing_date, status, feed_consumed_kg, total_expenses, note, user_id, created_at, updated_at)
    VALUES 
      (101, 'FLK-HYLINE-01', 'Shed #1 - Hy-Line Layer Shed', 'Hy-Line Brown', 5000, 4920, DATE_SUB(NOW(), INTERVAL 60 DAY), 'ACTIVE', 12500.00, 185000.00, 'Commercial egg production layer flock 1', ${adminId}, NOW(), NOW()),
      (102, 'FLK-NOVOGEN-02', 'Shed #2 - Novogen White Shed', 'Novogen White', 4200, 4150, DATE_SUB(NOW(), INTERVAL 90 DAY), 'ACTIVE', 9800.00, 142000.00, 'Commercial egg production layer flock 2', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE shed_name=VALUES(shed_name);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO egg_collections (id, collection_no, flock_id, collection_date, total_collected, rejected_breakage, accepted_quantity, allocated_expenses, cost_per_accepted_egg, status, note, user_id, created_at, updated_at)
    VALUES 
      (101, 'COL-20261028-001', 101, NOW(), 4650, 150, 4500, 42750.00, 9.50, 'FINALIZED', 'Daily morning & evening egg collection from Shed 1', ${adminId}, NOW(), NOW()),
      (102, 'COL-20261028-002', 102, NOW(), 3800, 80, 3720, 32736.00, 8.80, 'FINALIZED', 'Daily collection from Shed 2', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE total_collected=VALUES(total_collected);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO egg_collection_grades (id, collection_id, product_id, grade_name, quantity_pieces, tray_capacity, trays_equivalent, unit_cost, total_cost, created_at)
    VALUES 
      (101, 101, 103, 'GRADE_A', 3850, 30, 128.33, 9.50, 36575.00, NOW()),
      (102, 101, 104, 'GRADE_B', 650, 30, 21.67, 8.80, 5720.00, NOW()),
      (103, 102, 103, 'GRADE_A', 3200, 30, 106.67, 9.50, 30400.00, NOW()),
      (104, 102, 104, 'GRADE_B', 520, 30, 17.33, 8.80, 4576.00, NOW())
    ON DUPLICATE KEY UPDATE quantity_pieces=VALUES(quantity_pieces);
  `);

  // 12. Fish Species & Ponds & Batches
  await prisma.$executeRawUnsafe(`
    INSERT INTO fish_species (id, species_name, scientific_name, default_culture_days, created_at, updated_at)
    VALUES 
      (101, 'Rui (Labeo rohita)', 'Labeo rohita', 240, NOW(), NOW()),
      (102, 'Monosex Tilapia', 'Oreochromis niloticus', 120, NOW(), NOW())
    ON DUPLICATE KEY UPDATE species_name=VALUES(species_name);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO fish_ponds (id, pond_code, pond_name, area_decimal, water_depth_feet, location, status, note, user_id, created_at, updated_at)
    VALUES 
      (101, 'POND-A-NORTH', 'Pond A - North Commercial Aqua Lake', 180.00, 6.50, 'North Farm Lake Section', 'ACTIVE', 'Deep culture pond for major carps', ${adminId}, NOW(), NOW()),
      (102, 'POND-B-SOUTH', 'Pond B - South Tilapia Growth Pond', 120.00, 5.00, 'South Compound Section', 'ACTIVE', 'High-density tilapia culture pond', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE pond_name=VALUES(pond_name);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO fish_batches (id, batch_no, pond_id, species_id, product_id, stocking_date, fingerling_count, fingerling_unit_cost, fingerling_total_cost, total_mortality_count, current_fish_count, latest_avg_weight_g, estimated_biomass_kg, accumulated_feed_cost, accumulated_other_expenses, total_harvested_count, total_harvested_kg, total_harvested_cost, status, note, user_id, created_at, updated_at)
    VALUES 
      (101, 'BATCH-RUI-2026-A', 101, 101, 105, DATE_SUB(NOW(), INTERVAL 120 DAY), 8000, 6.00, 48000.00, 150, 7350, 1350.00, 9922.50, 125000.00, 27000.00, 500, 650.00, 143000.00, 'ACTIVE', 'Semi-intensive commercial Rui batch', ${adminId}, NOW(), NOW()),
      (102, 'BATCH-TLP-2026-B', 102, 102, 106, DATE_SUB(NOW(), INTERVAL 60 DAY), 16000, 2.00, 32000.00, 600, 15400, 320.00, 4928.00, 95000.00, 18000.00, 0, 0.00, 0.00, 'ACTIVE', 'Monosex Tilapia fast growth batch', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE batch_no=VALUES(batch_no);
  `);

  // 13. Expense Types & Expenses
  await prisma.$executeRawUnsafe(`
    INSERT INTO expense_types (id, type_name, status, user_id, created_at, updated_at)
    VALUES 
      (101, 'Farm Electricity & Generator Diesel', 'active', ${adminId}, NOW(), NOW()),
      (102, 'Farm Labor & Worker Wages', 'active', ${adminId}, NOW(), NOW()),
      (103, 'Pond Maintenance, Lime & Water Quality', 'active', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE type_name=VALUES(type_name);
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO expenses (id, expense_type_id, staff_id, expense_amount, expense_details, date, user_id, created_at, updated_at)
    VALUES 
      (101, 101, 101, 14500.00, 'Monthly rural electrification board bill for farm sheds & aeration', CURRENT_DATE(), ${adminId}, NOW(), NOW()),
      (102, 102, 102, 9000.00, 'Shed worker weekly wages and feeding allowance', CURRENT_DATE(), ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE expense_amount=VALUES(expense_amount);
  `);

  // 14. Financial Accounts
  await prisma.$executeRawUnsafe(`
    INSERT INTO financial_accounts (id, account_name, account_type, balance, status, user_id, created_at, updated_at)
    VALUES 
      (1, 'Main Farm Cash Drawer', 'CASH', 545000.00, 'active', ${adminId}, NOW(), NOW()),
      (2, 'Islami Bank Bangladesh Ltd (A/C: 205011...)', 'BANK', 1250000.00, 'active', ${adminId}, NOW(), NOW()),
      (3, 'bKash Merchant Account (017...)', 'MFS', 85000.00, 'active', ${adminId}, NOW(), NOW())
    ON DUPLICATE KEY UPDATE account_name=VALUES(account_name), balance=VALUES(balance);
  `);

  console.log("✓ All dynamic poultry & fisheries records seeded successfully into `arafat_poultry_db`!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
