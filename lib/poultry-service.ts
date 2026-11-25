import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { calculateAgeInMonthsAndDays, calculateDailyFeedRequirementKg } from "@/lib/unit-service";
import { generateFlockCode } from "@/lib/transaction-service";
import { logAudit } from "@/lib/audit-service";
import { recordPartyTransaction } from "@/lib/party-ledger-service";
import { recordFinancialTransaction, getAccountByPaymentMethod } from "@/lib/financial-service";
import { recordStockMovement } from "@/lib/stock-service";

export interface CreateFlockParams {
  shedName: string;
  breed: string;
  initialChicksCount: number;
  housingDate?: Date;
  note?: string | null;
  userId: bigint | number;
}

export interface RecordFlockPurchaseParams {
  supplierId: bigint | number;
  shedName: string;
  breed: string;
  birdCount: number;
  unitPrice: number;
  paidAmount?: number;
  paymentMethod?: string;
  housingDate?: Date;
  note?: string | null;
  userId: bigint | number;
}

export interface RecordFlockMortalityParams {
  flockId: bigint | number;
  mortalityCount: number;
  date?: Date;
  reason?: string | null;
  userId: bigint | number;
}

export interface RecordFlockExpenseParams {
  flockId: bigint | number;
  amount: number;
  expenseType: string; // e.g. "Medicine", "Vaccine", "Litter/Bedding", "Labor", "Utility"
  expenseDetails?: string | null;
  date?: Date;
  paymentMethod?: string;
  userId: bigint | number;
}

/**
 * 1. Create Poultry Flock (Direct Housing)
 */
export async function createPoultryFlock(params: CreateFlockParams) {
  const shedName = (params.shedName || "").trim();
  const breed = (params.breed || "").trim();
  const count = Math.max(0, Math.floor(Number(params.initialChicksCount || 0)));
  const hDate = params.housingDate || new Date();

  if (!shedName || !breed) {
    throw new Error("শেডের নাম এবং মুরগির জাত (Breed) প্রদান আবশ্যক");
  }

  const flockCode = generateFlockCode();

  return prisma.$transaction(async (tx) => {
    const flock = await tx.poultry_flocks.create({
      data: {
        flock_code: flockCode,
        shed_name: shedName,
        breed: breed,
        initial_chicks_count: count,
        current_birds_count: count,
        housing_date: hDate,
        status: "ACTIVE",
        feed_consumed_kg: new Prisma.Decimal("0.000"),
        total_expenses: new Prisma.Decimal("0.00"),
        note: params.note ? params.note.trim() : null,
        user_id: BigInt(params.userId),
      },
    });

    await logAudit(
      {
        userId: params.userId,
        action: "CREATE",
        entityType: "POULTRY_FLOCK",
        entityId: String(flock.id),
        newValues: {
          flock_code: flockCode,
          shed_name: shedName,
          breed: breed,
          initial_count: count,
        },
      },
      tx
    );

    return {
      success: true,
      flockId: Number(flock.id),
      flockCode: flock.flock_code,
      shedName: flock.shed_name,
      breed: flock.breed,
      currentBirdsCount: flock.current_birds_count,
    };
  });
}

/**
 * 2. Record Flock Purchase (Bird Inward + Supplier Payable + Financial Outflow)
 * Strictly adheres to Master Rules:
 * - Creates flock record with housing date and bird count.
 * - Creates supplier liability in party ledger (Credit = totalBill).
 * - If paid, records payment (Debit = paidAmount) and cash/bank transaction.
 * - Inward stock movement audit trail.
 */
export async function recordFlockPurchase(params: RecordFlockPurchaseParams) {
  const suppId = BigInt(params.supplierId);
  const shedName = (params.shedName || "").trim();
  const breed = (params.breed || "").trim();
  const birdCount = Math.max(0, Math.floor(Number(params.birdCount || 0)));
  const unitPrice = Math.max(0, Number(params.unitPrice || 0));
  const paidAmount = Math.max(0, Number(params.paidAmount || 0));
  const paymentMethod = params.paymentMethod || "Cash";
  const hDate = params.housingDate || new Date();

  if (!suppId) throw new Error("সরবরাহকারী নির্বাচন আবশ্যক (Supplier is required)");
  if (!shedName || !breed) throw new Error("শেডের নাম এবং জাত উল্লেখ করতে হবে");
  if (birdCount <= 0) throw new Error("মুরগির সংখ্যা অবশ্যই ০-এর বেশি হতে হবে");
  if (unitPrice <= 0) throw new Error("প্রতিটি মুরগির ক্রয়মূল্য ০-এর বেশি হতে হবে");

  const totalBill = birdCount * unitPrice;
  if (paidAmount > totalBill) {
    throw new Error("পরিশোধিত অর্থ মোট বিলের চেয়ে বেশি হতে পারে না");
  }

  const flockCode = generateFlockCode();

  return prisma.$transaction(async (tx) => {
    // 1. Verify supplier
    const supplier = await tx.suppliers.findUnique({ where: { id: suppId } });
    if (!supplier) throw new Error("সরবরাহকারী ডাটাবেসে পাওয়া যায়নি");

    // 2. Get Poultry Business Unit
    const poultryBu = await tx.business_units.findUnique({ where: { code: "POULTRY" } });
    const buId = poultryBu?.id || null;

    // 3. Create Flock
    const flock = await tx.poultry_flocks.create({
      data: {
        flock_code: flockCode,
        shed_name: shedName,
        breed: breed,
        initial_chicks_count: birdCount,
        current_birds_count: birdCount,
        housing_date: hDate,
        status: "ACTIVE",
        feed_consumed_kg: new Prisma.Decimal("0.000"),
        total_expenses: new Prisma.Decimal(totalBill.toFixed(2)),
        note: params.note ? `${params.note.trim()} (Supplier: ${supplier.name})` : `Purchased from ${supplier.name}`,
        user_id: BigInt(params.userId),
      },
    });

    // 4. Update Supplier Ledger: Credit total purchase bill
    await recordPartyTransaction(
      {
        partyType: "SUPPLIER",
        supplierId: suppId,
        businessUnitId: buId,
        transactionType: "INVOICE",
        referenceType: "PURCHASE",
        referenceId: flock.id,
        referenceNo: flockCode,
        credit: totalBill,
        date: hDate,
        note: `Flock purchase: ${birdCount} birds of ${breed} for ${shedName} @ ৳${unitPrice}`,
        userId: params.userId,
      },
      tx
    );

    // 5. If initial payment made, debit supplier ledger and record cash/bank outflow
    if (paidAmount > 0) {
      await recordPartyTransaction(
        {
          partyType: "SUPPLIER",
          supplierId: suppId,
          businessUnitId: buId,
          transactionType: "PAYMENT",
          referenceType: "PURCHASE_PAYMENT",
          referenceId: flock.id,
          referenceNo: flockCode,
          debit: paidAmount,
          date: hDate,
          note: `Flock purchase payment via ${paymentMethod} to ${supplier.name}`,
          userId: params.userId,
        },
        tx
      );

      const finAccount = await getAccountByPaymentMethod(paymentMethod, tx);
      if (finAccount) {
        await recordFinancialTransaction(
          {
            accountId: finAccount.id,
            businessUnitId: buId,
            transactionType: "OUTFLOW",
            amount: paidAmount,
            referenceType: "PURCHASE_PAYMENT",
            referenceNo: flockCode,
            date: hDate,
            note: `Payment for flock purchase ${flockCode} to ${supplier.name}`,
            userId: params.userId,
          },
          tx
        );
      }
    }

    // 6. Audit log
    await logAudit(
      {
        userId: params.userId,
        action: "CREATE",
        entityType: "POULTRY_FLOCK_PURCHASE",
        entityId: String(flock.id),
        newValues: {
          flockCode,
          supplierId: String(suppId),
          birdCount,
          unitPrice,
          totalBill,
          paidAmount,
          dueAmount: totalBill - paidAmount,
        },
      },
      tx
    );

    return {
      success: true,
      flockId: Number(flock.id),
      flockCode: flock.flock_code,
      totalBill,
      paidAmount,
      dueAmount: totalBill - paidAmount,
      currentBirdsCount: birdCount,
    };
  });
}

/**
 * 3. Record Flock Mortality
 * Atomically decreases current live bird count.
 * Creates audit log and records movement.
 */
export async function recordFlockMortality(params: RecordFlockMortalityParams) {
  const fId = BigInt(params.flockId);
  const deadCount = Math.max(0, Math.floor(Number(params.mortalityCount || 0)));
  const mortDate = params.date || new Date();

  if (deadCount <= 0) {
    throw new Error("মৃত মুরগির সংখ্যা অবশ্যই ০-এর বেশি হতে হবে");
  }

  return prisma.$transaction(async (tx) => {
    // 1. Fetch flock with FOR UPDATE lock
    const flock = await tx.poultry_flocks.findUnique({ where: { id: fId } });
    if (!flock) throw new Error("ফ্লক পাওয়া যায়নি (Flock not found)");

    if (flock.current_birds_count < deadCount) {
      throw new Error(
        `মৃত মুরগির সংখ্যা (${deadCount}) বর্তমান জীবন্ত মুরগির সংখ্যা (${flock.current_birds_count}) থেকে বেশি হতে পারে না`
      );
    }

    const newCurrentCount = flock.current_birds_count - deadCount;

    // 2. Update flock current_birds_count atomically
    await tx.poultry_flocks.update({
      where: { id: fId },
      data: {
        current_birds_count: newCurrentCount,
        status: newCurrentCount === 0 ? "CULLED" : flock.status,
      },
    });

    // 3. Audit log
    await logAudit(
      {
        userId: params.userId,
        action: "UPDATE",
        entityType: "POULTRY_MORTALITY",
        entityId: String(flock.id),
        oldValues: { current_birds: flock.current_birds_count },
        newValues: {
          mortality_count: deadCount,
          remaining_birds: newCurrentCount,
          reason: params.reason || null,
        },
      },
      tx
    );

    return {
      success: true,
      flockId: Number(flock.id),
      flockCode: flock.flock_code,
      mortalityCount: deadCount,
      remainingBirdsCount: newCurrentCount,
    };
  });
}

/**
 * 4. Record Flock Direct Farm Expense (Vaccine, Medicine, Litter, Utilities)
 * Directly attributes cost to the flock's total_expenses.
 */
export async function recordFlockExpense(params: RecordFlockExpenseParams) {
  const fId = BigInt(params.flockId);
  const amount = Math.max(0, Number(params.amount || 0));
  const expDate = params.date || new Date();
  const paymentMethod = params.paymentMethod || "Cash";

  if (amount <= 0) {
    throw new Error("খরচের পরিমাণ অবশ্যই ০-এর বেশি হতে হবে");
  }

  return prisma.$transaction(async (tx) => {
    const flock = await tx.poultry_flocks.findUnique({ where: { id: fId } });
    if (!flock) throw new Error("ফ্লক পাওয়া যায়নি (Flock not found)");

    const prevExpenses = Number(flock.total_expenses);
    const newExpenses = prevExpenses + amount;

    // 1. Update flock total_expenses atomically
    await tx.poultry_flocks.update({
      where: { id: fId },
      data: {
        total_expenses: new Prisma.Decimal(newExpenses.toFixed(2)),
      },
    });

    // 2. Financial outflow
    const poultryBu = await tx.business_units.findUnique({ where: { code: "POULTRY" } });
    const finAccount = await getAccountByPaymentMethod(paymentMethod, tx);
    if (finAccount) {
      await recordFinancialTransaction(
        {
          accountId: finAccount.id,
          businessUnitId: poultryBu?.id || null,
          transactionType: "OUTFLOW",
          amount: amount,
          referenceType: "EXPENSE",
          referenceNo: flock.flock_code,
          date: expDate,
          note: `Flock direct expense (${params.expenseType}): ${params.expenseDetails || ""} [${flock.flock_code}]`,
          userId: params.userId,
        },
        tx
      );
    }

    // 3. Audit log
    await logAudit(
      {
        userId: params.userId,
        action: "UPDATE",
        entityType: "POULTRY_EXPENSE",
        entityId: String(flock.id),
        oldValues: { total_expenses: prevExpenses },
        newValues: {
          added_expense: amount,
          total_expenses: newExpenses,
          type: params.expenseType,
        },
      },
      tx
    );

    return {
      success: true,
      flockId: Number(flock.id),
      flockCode: flock.flock_code,
      addedExpense: amount,
      totalExpenses: newExpenses,
    };
  });
}

/**
 * 5. Get Flock Full Analytics & 30-Day Age Calculation
 * Returns dynamic metrics including:
 * - Age in Months & Days (30-day month convention)
 * - Live bird stock vs initial count
 * - Expected daily feed intake (standard 120g/day per adult layer)
 * - Actual feed consumed and intake comparison
 * - Total direct farm expenses and cost per bird
 */
export async function getFlockDetailsWithAnalytics(flockId: bigint | number) {
  const fId = BigInt(flockId);
  const flock = await prisma.poultry_flocks.findUnique({
    where: { id: fId },
    include: {
      egg_collections: {
        orderBy: { collection_date: "desc" },
        take: 30,
      },
    },
  });

  if (!flock) return null;

  // 1. Dynamic Age (30-day month convention)
  const age = calculateAgeInMonthsAndDays(flock.housing_date, new Date());

  // 2. Feed requirement (120g per adult bird per day)
  const feedReq = calculateDailyFeedRequirementKg(flock.current_birds_count, 120);
  const expectedDailyFeedKg = feedReq.dailyKg;
  const totalDays = Math.max(1, age.totalDays);
  const totalExpectedFeedKg = expectedDailyFeedKg * totalDays;
  const actualFeedConsumedKg = Number(flock.feed_consumed_kg);

  // Actual daily feed intake per bird in grams
  const actualDailyIntakeGrams =
    flock.current_birds_count > 0
      ? (actualFeedConsumedKg * 1000) / (totalDays * flock.current_birds_count)
      : 0;

  // 3. Egg Production statistics
  const totalEggsCollected = flock.egg_collections.reduce((sum, c) => sum + c.total_collected, 0);
  const totalEggBreakage = flock.egg_collections.reduce((sum, c) => sum + c.rejected_breakage, 0);
  const totalAcceptedEggs = flock.egg_collections.reduce((sum, c) => sum + c.accepted_quantity, 0);

  // 4. Mortality rate ( strictly summed from recorded mortality events )
  const flockMortalityLogs = await prisma.audit_logs.findMany({
    where: {
      entity_type: "POULTRY_MORTALITY",
      entity_id: String(flock.id),
    },
    select: { new_values: true },
  });
  const mortalityCount = flockMortalityLogs.reduce((sum, l) => {
    try {
      const parsed = typeof l.new_values === "string" ? JSON.parse(l.new_values) : (l.new_values as any);
      return sum + Number(parsed?.mortality_count || 0);
    } catch {
      return sum;
    }
  }, 0);
  const mortalityRatePercent =
    flock.initial_chicks_count > 0 ? (mortalityCount / flock.initial_chicks_count) * 100 : 0;

  return {
    id: Number(flock.id),
    flock_code: flock.flock_code,
    shed_name: flock.shed_name,
    breed: flock.breed,
    housing_date: flock.housing_date.toISOString().split("T")[0],
    status: flock.status,
    initial_chicks_count: flock.initial_chicks_count,
    current_birds_count: flock.current_birds_count,
    mortality_count: mortalityCount,
    mortality_rate_percent: parseFloat(mortalityRatePercent.toFixed(2)),
    // 30-day age metrics
    age: {
      total_days: age.totalDays,
      months: age.months,
      days: age.days,
      display: age.display,
    },
    // Feed analytics with 120g/day adult standard
    feed: {
      standard_rate_grams_per_bird: 120,
      expected_daily_kg: parseFloat(expectedDailyFeedKg.toFixed(2)),
      actual_consumed_total_kg: parseFloat(actualFeedConsumedKg.toFixed(2)),
      actual_daily_grams_per_bird: parseFloat(actualDailyIntakeGrams.toFixed(2)),
      intake_status:
        actualDailyIntakeGrams === 0
          ? "NO_FEED_DATA"
          : actualDailyIntakeGrams < 100
          ? "UNDERFEEDING"
          : actualDailyIntakeGrams > 140
          ? "OVERFEEDING"
          : "NORMAL",
    },
    // Financials
    financials: {
      total_expenses: Number(flock.total_expenses),
      cost_per_live_bird:
        flock.current_birds_count > 0
          ? parseFloat((Number(flock.total_expenses) / flock.current_birds_count).toFixed(2))
          : 0,
    },
    // Egg collection summary
    egg_production: {
      total_collected: totalEggsCollected,
      total_accepted: totalAcceptedEggs,
      total_breakage: totalEggBreakage,
      breakage_rate_percent:
        totalEggsCollected > 0
          ? parseFloat(((totalEggBreakage / totalEggsCollected) * 100).toFixed(2))
          : 0,
    },
    note: flock.note,
  };
}

/**
 * Helper: Parse note metadata & compute 3-stage age + dynamic weight
 * Stage 1 (< 45 days): বাচ্চা মুরগি (Chick)
 * Stage 2 (45 - 119 days): মাঝারি মুরগি (Medium / Grower)
 * Stage 3 (>= 120 days): বড় মুরগি (Adult / Large — Medium becomes 0)
 */
export function parseFlockNoteMetadata(note?: string | null) {
  const raw = note || "";
  let initWeightStr = "";
  let dailyFeedStr = "";
  let unitPriceStr = "";
  let paymentMethodStr = "";
  let supplierIdStr = "";

  const cleanParts: string[] = [];
  raw.split("|").forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("ওজন:")) {
      initWeightStr = trimmed.replace("ওজন:", "").replace(/g$/i, "").trim();
    } else if (trimmed.startsWith("খাবার:")) {
      dailyFeedStr = trimmed.replace("খাবার:", "").replace(/g\/দিন$/i, "").replace(/g$/i, "").trim();
    } else if (trimmed.startsWith("দর:")) {
      unitPriceStr = trimmed.replace("দর:", "").trim();
    } else if (trimmed.startsWith("মাধ্যম:")) {
      paymentMethodStr = trimmed.replace("মাধ্যম:", "").trim();
    } else if (trimmed.startsWith("সাপ্লায়ার:")) {
      supplierIdStr = trimmed.replace("সাপ্লায়ার:", "").trim();
    } else {
      cleanParts.push(trimmed.replace(/\s*\(Supplier:[^)]+\)\s*$/, "").trim());
    }
  });

  const numMatch = initWeightStr.match(/[\d.]+/);
  const initWeightNum = numMatch ? parseFloat(numMatch[0]) : 0;

  return {
    initWeightStr,
    initWeightNum,
    dailyFeedStr,
    unitPriceStr,
    paymentMethodStr,
    supplierIdStr,
    cleanNote: cleanParts.filter(Boolean).join(" | "),
  };
}

export function computeThreeStagePoultryMetrics(
  totalDays: number,
  currentBirds: number,
  initWeightNum?: number
) {
  const safeDays = Math.max(0, totalDays);
  const birds = Math.max(0, currentBirds);

  // Stage 1: 0 - 44 days -> বাচ্চা মুরগি
  if (safeDays < 45) {
    const baseG = initWeightNum && initWeightNum > 0 && initWeightNum < 500 ? initWeightNum : 45;
    const estGrams = Math.round(baseG + safeDays * ((420 - baseG) / 45));
    return {
      age_stage: 1 as const,
      age_stage_label: "১ম ধাপ (বাচ্চা)",
      chick_birds: birds,
      medium_birds: 0,
      adult_birds: 0,
      avg_weight_g: estGrams,
      avg_weight_display: `${estGrams} গ্রাম`,
    };
  }

  // Stage 2: 45 - 119 days -> মাঝারি মুরগি
  if (safeDays < 120) {
    const estGrams = Math.round(500 + ((safeDays - 45) / 75) * 850);
    return {
      age_stage: 2 as const,
      age_stage_label: "২য় ধাপ (মাঝারি)",
      chick_birds: 0,
      medium_birds: birds,
      adult_birds: 0,
      avg_weight_g: estGrams,
      avg_weight_display:
        estGrams >= 1000 ? `${(estGrams / 1000).toFixed(2)} কেজি` : `${estGrams} গ্রাম`,
    };
  }

  // Stage 3: >= 120 days -> বড় মুরগি (মাঝারি becomes 0!)
  const estKg = Math.min(2.1, 1.45 + ((safeDays - 120) / 150) * 0.55);
  return {
    age_stage: 3 as const,
    age_stage_label: "৩য় ধাপ (বড় মুরগি)",
    chick_birds: 0,
    medium_birds: 0,
    adult_birds: birds,
    avg_weight_g: Math.round(estKg * 1000),
    avg_weight_display: `${estKg.toFixed(2)} কেজি`,
  };
}

/**
 * 6. List All Poultry Flocks with Real-Time Dynamic 3-Stage Age, Weight, Exact Mortality & Linked Product
 */
export async function listPoultryFlocksWithMetrics() {
  const [flocks, mortalityLogs, chickenProducts] = await Promise.all([
    prisma.poultry_flocks.findMany({
      orderBy: { id: "desc" },
      include: {
        egg_collections: {
          select: {
            total_collected: true,
            accepted_quantity: true,
            rejected_breakage: true,
          },
        },
      },
    }),
    prisma.audit_logs.findMany({
      where: { entity_type: "POULTRY_MORTALITY" },
      select: { entity_id: true, new_values: true },
    }),
    prisma.products.findMany({
      where: {
        status: { not: "deleted" },
        OR: [
          { surface_finish: { startsWith: "FLOCK:" } },
          { category_id: BigInt(4) },
        ],
      },
      include: { units: true },
      orderBy: { id: "desc" },
    }),
  ]);

  // Sum recorded mortality per flock ID
  const mortalityByFlock = new Map<string, number>();
  for (const log of mortalityLogs) {
    if (!log.entity_id) continue;
    try {
      const parsed =
        typeof log.new_values === "string"
          ? JSON.parse(log.new_values)
          : (log.new_values as any);
      const count = Number(parsed?.mortality_count || 0);
      if (count > 0) {
        mortalityByFlock.set(
          String(log.entity_id),
          (mortalityByFlock.get(String(log.entity_id)) || 0) + count
        );
      }
    } catch {}
  }

  return flocks.map((flock) => {
    const age = calculateAgeInMonthsAndDays(flock.housing_date, new Date());
    const noteMeta = parseFlockNoteMetadata(flock.note);
    const dailyFeedRateG =
      noteMeta.dailyFeedStr && !isNaN(Number(noteMeta.dailyFeedStr)) && Number(noteMeta.dailyFeedStr) > 0
        ? Number(noteMeta.dailyFeedStr)
        : 120;
    const feedReq = calculateDailyFeedRequirementKg(flock.current_birds_count, dailyFeedRateG);
    const expectedDailyFeedKg = feedReq.dailyKg;

    const mortalityCount = mortalityByFlock.get(String(flock.id)) || 0;
    const mortalityPercent =
      flock.initial_chicks_count > 0 ? (mortalityCount / flock.initial_chicks_count) * 100 : 0;

    const stageMetrics = computeThreeStagePoultryMetrics(
      age.totalDays,
      flock.current_birds_count,
      noteMeta.initWeightNum
    );

    // Match linked commercial product (only for non-chick flocks or explicit FLOCK:<id> link)
    const flockTag = `FLOCK:${flock.id}`;
    const matchedProd =
      chickenProducts.find((p) => p.surface_finish === flockTag) ||
      (stageMetrics.age_stage >= 2
        ? chickenProducts.find(
            (p) =>
              !p.surface_finish &&
              flock.shed_name &&
              p.product_name.includes(`(${flock.shed_name}`)
          )
        : undefined);

    const totalEggsCollected = flock.egg_collections.reduce((sum, c) => sum + c.total_collected, 0);

    return {
      id: Number(flock.id),
      flock_code: flock.flock_code,
      shed_name: flock.shed_name,
      breed: flock.breed,
      housing_date: flock.housing_date.toISOString().split("T")[0],
      status: flock.status,
      initial_chicks_count: flock.initial_chicks_count,
      current_birds_count: flock.current_birds_count,
      current_birds: flock.current_birds_count,
      chick_birds: stageMetrics.chick_birds,
      medium_birds: stageMetrics.medium_birds,
      adult_birds: stageMetrics.adult_birds,
      age_stage: stageMetrics.age_stage,
      age_stage_label: stageMetrics.age_stage_label,
      avg_weight_g: stageMetrics.avg_weight_g,
      avg_weight_display: stageMetrics.avg_weight_display,
      mortality_count: mortalityCount,
      mortality_rate_percent: parseFloat(mortalityPercent.toFixed(1)),
      age_display: age.display,
      age_months: age.months,
      age_days: age.days,
      age_total_days: age.totalDays,
      daily_feed_rate_g: dailyFeedRateG,
      expected_daily_feed_kg: parseFloat(expectedDailyFeedKg.toFixed(2)),
      actual_feed_consumed_kg: Number(flock.feed_consumed_kg),
      total_expenses: Number(flock.total_expenses),
      total_eggs_collected: totalEggsCollected,
      note: flock.note,
      clean_note: noteMeta.cleanNote,
      init_weight_input: noteMeta.initWeightStr,
      unit_price_input: noteMeta.unitPriceStr,
      payment_method_input: noteMeta.paymentMethodStr,
      supplier_id_input: noteMeta.supplierIdStr,
      linked_product: matchedProd
        ? {
            id: Number(matchedProd.id),
            product_name: matchedProd.product_name,
            quantity: parseFloat(matchedProd.quantity || "0"),
            sell_price: parseFloat(matchedProd.sell_price || "0"),
            cost_price: parseFloat(matchedProd.cost_price || "0"),
            weight_display: matchedProd.door_side || stageMetrics.avg_weight_display,
            size_group:
              matchedProd.grade || (stageMetrics.age_stage === 3 ? "LARGE" : "MEDIUM"),
            unit: matchedProd.units?.unit_name || "Pcs",
          }
        : null,
    };
  });
}
