import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.orders.findMany({
    orderBy: { id: "desc" },
    include: { customers: true },
  });
  console.log("Orders in arafat_poultry_db:", orders.map(o => ({
    id: o.id,
    order_no: o.order_no,
    customer: o.customers?.customer_name,
    sub_total: o.sub_total,
    paid: o.paid_amount,
    due: o.due_amount,
    note: o.order_note,
  })));

  await prisma.$disconnect();
}

main().catch(console.error);
