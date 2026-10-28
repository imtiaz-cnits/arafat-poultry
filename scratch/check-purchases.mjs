import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const purchases = await prisma.purchases.findMany({
    orderBy: { id: "desc" },
    include: { suppliers: true },
  });
  console.log("Purchases in arafat_poultry_db:", purchases.map(p => ({
    id: p.id,
    purchase_id: p.purchase_id,
    supplier: p.suppliers?.name,
    company: p.suppliers?.company,
    grand_subtotal: p.grand_subtotal,
    paid: p.paid_amount,
    due: p.due_amount,
  })));

  await prisma.$disconnect();
}

main().catch(console.error);
