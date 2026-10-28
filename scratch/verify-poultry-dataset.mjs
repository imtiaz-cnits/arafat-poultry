import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.users.findFirst({ select: { id: true } });
  const adminId = admin ? admin.id : 1n;

  // Insert feed_products
  await prisma.feed_products.upsert({
    where: { product_id: 101n },
    update: {
      feed_type: "Broiler Grower (Pellet)",
      target_type: "broiler",
      bag_weight_kg: 50.00,
      manufacturer: "Kazi Farms Group",
      protein_percent: 19.5,
      batch_no: "KZ-BR-2026-08",
      user_id: adminId,
    },
    create: {
      id: 101n,
      product_id: 101n,
      feed_type: "Broiler Grower (Pellet)",
      target_type: "broiler",
      bag_weight_kg: 50.00,
      manufacturer: "Kazi Farms Group",
      protein_percent: 19.5,
      batch_no: "KZ-BR-2026-08",
      user_id: adminId,
    },
  });

  await prisma.feed_products.upsert({
    where: { product_id: 102n },
    update: {
      feed_type: "Layer Starter (Mash)",
      target_type: "layer",
      bag_weight_kg: 50.00,
      manufacturer: "CP Bangladesh",
      protein_percent: 18.0,
      batch_no: "CP-LY-2026-12",
      user_id: adminId,
    },
    create: {
      id: 102n,
      product_id: 102n,
      feed_type: "Layer Starter (Mash)",
      target_type: "layer",
      bag_weight_kg: 50.00,
      manufacturer: "CP Bangladesh",
      protein_percent: 18.0,
      batch_no: "CP-LY-2026-12",
      user_id: adminId,
    },
  });

  console.log("Feed products upserted successfully.");

  // Check purchases
  const purchases = await prisma.purchases.findMany({
    include: {
      suppliers: true,
      purchase_order_details: {
        include: { products: true }
      }
    }
  });
  console.log(`Purchases count: ${purchases.length}`);
  purchases.forEach(p => {
    console.log(`- Purchase ID: ${p.purchase_id} | Supplier: ${p.suppliers?.supplier_name} | Total: ${p.grand_subtotal}`);
    p.purchase_order_details.forEach(item => {
      console.log(`   Item: ${item.products?.product_name} | Qty: ${item.quantity} | Cost: ${item.cost_price}`);
    });
  });

  // Check orders
  const orders = await prisma.orders.findMany({
    include: {
      customers: true,
      order_details: {
        include: { products: true }
      }
    }
  });
  console.log(`Orders count: ${orders.length}`);
  orders.forEach(o => {
    console.log(`- Order: ${o.order_number} | Customer: ${o.customers?.customer_name} | Total: ${o.subtotal}`);
    o.order_details.forEach(item => {
      console.log(`   Item: ${item.products?.product_name} | Qty: ${item.quantity} | Price: ${item.price}`);
    });
  });

  // Check Flocks
  const flocks = await prisma.poultry_flocks.findMany();
  console.log(`Flocks count: ${flocks.length}`);
  flocks.forEach(f => console.log(`- Flock: ${f.flock_code} | Shed: ${f.shed_name} | Breed: ${f.breed} | Birds: ${f.current_birds_count}`));

  // Check Egg Collections
  const collections = await prisma.egg_collections.findMany();
  console.log(`Egg Collections count: ${collections.length}`);
  collections.forEach(e => console.log(`- Collection: ${e.collection_no} | Total: ${e.total_collected} | Accepted: ${e.accepted_quantity}`));

  // Check Fish Ponds & Batches
  const ponds = await prisma.fish_ponds.findMany({ include: { fish_batches: true } });
  console.log(`Fish Ponds count: ${ponds.length}`);
  ponds.forEach(p => {
    console.log(`- Pond: ${p.pond_name} (${p.pond_code}) | Area: ${p.area_decimal} dec`);
    p.fish_batches.forEach(b => console.log(`   Batch: ${b.batch_no} | Stocking: ${b.fingerling_count} | Est Biomass: ${b.estimated_biomass_kg}kg`));
  });

  // Check Expenses
  const expenses = await prisma.expenses.findMany({ include: { expense_types: true } });
  console.log(`Expenses count: ${expenses.length}`);
  expenses.forEach(e => console.log(`- Expense: ${e.expense_types?.type_name} | Amount: ${e.amount} | Purpose: ${e.purpose}`));

  await prisma.$disconnect();
}

main().catch(console.error);
