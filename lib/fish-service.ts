import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { recordStockMovement } from "@/lib/stock-service";
import { recordPartyTransaction } from "@/lib/party-ledger-service";
import { recordFinancialTransaction, getAccountByPaymentMethod } from "@/lib/financial-service";
import { logAudit } from "@/lib/audit-service";

export interface CreateFishBatchParams {
  pondId: bigint | number;
  speciesId: bigint | number;
  productId?: bigint | number | null;
  fingerlingCount: number;
  fingerlingUnitCost: number;
  stockingDate?: Date;
  note?: string | null;
  userId: bigint | number;
}

export interface RecordMortalityParams {
  batchId: bigint | number;
  mortalityCount: number;
  date?: Date;
  reason?: string | null;
  userId: bigint | number;
}

export interface RecordGrowthSampleParams {
  batchId: bigint | number;
  sampleCount: number;
  sampleWeightKg: number;
  date?: Date;
  note?: string | null;
  userId: bigint | number;
}

export interface RecordHarvestParams {
  batchId: bigint | number;
  productId: bigint | number;
  harvestType: "PARTIAL" | "FINAL";
  fishCount: number;
  totalWeightKg: number;
  date?: Date;
  note?: string | null;
  userId: bigint | number;
}

export interface RecordFishSaleParams {
  customerId: bigint | number;
  productId: bigint | number;
  kg: number;
  sellingPricePerKg: number;
  paidAmount?: number;
  paymentMethod?: string;
  date?: Date;
  note?: string | null;
  userId: bigint | number;
}

function generateBatchNo(pondId: bigint | number): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const suffix = Math.floor(100 + Math.random() * 900);
  return `BATCH-P${pondId}-${dateStr}-${suffix}`;
}

function generateHarvestNo(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `HRV-${dateStr}-${suffix}`;
}

/**
 * 1. Fingerling Stocking & Batch Creation
 */
export async function createFishBatch(params: CreateFishBatchParams) {
  const pId = BigInt(params.pondId);
  const sId = BigInt(params.speciesId);
  const count = Math.max(0, Math.floor(Number(params.fingerlingCount || 0)));
  const unitCost = Math.max(0, Number(params.fingerlingUnitCost || 0));
  const totalCost = count * unitCost;
  const stockDate = params.stockingDate || new Date();

  if (count <= 0) {
    throw new Error("পোনা মাছের সংখ্যা অবশ্যই ০-এর বেশি হতে হবে (Fingerling count must be greater than 0)");
  }

  const batchCode = generateBatchNo(pId);

  return prisma.$transaction(async (tx) => {
    const pond = await tx.fish_ponds.findUnique({ where: { id: pId } });
    if (!pond) throw new Error("পুকুর পাওয়া যায়নি (Pond not found)");

    const species = await tx.fish_species.findUnique({ where: { id: sId } });
    if (!species) throw new Error("মাছের প্রজাতি পাওয়া যায়নি (Fish species not found)");

    const batch = await tx.fish_batches.create({
      data: {
        batch_no: batchCode,
        pond_id: pId,
        species_id: sId,
        product_id: params.productId ? BigInt(params.productId) : null,
        stocking_date: stockDate,
        fingerling_count: count,
        fingerling_unit_cost: new Prisma.Decimal(unitCost.toFixed(2)),
        fingerling_total_cost: new Prisma.Decimal(totalCost.toFixed(2)),
        current_fish_count: count,
        total_mortality_count: 0,
        latest_avg_weight_g: new Prisma.Decimal("0.00"),
        estimated_biomass_kg: new Prisma.Decimal("0.000"),
        accumulated_feed_cost: new Prisma.Decimal("0.00"),
        accumulated_other_expenses: new Prisma.Decimal("0.00"),
        total_harvested_count: 0,
        total_harvested_kg: new Prisma.Decimal("0.000"),
        total_harvested_cost: new Prisma.Decimal("0.00"),
        status: "ACTIVE",
        note: params.note || null,
        user_id: BigInt(params.userId),
      },
    });

    await logAudit(
      {
        userId: params.userId,
        action: "CREATE",
        entityType: "FISH_BATCH",
        entityId: String(batch.id),
        newValues: { batch_no: batchCode, count, unit_cost: unitCost, total_cost: totalCost },
      },
      tx
    );

    return {
      success: true,
      batchId: batch.id,
      batchNo: batchCode,
      fingerlingCount: count,
      totalCost,
      currentFishCount: count,
    };
  });
}

/**
 * 2. Record Fish Mortality
 */
export async function recordMortality(params: RecordMortalityParams) {
  const bId = BigInt(params.batchId);
  const deadCount = Math.max(0, Math.floor(Number(params.mortalityCount || 0)));
  const mortDate = params.date || new Date();

  if (deadCount <= 0) {
    throw new Error("মৃত মাছের সংখ্যা অবশ্যই ০-এর বেশি হতে হবে (Mortality count must be greater than 0)");
  }

  return prisma.$transaction(async (tx) => {
    const batch = await tx.fish_batches.findUnique({ where: { id: bId } });
    if (!batch) throw new Error("ব্যাচ পাওয়া যায়নি (Batch not found)");

    if (deadCount > batch.current_fish_count) {
      throw new Error(
        `মৃত মাছের সংখ্যা বর্তমান মাছের চেয়ে বেশি হতে পারে না। বর্তমান সংখ্যা: ${batch.current_fish_count}, প্রদানকৃত: ${deadCount}`
      );
    }

    const newCurrentCount = batch.current_fish_count - deadCount;
    const newTotalMortality = batch.total_mortality_count + deadCount;
    const avgWeightG = Number(batch.latest_avg_weight_g || 0);
    const newEstimatedBiomass = (newCurrentCount * avgWeightG) / 1000;

    await tx.fish_mortalities.create({
      data: {
        batch_id: bId,
        mortality_count: deadCount,
        date: mortDate,
        reason: params.reason || null,
        user_id: BigInt(params.userId),
      },
    });

    const updatedBatch = await tx.fish_batches.update({
      where: { id: bId },
      data: {
        current_fish_count: newCurrentCount,
        total_mortality_count: newTotalMortality,
        estimated_biomass_kg: new Prisma.Decimal(newEstimatedBiomass.toFixed(3)),
      },
    });

    return {
      success: true,
      mortalityCount: deadCount,
      remainingCount: newCurrentCount,
      estimatedBiomassKg: newEstimatedBiomass,
    };
  });
}

/**
 * 3. Growth Sampling & Estimated Live Biomass Calculation
 */
export async function recordGrowthSample(params: RecordGrowthSampleParams) {
  const bId = BigInt(params.batchId);
  const sampleCount = Math.max(0, Math.floor(Number(params.sampleCount || 0)));
  const sampleWeightKg = Math.max(0, Number(params.sampleWeightKg || 0));
  const sampleDate = params.date || new Date();

  if (sampleCount <= 0 || sampleWeightKg <= 0) {
    throw new Error("স্যাম্পল সংখ্যা এবং মোট ওজন উভয়ই ০-এর বেশি হতে হবে");
  }

  return prisma.$transaction(async (tx) => {
    const batch = await tx.fish_batches.findUnique({ where: { id: bId } });
    if (!batch) throw new Error("ব্যাচ পাওয়া যায়নি");

    const avgWeightG = (sampleWeightKg / sampleCount) * 1000;
    const estimatedBiomassKg = (batch.current_fish_count * avgWeightG) / 1000;

    await tx.fish_samplings.create({
      data: {
        batch_id: bId,
        sample_date: sampleDate,
        sample_count: sampleCount,
        sample_weight_kg: new Prisma.Decimal(sampleWeightKg.toFixed(3)),
        avg_weight_g: new Prisma.Decimal(avgWeightG.toFixed(2)),
        estimated_biomass_kg: new Prisma.Decimal(estimatedBiomassKg.toFixed(3)),
        note: params.note || null,
        user_id: BigInt(params.userId),
      },
    });

    await tx.fish_batches.update({
      where: { id: bId },
      data: {
        latest_avg_weight_g: new Prisma.Decimal(avgWeightG.toFixed(2)),
        estimated_biomass_kg: new Prisma.Decimal(estimatedBiomassKg.toFixed(3)),
      },
    });

    return {
      success: true,
      sampleCount,
      sampleWeightKg,
      avgWeightG: parseFloat(avgWeightG.toFixed(2)),
      currentFishCount: batch.current_fish_count,
      estimatedBiomassKg: parseFloat(estimatedBiomassKg.toFixed(3)),
    };
  });
}

/**
 * 4. Partial & Final Harvesting Engine
 * Deducts fish from pond, allocates cost, and creates saleable inventory stock exactly once.
 */
export async function recordHarvest(params: RecordHarvestParams) {
  const bId = BigInt(params.batchId);
  const prodId = BigInt(params.productId);
  const fishCount = Math.max(0, Math.floor(Number(params.fishCount || 0)));
  const totalWeightKg = Math.max(0, Number(params.totalWeightKg || 0));
  const harvestType = params.harvestType || "PARTIAL";
  const hrvDate = params.date || new Date();

  if (fishCount <= 0 || totalWeightKg <= 0) {
    throw new Error("আহরণের মাছের সংখ্যা এবং মোট ওজন (কেজি) উভয়ই ০-এর বেশি হতে হবে");
  }

  const harvestCode = generateHarvestNo();

  return prisma.$transaction(async (tx) => {
    const batch = await tx.fish_batches.findUnique({ where: { id: bId } });
    if (!batch) throw new Error("ব্যাচ পাওয়া যায়নি");

    if (fishCount > batch.current_fish_count) {
      throw new Error(
        `আহরণের সংখ্যা বর্তমান মাছের চেয়ে বেশি হতে পারে না। বর্তমান মাছ: ${batch.current_fish_count}, চাওয়া হয়েছে: ${fishCount}`
      );
    }

    const fishBu = await tx.business_units.findUnique({ where: { code: "FISH" } });

    // Cost Allocation Calculation
    const totalBatchCost =
      Number(batch.fingerling_total_cost) +
      Number(batch.accumulated_feed_cost) +
      Number(batch.accumulated_other_expenses);

    const remainingBatchCostBefore = Math.max(0, totalBatchCost - Number(batch.total_harvested_cost));

    const newCurrentCount = batch.current_fish_count - fishCount;
    const isCompleted = harvestType === "FINAL" || newCurrentCount === 0;

    let costAllocated: number;
    if (isCompleted) {
      // Allocate 100% of remaining cost
      costAllocated = remainingBatchCostBefore;
    } else {
      // Proportional cost allocation based on count harvested
      const proportion = batch.current_fish_count > 0 ? fishCount / batch.current_fish_count : 1;
      costAllocated = remainingBatchCostBefore * proportion;
    }

    const costPerKg = totalWeightKg > 0 ? costAllocated / totalWeightKg : 0;
    const avgWeightKg = fishCount > 0 ? totalWeightKg / fishCount : 0;

    // 1. Record in fish_harvests table
    const harvestRecord = await tx.fish_harvests.create({
      data: {
        harvest_no: harvestCode,
        batch_id: bId,
        product_id: prodId,
        harvest_type: harvestType,
        fish_count: fishCount,
        total_weight_kg: new Prisma.Decimal(totalWeightKg.toFixed(3)),
        avg_weight_kg: new Prisma.Decimal(avgWeightKg.toFixed(3)),
        cost_allocated: new Prisma.Decimal(costAllocated.toFixed(2)),
        cost_per_kg: new Prisma.Decimal(costPerKg.toFixed(2)),
        date: hrvDate,
        note: params.note || null,
        user_id: BigInt(params.userId),
      },
    });

    // 2. Inward saleable fish stock EXACTLY ONCE
    const stockRes = await recordStockMovement(
      {
        productId: prodId,
        businessUnitId: fishBu?.id,
        movementType: "HARVEST_INWARD",
        quantity: totalWeightKg,
        unitPrice: costPerKg,
        referenceType: "HARVEST",
        referenceId: harvestRecord.id,
        referenceNo: harvestCode,
        date: hrvDate,
        note: `Fish Harvest ${harvestCode}: ${totalWeightKg} kg (${fishCount} pcs, avg ${avgWeightKg.toFixed(2)} kg/pc) @ ৳${costPerKg.toFixed(2)}/kg`,
        userId: params.userId,
      },
      tx
    );

    // Update product cost price
    await tx.products.update({
      where: { id: prodId },
      data: {
        cost_price: costPerKg.toFixed(2),
      },
    });

    // 3. Update fish batch
    const newTotalHarvestedCount = batch.total_harvested_count + fishCount;
    const newTotalHarvestedKg = Number(batch.total_harvested_kg) + totalWeightKg;
    const newTotalHarvestedCost = Number(batch.total_harvested_cost) + costAllocated;
    const avgWeightG = Number(batch.latest_avg_weight_g || 0);
    const newEstimatedBiomass = (newCurrentCount * avgWeightG) / 1000;
    const remainingBatchValuation = totalBatchCost - newTotalHarvestedCost;

    await tx.fish_batches.update({
      where: { id: bId },
      data: {
        current_fish_count: newCurrentCount,
        total_harvested_count: newTotalHarvestedCount,
        total_harvested_kg: new Prisma.Decimal(newTotalHarvestedKg.toFixed(3)),
        total_harvested_cost: new Prisma.Decimal(newTotalHarvestedCost.toFixed(2)),
        estimated_biomass_kg: new Prisma.Decimal(newEstimatedBiomass.toFixed(3)),
        status: isCompleted ? "COMPLETED" : "PARTIALLY_HARVESTED",
      },
    });

    // Audit Log
    await logAudit(
      {
        userId: params.userId,
        action: "CREATE",
        entityType: "FISH_HARVEST",
        entityId: String(harvestRecord.id),
        newValues: {
          harvest_no: harvestCode,
          fish_count: fishCount,
          weight_kg: totalWeightKg,
          cost_allocated: costAllocated,
          cost_per_kg: costPerKg,
        },
      },
      tx
    );

    return {
      success: true,
      harvestId: harvestRecord.id,
      harvestNo: harvestCode,
      harvestType,
      fishCount,
      totalWeightKg,
      costAllocated: parseFloat(costAllocated.toFixed(2)),
      costPerKg: parseFloat(costPerKg.toFixed(2)),
      remainingFishCount: newCurrentCount,
      remainingBatchValuation: parseFloat(remainingBatchValuation.toFixed(2)),
      saleableStockKg: stockRes.newStock,
      isCompleted,
    };
  });
}

/**
 * 5. Commercial Fish Sale in KG
 */
export async function recordFishSale(params: RecordFishSaleParams) {
  const prodId = BigInt(params.productId);
  const custId = BigInt(params.customerId);
  const kg = Math.max(0, Number(params.kg || 0));
  const pricePerKg = Number(params.sellingPricePerKg || 0);
  const totalSaleAmount = kg * pricePerKg;
  const paidNum = Math.max(0, Number(params.paidAmount || 0));
  const dueNum = Math.max(0, totalSaleAmount - paidNum);
  const saleDate = params.date || new Date();

  if (kg <= 0 || pricePerKg <= 0) {
    throw new Error("মাছের ওজন এবং প্রতি কেজির বিক্রয় মূল্য উভয়ই ০-এর বেশি হতে হবে");
  }

  return prisma.$transaction(async (tx) => {
    const fishBu = await tx.business_units.findUnique({ where: { code: "FISH" } });

    // 1. Deduct exact KG from saleable fish product stock
    const stockRes = await recordStockMovement(
      {
        productId: prodId,
        businessUnitId: fishBu?.id,
        movementType: "SALE_OUTWARD",
        quantity: kg,
        unitPrice: pricePerKg,
        referenceType: "ORDER",
        date: saleDate,
        note: `Fish Sale: ${kg} kg @ ৳${pricePerKg}/kg`,
        userId: params.userId,
      },
      tx
    );

    // 2. Customer Ledger
    await recordPartyTransaction(
      {
        partyType: "CUSTOMER",
        customerId: custId,
        businessUnitId: fishBu?.id,
        transactionType: "INVOICE",
        referenceType: "ORDER",
        debit: totalSaleAmount,
        credit: paidNum,
        date: saleDate,
        note: `Fish Sale: ${kg} kg @ ৳${pricePerKg}`,
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
            businessUnitId: fishBu?.id,
            transactionType: "INFLOW",
            amount: paidNum,
            referenceType: "SALE_PAYMENT",
            date: saleDate,
            note: `Payment for Fish Sale (${params.paymentMethod || "Cash"})`,
            userId: params.userId,
          },
          tx
        );
      }
    }

    return {
      success: true,
      kgSold: kg,
      sellingPricePerKg: pricePerKg,
      totalSaleAmount,
      paidAmount: paidNum,
      dueAmount: dueNum,
      remainingStockKg: stockRes.newStock,
    };
  });
}

/**
 * 6. Fish Farming Dashboard & Profitability Summary
 */
export async function getFishFarmingDashboardData() {
  const [ponds, species, batches, harvests, saleableFishProducts] = await Promise.all([
    prisma.fish_ponds.findMany({
      orderBy: { id: "desc" },
      include: {
        fish_batches: {
          where: { status: { in: ["ACTIVE", "PARTIALLY_HARVESTED"] } },
          include: { fish_species: true },
        },
      },
    }),
    prisma.fish_species.findMany({ orderBy: { species_name: "asc" } }),
    prisma.fish_batches.findMany({
      orderBy: { id: "desc" },
      include: {
        fish_ponds: true,
        fish_species: true,
        products: true,
      },
    }),
    prisma.fish_harvests.findMany({
      orderBy: { id: "desc" },
      include: {
        fish_batches: {
          include: { fish_ponds: true, fish_species: true },
        },
        products: true,
      },
      take: 50,
    }),
    prisma.products.findMany({
      where: {
        status: "active",
        OR: [
          { product_name: { contains: "Fish" } },
          { product_name: { contains: "মাছ" } },
          { product_name: { contains: "পাঙ্গাশ" } },
          { product_name: { contains: "তেলাপিয়া" } },
          { product_name: { contains: "রুই" } },
          { product_name: { contains: "কাতলা" } },
        ],
      },
    }),
  ]);

  let totalFingerlingsStocked = 0;
  let totalCurrentLiveFish = 0;
  let totalMortality = 0;
  let totalEstimatedBiomassKg = 0;
  let totalHarvestedKg = 0;
  let totalHarvestedCost = 0;
  let totalBatchExpenses = 0;

  for (const b of batches) {
    totalFingerlingsStocked += b.fingerling_count;
    totalCurrentLiveFish += b.current_fish_count;
    totalMortality += b.total_mortality_count;
    totalEstimatedBiomassKg += Number(b.estimated_biomass_kg);
    totalHarvestedKg += Number(b.total_harvested_kg);
    totalHarvestedCost += Number(b.total_harvested_cost);
    totalBatchExpenses +=
      Number(b.fingerling_total_cost) +
      Number(b.accumulated_feed_cost) +
      Number(b.accumulated_other_expenses);
  }

  const mortalityRate =
    totalFingerlingsStocked > 0 ? (totalMortality / totalFingerlingsStocked) * 100 : 0;

  return {
    summary: {
      total_ponds: ponds.length,
      total_batches: batches.length,
      active_batches: batches.filter((b) => b.status === "ACTIVE" || b.status === "PARTIALLY_HARVESTED").length,
      total_fingerlings_stocked: totalFingerlingsStocked,
      total_current_live_fish: totalCurrentLiveFish,
      total_mortality: totalMortality,
      mortality_rate_percent: parseFloat(mortalityRate.toFixed(2)),
      total_estimated_biomass_kg: parseFloat(totalEstimatedBiomassKg.toFixed(2)),
      total_harvested_kg: parseFloat(totalHarvestedKg.toFixed(2)),
      total_harvested_cost: parseFloat(totalHarvestedCost.toFixed(2)),
      total_batch_expenses: parseFloat(totalBatchExpenses.toFixed(2)),
    },
    ponds: ponds.map((p) => ({
      id: Number(p.id),
      pond_code: p.pond_code,
      pond_name: p.pond_name,
      area_decimal: Number(p.area_decimal),
      water_depth_feet: Number(p.water_depth_feet),
      status: p.status,
      active_batches_count: p.fish_batches.length,
    })),
    species: species.map((s) => ({
      id: Number(s.id),
      species_name: s.species_name,
      default_culture_days: s.default_culture_days,
    })),
    batches: batches.map((b) => ({
      id: Number(b.id),
      batch_no: b.batch_no,
      pond_name: b.fish_ponds.pond_name,
      species_name: b.fish_species.species_name,
      stocking_date: b.stocking_date.toISOString().split("T")[0],
      fingerling_count: b.fingerling_count,
      current_fish_count: b.current_fish_count,
      mortality_count: b.total_mortality_count,
      latest_avg_weight_g: Number(b.latest_avg_weight_g),
      estimated_biomass_kg: Number(b.estimated_biomass_kg),
      harvested_kg: Number(b.total_harvested_kg),
      status: b.status,
      total_cost:
        Number(b.fingerling_total_cost) +
        Number(b.accumulated_feed_cost) +
        Number(b.accumulated_other_expenses),
    })),
    recent_harvests: harvests.map((h) => ({
      id: Number(h.id),
      harvest_no: h.harvest_no,
      pond_name: h.fish_batches.fish_ponds.pond_name,
      species_name: h.fish_batches.fish_species.species_name,
      product_name: h.products.product_name,
      harvest_type: h.harvest_type,
      fish_count: h.fish_count,
      total_weight_kg: Number(h.total_weight_kg),
      avg_weight_kg: Number(h.avg_weight_kg),
      cost_per_kg: Number(h.cost_per_kg),
      cost_allocated: Number(h.cost_allocated),
      date: h.date.toISOString().split("T")[0],
    })),
    saleable_fish_products: saleableFishProducts.map((p) => ({
      id: Number(p.id),
      product_name: p.product_name,
      stock_kg: parseFloat(p.quantity || "0"),
      cost_price: parseFloat(p.cost_price || "0"),
      sell_price: parseFloat(p.sell_price || "0"),
    })),
  };
}

export interface CreatePondParams {
  pondCode: string;
  pondName: string;
  location?: string | null;
  areaDecimal?: number;
  waterDepthFeet?: number;
  note?: string | null;
  userId: bigint | number;
}

export async function createPond(params: CreatePondParams) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.fish_ponds.findUnique({
      where: { pond_code: params.pondCode.trim().toUpperCase() },
    });
    if (existing) {
      throw new Error(`পুকুর কোড '${params.pondCode}' ইতিমধ্যে বিদ্যমান রয়েছে`);
    }

    const pond = await tx.fish_ponds.create({
      data: {
        pond_code: params.pondCode.trim().toUpperCase(),
        pond_name: params.pondName.trim(),
        location: params.location || null,
        area_decimal: new Prisma.Decimal(Number(params.areaDecimal || 0).toFixed(2)),
        water_depth_feet: new Prisma.Decimal(Number(params.waterDepthFeet || 0).toFixed(2)),
        status: "ACTIVE",
        note: params.note || null,
        user_id: BigInt(params.userId),
      },
    });

    await logAudit(
      {
        userId: params.userId,
        action: "CREATE",
        entityType: "FISH_POND",
        entityId: String(pond.id),
        newValues: { pond_code: pond.pond_code, pond_name: pond.pond_name },
      },
      tx
    );

    return pond;
  });
}

export interface RecordBatchExpenseParams {
  batchId: bigint | number;
  amount: number;
  expenseCategory: string;
  paymentMethod?: string;
  date?: Date;
  note?: string | null;
  userId: bigint | number;
}

export async function recordBatchExpense(params: RecordBatchExpenseParams) {
  const bId = BigInt(params.batchId);
  const amt = Math.max(0, Number(params.amount || 0));
  const expDate = params.date || new Date();

  if (amt <= 0) {
    throw new Error("খরচের পরিমাণ ০-এর বেশি হতে হবে");
  }

  return prisma.$transaction(async (tx) => {
    const batch = await tx.fish_batches.findUnique({ where: { id: bId } });
    if (!batch) throw new Error("ব্যাচ পাওয়া যায়নি");

    const fishBu = await tx.business_units.findUnique({ where: { code: "FISH" } });

    // Update batch accumulated expenses
    const updatedBatch = await tx.fish_batches.update({
      where: { id: bId },
      data: {
        accumulated_other_expenses: {
          increment: new Prisma.Decimal(amt.toFixed(2)),
        },
      },
    });

    // Record financial outflow if paymentMethod provided
    if (params.paymentMethod) {
      const financialAccount = await getAccountByPaymentMethod(params.paymentMethod, tx);
      if (financialAccount) {
        await recordFinancialTransaction(
          {
            accountId: financialAccount.id,
            businessUnitId: fishBu?.id,
            transactionType: "OUTFLOW",
            amount: amt,
            referenceType: "EXPENSE",
            date: expDate,
            note: `Fish Batch Expense (${params.expenseCategory}): ${params.note || ""}`,
            userId: params.userId,
          },
          tx
        );
      }
    }

    await logAudit(
      {
        userId: params.userId,
        action: "UPDATE",
        entityType: "FISH_BATCH",
        entityId: String(bId),
        newValues: {
          expenseCategory: params.expenseCategory,
          amount: amt,
          new_accumulated_other_expenses: Number(updatedBatch.accumulated_other_expenses),
        },
      },
      tx
    );

    return {
      success: true,
      batchId: bId,
      amount: amt,
      totalOtherExpenses: Number(updatedBatch.accumulated_other_expenses),
    };
  });
}
