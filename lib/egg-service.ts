import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { recordStockMovement } from "@/lib/stock-service";
import { recordPartyTransaction } from "@/lib/party-ledger-service";
import { recordFinancialTransaction, getAccountByPaymentMethod } from "@/lib/financial-service";
import { logAudit } from "@/lib/audit-service";
import { convertEggUnits } from "@/lib/unit-service";

export interface GradeAllocation {
  productId: bigint | number;
  gradeName: string;
  quantityPieces: number;
  trayCapacity?: number;
}

export interface RecordEggCollectionParams {
  flockId: bigint | number;
  totalCollected: number;
  rejectedBreakage: number;
  allocatedExpenses?: number; // total feed + medicine + labor cost for this collection batch
  date?: Date;
  grades: GradeAllocation[];
  note?: string | null;
  userId: bigint | number;
}

export interface RegradeEggsParams {
  sourceProductId: bigint | number;
  destinationProductId: bigint | number;
  quantityPieces: number;
  date?: Date;
  note?: string | null;
  userId: bigint | number;
}

export interface RecordEggSaleParams {
  customerId: bigint | number;
  productId: bigint | number;
  quantity: number;
  unit: "piece" | "dozen" | "tray";
  trayCapacity?: number;
  unitPrice: number; // price per selected unit (e.g. per piece or per tray)
  paidAmount?: number;
  paymentMethod?: string;
  date?: Date;
  note?: string | null;
  userId: bigint | number;
}

export interface RecordEggSaleReturnParams {
  customerId: bigint | number;
  productId: bigint | number;
  quantity: number;
  unit: "piece" | "dozen" | "tray";
  trayCapacity?: number;
  returnPrice: number;
  refundPaid?: number;
  paymentMethod?: string;
  date?: Date;
  note?: string | null;
  userId: bigint | number;
}

function generateCollectionNo(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `EGG-${dateStr}-${suffix}`;
}

function generateRegradeNo(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `REG-${dateStr}-${suffix}`;
}

/**
 * Record Daily Egg Collection with Grade Categorization & Cost Allocation
 */
export async function recordEggCollection(params: RecordEggCollectionParams) {
  const totalCollected = Math.max(0, Math.floor(Number(params.totalCollected || 0)));
  const rejectedBreakage = Math.max(0, Math.floor(Number(params.rejectedBreakage || 0)));
  const allocatedExpenses = Math.max(0, Number(params.allocatedExpenses || 0));
  const collDate = params.date || new Date();

  if (totalCollected <= 0) {
    throw new Error("মোট সংগৃহীত ডিমের সংখ্যা অবশ্যই ০-এর বেশি হতে হবে (Total collected eggs must be greater than 0)");
  }
  if (rejectedBreakage < 0) {
    throw new Error("ভাঙা বা প্রত্যাখ্যাত ডিম ঋণাত্মক হতে পারে না (Rejected breakage cannot be negative)");
  }
  if (rejectedBreakage > totalCollected) {
    throw new Error("প্রত্যাখ্যাত ডিমের সংখ্যা মোট ডিমের চেয়ে বেশি হতে পারে না (Rejected eggs cannot exceed total collected)");
  }

  const acceptedQuantity = totalCollected - rejectedBreakage;

  if (!params.grades || params.grades.length === 0) {
    throw new Error("ন্যূনতম একটি গ্রেড নির্ধারণ করতে হবে (At least one egg grade must be specified)");
  }

  // Calculate sum of grade quantities
  let totalGradePieces = 0;
  for (const g of params.grades) {
    const q = Math.max(0, Math.floor(Number(g.quantityPieces || 0)));
    totalGradePieces += q;
  }

  if (totalGradePieces !== acceptedQuantity) {
    throw new Error(
      `গ্রেডের মোট ডিমের সংখ্যা (${totalGradePieces}) গ্রহণযোগ্য ডিমের সংখ্যার (${acceptedQuantity}) সমান হতে হবে`
    );
  }

  // Cost per accepted egg
  const costPerAcceptedEgg = acceptedQuantity > 0 ? allocatedExpenses / acceptedQuantity : 0;
  const collectionCode = generateCollectionNo();

  return prisma.$transaction(async (tx) => {
    const flockId = BigInt(params.flockId);
    const flock = await tx.poultry_flocks.findUnique({ where: { id: flockId } });
    if (!flock) {
      throw new Error(`পোল্ট্রি ফ্লক পাওয়া যায়নি (Flock with ID ${flockId} not found)`);
    }

    // Get EGG business unit
    const eggBu = await tx.business_units.findUnique({ where: { code: "EGG" } });

    // 1. Create egg_collections record
    const collection = await tx.egg_collections.create({
      data: {
        collection_no: collectionCode,
        flock_id: flockId,
        collection_date: collDate,
        total_collected: totalCollected,
        rejected_breakage: rejectedBreakage,
        accepted_quantity: acceptedQuantity,
        allocated_expenses: new Prisma.Decimal(allocatedExpenses.toFixed(2)),
        cost_per_accepted_egg: new Prisma.Decimal(costPerAcceptedEgg.toFixed(4)),
        status: "COMPLETED",
        note: params.note || null,
        user_id: BigInt(params.userId),
      },
    });

    // 2. Process each grade allocation
    const gradeResults = [];
    for (const g of params.grades) {
      const prodId = BigInt(g.productId);
      const pieces = Math.floor(Number(g.quantityPieces || 0));
      if (pieces <= 0) continue;

      const trayCap = Number(g.trayCapacity || 30);
      const trays = pieces / trayCap;
      const totalGradeCost = pieces * costPerAcceptedEgg;

      // Inward movement for grade product
      const stockRes = await recordStockMovement(
        {
          productId: prodId,
          businessUnitId: eggBu?.id,
          movementType: "HARVEST_INWARD",
          quantity: pieces, // stock stored in pieces
          unitPrice: costPerAcceptedEgg,
          referenceType: "EGG_COLLECTION",
          referenceId: collection.id,
          referenceNo: collectionCode,
          date: collDate,
          note: `Egg Collection ${collectionCode}: ${pieces} pcs (${trays.toFixed(2)} trays) [${g.gradeName}]`,
          userId: params.userId,
        },
        tx
      );

      // Create egg_collection_grades record
      const gradeEntry = await tx.egg_collection_grades.create({
        data: {
          collection_id: collection.id,
          product_id: prodId,
          grade_name: g.gradeName,
          quantity_pieces: pieces,
          tray_capacity: trayCap,
          trays_equivalent: new Prisma.Decimal(trays.toFixed(2)),
          unit_cost: new Prisma.Decimal(costPerAcceptedEgg.toFixed(4)),
          total_cost: new Prisma.Decimal(totalGradeCost.toFixed(2)),
        },
      });

      gradeResults.push({
        gradeName: g.gradeName,
        pieces,
        trays,
        newStock: stockRes.newStock,
      });
    }

    // 3. Update flock cumulative expenses
    if (allocatedExpenses > 0) {
      await tx.poultry_flocks.update({
        where: { id: flockId },
        data: {
          total_expenses: { increment: allocatedExpenses },
        },
      });
    }

    // 4. Audit Log
    await logAudit(
      {
        userId: params.userId,
        action: "CREATE",
        entityType: "EGG_COLLECTION",
        entityId: String(collection.id),
        newValues: {
          collection_no: collectionCode,
          total_collected: totalCollected,
          rejected: rejectedBreakage,
          accepted: acceptedQuantity,
          cost_per_egg: costPerAcceptedEgg,
        },
      },
      tx
    );

    return {
      success: true,
      collectionId: collection.id,
      collectionNo: collectionCode,
      totalCollected,
      rejectedBreakage,
      acceptedQuantity,
      costPerAcceptedEgg,
      grades: gradeResults,
    };
  });
}

/**
 * Regrading Engine: Reassigns egg inventory between grades.
 * Strictly guarantees that total eggs across all grades is conserved.
 */
export async function regradeEggs(params: RegradeEggsParams) {
  const pieces = Math.max(0, Math.floor(Number(params.quantityPieces || 0)));
  const regradeDate = params.date || new Date();
  const sourceId = BigInt(params.sourceProductId);
  const destId = BigInt(params.destinationProductId);

  if (pieces <= 0) {
    throw new Error("স্থানান্তরযোগ্য ডিমের সংখ্যা অবশ্যই ০-এর বেশি হতে হবে");
  }
  if (sourceId === destId) {
    throw new Error("একই গ্রেডে রূপান্তর করা যাবে না (Source and destination grade cannot be identical)");
  }

  const regradeCode = generateRegradeNo();

  return prisma.$transaction(async (tx) => {
    const eggBu = await tx.business_units.findUnique({ where: { code: "EGG" } });

    // Fetch products
    const [sourceProd, destProd] = await Promise.all([
      tx.products.findUnique({ where: { id: sourceId } }),
      tx.products.findUnique({ where: { id: destId } }),
    ]);

    if (!sourceProd || !destProd) {
      throw new Error("গ্রেড পণ্য পাওয়া যায়নি");
    }

    const currentSourceStock = parseFloat(sourceProd.quantity || "0");
    if (pieces > currentSourceStock) {
      throw new Error(
        `পর্যাপ্ত ডিম নেই। ${sourceProd.product_name}-এ বর্তমান মজুত: ${currentSourceStock}, চাওয়া হয়েছে: ${pieces}`
      );
    }

    const costPrice = parseFloat(sourceProd.cost_price || "0");

    // 1. Deduct from source grade
    const sourceMovement = await recordStockMovement(
      {
        productId: sourceId,
        businessUnitId: eggBu?.id,
        movementType: "SALE_OUTWARD", // outward transfer
        quantity: pieces,
        unitPrice: costPrice,
        referenceType: "ADJUSTMENT",
        referenceNo: regradeCode,
        date: regradeDate,
        note: `Regrade Outward: Transfer ${pieces} eggs to ${destProd.product_name}`,
        userId: params.userId,
      },
      tx
    );

    // 2. Inward to destination grade
    const destMovement = await recordStockMovement(
      {
        productId: destId,
        businessUnitId: eggBu?.id,
        movementType: "HARVEST_INWARD", // inward transfer
        quantity: pieces,
        unitPrice: costPrice,
        referenceType: "ADJUSTMENT",
        referenceNo: regradeCode,
        date: regradeDate,
        note: `Regrade Inward: Received ${pieces} eggs from ${sourceProd.product_name}`,
        userId: params.userId,
      },
      tx
    );

    // 3. Record in egg_regradings table
    const regradeRecord = await tx.egg_regradings.create({
      data: {
        regrade_no: regradeCode,
        source_product_id: sourceId,
        destination_product_id: destId,
        quantity_pieces: pieces,
        date: regradeDate,
        note: params.note || null,
        user_id: BigInt(params.userId),
      },
    });

    return {
      success: true,
      regradeNo: regradeCode,
      piecesRegraded: pieces,
      sourceProduct: sourceProd.product_name,
      destinationProduct: destProd.product_name,
      sourceRemainingStock: sourceMovement.newStock,
      destinationNewStock: destMovement.newStock,
    };
  });
}

/**
 * Record Commercial Egg Sale (Pieces, Dozens, or Trays)
 */
export async function recordEggSale(params: RecordEggSaleParams) {
  const prodId = BigInt(params.productId);
  const custId = BigInt(params.customerId);
  const qty = Number(params.quantity || 0);
  const unit = params.unit || "piece";
  const trayCap = Number(params.trayCapacity || 30);
  const saleDate = params.date || new Date();
  const unitPrice = Number(params.unitPrice || 0);

  if (qty <= 0) {
    throw new Error("বিক্রয় পরিমাণ অবশ্যই ০-এর বেশি হতে হবে");
  }

  // Convert quantity to exact pieces to deduct from physical stock
  const conversion = convertEggUnits(qty, unit, trayCap);
  const piecesToDeduct = conversion.pieces;
  const totalSaleAmount = qty * unitPrice;
  const paidNum = Math.max(0, Number(params.paidAmount || 0));
  const dueNum = Math.max(0, totalSaleAmount - paidNum);

  return prisma.$transaction(async (tx) => {
    const eggBu = await tx.business_units.findUnique({ where: { code: "EGG" } });

    // 1. Deduct exact pieces from the specific grade product
    const stockRes = await recordStockMovement(
      {
        productId: prodId,
        businessUnitId: eggBu?.id,
        movementType: "SALE_OUTWARD",
        quantity: piecesToDeduct,
        unitPrice: piecesToDeduct > 0 ? totalSaleAmount / piecesToDeduct : unitPrice,
        referenceType: "ORDER",
        date: saleDate,
        note: `Egg Sale: ${qty} ${unit} (${piecesToDeduct} pcs, ${conversion.trays} trays) @ ৳${unitPrice}/${unit}`,
        userId: params.userId,
      },
      tx
    );

    // 2. Customer Ledger Entry
    await recordPartyTransaction(
      {
        partyType: "CUSTOMER",
        customerId: custId,
        businessUnitId: eggBu?.id,
        transactionType: "INVOICE",
        referenceType: "ORDER",
        debit: totalSaleAmount,
        credit: paidNum,
        date: saleDate,
        note: `Egg Sale: ${qty} ${unit} (${piecesToDeduct} pcs)`,
        userId: params.userId,
      },
      tx
    );

    // 3. Financial Inflow if paid
    if (paidNum > 0) {
      const financialAccount = await getAccountByPaymentMethod(params.paymentMethod, tx);
      if (financialAccount) {
        await recordFinancialTransaction(
          {
            accountId: financialAccount.id,
            businessUnitId: eggBu?.id,
            transactionType: "INFLOW",
            amount: paidNum,
            referenceType: "SALE_PAYMENT",
            date: saleDate,
            note: `Payment for Egg Sale (${params.paymentMethod || "Cash"})`,
            userId: params.userId,
          },
          tx
        );
      }
    }

    return {
      success: true,
      unit,
      quantitySold: qty,
      piecesDeducted: piecesToDeduct,
      totalSaleAmount,
      paidAmount: paidNum,
      dueAmount: dueNum,
      remainingStockPieces: stockRes.newStock,
    };
  });
}

/**
 * Record Egg Customer Return (Damaged or Wrong Grade)
 */
export async function recordEggSaleReturn(params: RecordEggSaleReturnParams) {
  const prodId = BigInt(params.productId);
  const custId = BigInt(params.customerId);
  const qty = Number(params.quantity || 0);
  const unit = params.unit || "piece";
  const trayCap = Number(params.trayCapacity || 30);
  const returnDate = params.date || new Date();
  const returnPrice = Number(params.returnPrice || 0);

  const conversion = convertEggUnits(qty, unit, trayCap);
  const piecesToAdd = conversion.pieces;
  const totalReturnBill = qty * returnPrice;
  const refundPaid = Math.max(0, Number(params.refundPaid || 0));

  return prisma.$transaction(async (tx) => {
    const eggBu = await tx.business_units.findUnique({ where: { code: "EGG" } });

    // 1. Inward stock to grade product
    const stockRes = await recordStockMovement(
      {
        productId: prodId,
        businessUnitId: eggBu?.id,
        movementType: "SALE_RETURN_INWARD",
        quantity: piecesToAdd,
        unitPrice: piecesToAdd > 0 ? totalReturnBill / piecesToAdd : returnPrice,
        referenceType: "SALE_RETURN",
        date: returnDate,
        note: `Egg Return: ${qty} ${unit} (${piecesToAdd} pcs) returned by customer`,
        userId: params.userId,
      },
      tx
    );

    // 2. Customer Ledger
    await recordPartyTransaction(
      {
        partyType: "CUSTOMER",
        customerId: custId,
        businessUnitId: eggBu?.id,
        transactionType: "SALE_RETURN",
        referenceType: "SALE_RETURN",
        debit: refundPaid,
        credit: totalReturnBill,
        date: returnDate,
        note: `Egg Customer Return: ${qty} ${unit}`,
        userId: params.userId,
      },
      tx
    );

    // 3. Financial Outflow if cash refunded
    if (refundPaid > 0) {
      const financialAccount = await getAccountByPaymentMethod(params.paymentMethod, tx);
      if (financialAccount) {
        await recordFinancialTransaction(
          {
            accountId: financialAccount.id,
            businessUnitId: eggBu?.id,
            transactionType: "OUTFLOW",
            amount: refundPaid,
            referenceType: "REFUND_PAID",
            date: returnDate,
            note: `Refund paid for egg return (${params.paymentMethod || "Cash"})`,
            userId: params.userId,
          },
          tx
        );
      }
    }

    return {
      success: true,
      piecesReturned: piecesToAdd,
      totalReturnBill,
      refundPaid,
      remainingStockPieces: stockRes.newStock,
    };
  });
}

/**
 * Reverse an erroneous Egg Collection
 */
export async function reverseEggCollection(collectionId: bigint | number, userId: bigint | number, reason?: string) {
  const collId = BigInt(collectionId);

  return prisma.$transaction(async (tx) => {
    const collection = await tx.egg_collections.findUnique({
      where: { id: collId },
      include: { egg_collection_grades: true },
    });

    if (!collection) {
      throw new Error("ডিম সংগ্রহের রেকর্ড পাওয়া যায়নি");
    }
    if (collection.status === "REVERSED") {
      throw new Error("এই সংগ্রহ রেকর্ডটি আগেই রিভার্স করা হয়েছে");
    }

    const eggBu = await tx.business_units.findUnique({ where: { code: "EGG" } });

    // Reverse stock for each grade
    for (const g of collection.egg_collection_grades) {
      const pieces = g.quantity_pieces;
      await recordStockMovement(
        {
          productId: g.product_id,
          businessUnitId: eggBu?.id,
          movementType: "SALE_OUTWARD", // deduct previously added stock
          quantity: pieces,
          unitPrice: Number(g.unit_cost),
          referenceType: "ADJUSTMENT",
          referenceNo: `REV-${collection.collection_no}`,
          date: new Date(),
          note: `Reversal of Collection ${collection.collection_no}: deducted ${pieces} pcs [${g.grade_name}]`,
          userId,
        },
        tx
      );
    }

    // Mark as REVERSED
    await tx.egg_collections.update({
      where: { id: collId },
      data: {
        status: "REVERSED",
        note: reason ? `${collection.note || ""} | REVERSED: ${reason}` : `${collection.note || ""} | REVERSED`,
      },
    });

    // Revert flock expenses if were added
    if (Number(collection.allocated_expenses) > 0) {
      await tx.poultry_flocks.update({
        where: { id: collection.flock_id },
        data: {
          total_expenses: { decrement: Number(collection.allocated_expenses) },
        },
      });
    }

    // Audit Log
    await logAudit(
      {
        userId,
        action: "UPDATE",
        entityType: "EGG_COLLECTION",
        entityId: String(collId),
        newValues: { status: "REVERSED", reason },
      },
      tx
    );

    return {
      success: true,
      message: `Collection ${collection.collection_no} successfully reversed`,
    };
  });
}

/**
 * Egg Production Performance & Profitability Summary
 */
export async function getEggPerformanceAndProfitability() {
  const eggBu = await prisma.business_units.findUnique({ where: { code: "EGG" } });

  const [flocks, collections, gradeProducts] = await Promise.all([
    prisma.poultry_flocks.findMany({
      where: { status: "ACTIVE" },
      orderBy: { id: "desc" },
    }),
    prisma.egg_collections.findMany({
      where: { status: "COMPLETED" },
      include: {
        poultry_flocks: { select: { shed_name: true, flock_code: true } },
        egg_collection_grades: true,
      },
      orderBy: { id: "desc" },
      take: 50,
    }),
    prisma.products.findMany({
      where: {
        status: "active",
        OR: [
          { product_name: { contains: "Grade" } },
          { product_name: { contains: "গ্রেড" } },
          { product_name: { contains: "Egg" } },
          { product_name: { contains: "ডিম" } },
        ],
      },
    }),
  ]);

  let totalCollected = 0;
  let totalAccepted = 0;
  let totalRejected = 0;
  let totalExpenses = 0;
  let totalBirds = 0;

  for (const f of flocks) {
    totalBirds += f.current_birds_count;
  }

  for (const c of collections) {
    totalCollected += c.total_collected;
    totalAccepted += c.accepted_quantity;
    totalRejected += c.rejected_breakage;
    totalExpenses += Number(c.allocated_expenses);
  }

  const avgCostPerEgg = totalAccepted > 0 ? totalExpenses / totalAccepted : 0;
  const breakageRate = totalCollected > 0 ? (totalRejected / totalCollected) * 100 : 0;
  const layingRate = totalBirds > 0 ? (totalCollected / totalBirds) * 100 : 0;

  return {
    summary: {
      total_flocks: flocks.length,
      total_birds: totalBirds,
      total_collected: totalCollected,
      total_accepted: totalAccepted,
      total_rejected_breakage: totalRejected,
      breakage_rate_percent: parseFloat(breakageRate.toFixed(2)),
      total_expenses: totalExpenses,
      avg_cost_per_accepted_egg: parseFloat(avgCostPerEgg.toFixed(4)),
      laying_rate_percent: parseFloat(layingRate.toFixed(2)),
    },
    flocks: flocks.map((f) => ({
      id: Number(f.id),
      flock_code: f.flock_code,
      shed_name: f.shed_name,
      breed: f.breed,
      current_birds: f.current_birds_count,
      status: f.status,
    })),
    recent_collections: collections.map((c) => ({
      id: Number(c.id),
      collection_no: c.collection_no,
      flock_name: `${c.poultry_flocks.shed_name} (${c.poultry_flocks.flock_code})`,
      total_collected: c.total_collected,
      rejected_breakage: c.rejected_breakage,
      accepted_quantity: c.accepted_quantity,
      cost_per_accepted_egg: Number(c.cost_per_accepted_egg),
      allocated_expenses: Number(c.allocated_expenses),
      date: c.collection_date.toISOString().split("T")[0],
      grades: c.egg_collection_grades.map((g) => ({
        grade_name: g.grade_name,
        pieces: g.quantity_pieces,
        trays: Number(g.trays_equivalent),
      })),
    })),
    grade_products: gradeProducts.map((p) => {
      const pieces = parseFloat(p.quantity || "0");
      const trays = pieces / 30;
      return {
        id: Number(p.id),
        product_name: p.product_name,
        pieces,
        dozens: parseFloat((pieces / 12).toFixed(2)),
        trays: parseFloat(trays.toFixed(2)),
        cost_price: parseFloat(p.cost_price || "0"),
        sell_price: parseFloat(p.sell_price || "0"),
      };
    }),
  };
}
