import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.categories.findMany({ select: { id: true, category_name: true } });
  console.log("Categories:", cats);

  const brands = await prisma.brands.findMany({ select: { id: true, name: true } });
  console.log("Brands:", brands);

  const units = await prisma.units.findMany({ select: { id: true, unit_name: true } });
  console.log("Units:", units);

  // Check admin user
  const admin = await prisma.users.findFirst({ select: { id: true, name: true } });
  console.log("Admin user:", admin);

  const adminId = admin ? admin.id : 1;

  // Insert 8 authentic poultry products
  const productsToInsert = [
    {
      id: 101,
      product_name: "Kazi Broiler Grower Feed (50kg Bag)",
      product_code: ["FEED-BR-50K"],
      category_id: 101, // Poultry Feed
      brand_id: 101,    // Kazi Farms Group
      unit_id: 101,     // Bag
      cost_price: "3250.00",
      sell_price: "3450.00",
      quantity: "150",
      status: "active",
      user_id: adminId,
    },
    {
      id: 102,
      product_name: "CP Layer Starter Feed (50kg Bag)",
      product_code: ["FEED-LY-50K"],
      category_id: 101, // Poultry Feed
      brand_id: 102,    // CP Bangladesh
      unit_id: 101,     // Bag
      cost_price: "3100.00",
      sell_price: "3300.00",
      quantity: "120",
      status: "active",
      user_id: adminId,
    },
    {
      id: 103,
      product_name: "Brown Table Eggs - Grade A (Large)",
      product_code: ["EGG-BR-GRA"],
      category_id: 102, // Poultry Eggs
      brand_id: 103,    // Nourish Poultry & Hatchery
      unit_id: 103,     // Piece
      cost_price: "9.50",
      sell_price: "11.50",
      quantity: "2500",
      status: "active",
      user_id: adminId,
    },
    {
      id: 104,
      product_name: "White Table Eggs - Grade B (Medium)",
      product_code: ["EGG-WH-GRB"],
      category_id: 102, // Poultry Eggs
      brand_id: 105,    // Paragon Feed & Poultry
      unit_id: 103,     // Piece
      cost_price: "8.80",
      sell_price: "10.50",
      quantity: "1800",
      status: "active",
      user_id: adminId,
    },
    {
      id: 105,
      product_name: "Live Rui Fish (1.2 Kg - 1.5 Kg Size)",
      product_code: ["FISH-RUI-15"],
      category_id: 103, // Fisheries & Aqua
      brand_id: 101,    // Kazi Farms Group
      unit_id: 102,     // Kg
      cost_price: "220.00",
      sell_price: "280.00",
      quantity: "650",
      status: "active",
      user_id: adminId,
    },
    {
      id: 106,
      product_name: "Monosex Tilapia Fish (Medium Grade)",
      product_code: ["FISH-TIL-MD"],
      category_id: 103, // Fisheries & Aqua
      brand_id: 105,    // Paragon Feed & Poultry
      unit_id: 102,     // Kg
      cost_price: "140.00",
      sell_price: "190.00",
      quantity: "800",
      status: "active",
      user_id: adminId,
    },
    {
      id: 107,
      product_name: "Cobb 500 Broiler Day-Old Chicks (DOC)",
      product_code: ["DOC-COBB-500"],
      category_id: 104, // Day-Old Chicks
      brand_id: 101,    // Kazi Farms Group
      unit_id: 103,     // Piece
      cost_price: "45.00",
      sell_price: "55.00",
      quantity: "1000",
      status: "active",
      user_id: adminId,
    },
    {
      id: 108,
      product_name: "ACI Vitamino Plus (Feed Supplement 1L)",
      product_code: ["MED-VIT-1L"],
      category_id: 105, // Veterinary Medicine
      brand_id: 104,    // ACI Godrej Agrovet
      unit_id: 103,     // Piece
      cost_price: "480.00",
      sell_price: "580.00",
      quantity: "50",
      status: "active",
      user_id: adminId,
    },
  ];

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");
  for (const prod of productsToInsert) {
    await prisma.products.upsert({
      where: { id: prod.id },
      update: {
        product_name: prod.product_name,
        product_code: prod.product_code,
        category_id: prod.category_id,
        brand_id: prod.brand_id,
        unit_id: prod.unit_id,
        cost_price: prod.cost_price,
        sell_price: prod.sell_price,
        quantity: prod.quantity,
        status: prod.status,
        user_id: prod.user_id,
      },
      create: {
        id: prod.id,
        product_name: prod.product_name,
        product_code: prod.product_code,
        category_id: prod.category_id,
        brand_id: prod.brand_id,
        unit_id: prod.unit_id,
        cost_price: prod.cost_price,
        sell_price: prod.sell_price,
        quantity: prod.quantity,
        status: prod.status,
        user_id: prod.user_id,
      },
    });
    console.log(`Upserted product: ${prod.product_name}`);
  }
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");

  // Check Feed Products table if exists and insert
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO feed_products (id, product_id, feed_type, bag_size_kg, target_species, status, user_id)
      VALUES 
      (101, 101, 'pellet', 50.00, 'Broiler Chicken', 'active', ${adminId}),
      (102, 102, 'mash', 50.00, 'Layer Chicken', 'active', ${adminId})
      ON DUPLICATE KEY UPDATE product_id = VALUES(product_id), feed_type = VALUES(feed_type);
    `);
    console.log("Upserted feed_products.");
  } catch (e) {
    console.log("feed_products table note:", e.message);
  }

  // Verify full relation loading
  const loaded = await prisma.products.findMany({
    include: {
      categories: true,
      brands: true,
      units: true,
    },
  });
  console.log(`Successfully loaded ${loaded.length} products with relations.`);
  loaded.forEach(p => console.log(`- [${p.id}] ${p.product_name} | Cat: ${p.categories?.category_name} | Brand: ${p.brands?.name} | Unit: ${p.units?.unit_name}`));

  await prisma.$disconnect();
}

main().catch(console.error);
