import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ods = await prisma.$queryRawUnsafe("SELECT id, order_id, product_id, quantity, price FROM order_details;");
  console.log("Existing order_details:", ods);

  const admin = await prisma.users.findFirst({ select: { id: true } });
  const adminId = admin ? admin.id : 1n;

  // Let's ensure order_details for order 101 and 102 point to our authentic poultry products (101, 103, 105)
  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0;");
  await prisma.$executeRawUnsafe("DELETE FROM order_details;");

  // Order 101: 20 bags Broiler feed (product 101 @ 3450 = 69,000) + 300 eggs (product 103 @ 11.50 = 3,450) -> Total 72,450
  await prisma.$executeRawUnsafe(`
    INSERT INTO order_details (id, order_id, product_id, quantity, price, selling_price, user_id, stock_lifecycle_state)
    VALUES 
    (101, 101, 101, '20.00', '3450.00', '3450.00', ${adminId}, 'DEDUCTED_AT_INVOICE'),
    (102, 101, 103, '300.00', '11.50', '11.50', ${adminId}, 'DEDUCTED_AT_INVOICE');
  `);

  // Order 102: 150 kg Rui Fish (product 105 @ 280 = 42,000)
  await prisma.$executeRawUnsafe(`
    INSERT INTO order_details (id, order_id, product_id, quantity, price, selling_price, user_id, stock_lifecycle_state)
    VALUES 
    (103, 102, 105, '150.00', '280.00', '280.00', ${adminId}, 'DEDUCTED_AT_INVOICE');
  `);

  await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1;");
  console.log("Successfully re-linked order_details to authentic poultry products!");

  // Verify
  const orders = await prisma.orders.findMany({
    include: {
      customers: true,
      order_details: {
        include: { products: true }
      }
    }
  });

  console.log(`Orders loaded: ${orders.length}`);
  orders.forEach(o => {
    console.log(`- Order #${o.order_no} | Customer: ${o.customers?.customer_name} | SubTotal: ${o.sub_total}`);
    o.order_details.forEach(item => {
      console.log(`    Item: ${item.products?.product_name} | Qty: ${item.quantity} | Unit Price: ${item.price}`);
    });
  });

  await prisma.$disconnect();
}

main().catch(console.error);
