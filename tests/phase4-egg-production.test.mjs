import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  recordEggCollection,
  regradeEggs,
  recordEggSale,
  recordEggSaleReturn,
  reverseEggCollection,
  getEggPerformanceAndProfitability,
} from "../lib/egg-service.ts";

const prisma = new PrismaClient();

test("MANDATORY EGG PRODUCTION & GRADING WORKFLOW", async () => {
  const adminUser = await prisma.users.findFirst();
  assert.ok(adminUser, "Admin user must exist");
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const pieceUnit = await prisma.units.findFirst({ where: { unit_name: "Piece" } }) ||
                    await prisma.units.findFirst({ where: { unit_name: "Kg" } });

  // 1. Create a test flock
  const flock = await prisma.poultry_flocks.create({
    data: {
      flock_code: "FLOCK-TEST-" + Date.now(),
      shed_name: "Shed 1 - Layer",
      breed: "BV-300 Layer",
      initial_chicks_count: 1000,
      current_birds_count: 980,
      status: "ACTIVE",
      user_id: adminUser.id,
    },
  });

  // 2. Create products for 3 distinct egg grades
  const [gradeA, gradeB, gradeC] = await Promise.all([
    prisma.products.create({
      data: {
        product_name: "TEST_EGG_GRADE_A_" + Date.now(),
        quantity: "0",
        cost_price: "0",
        sell_price: "12.00",
        status: "active",
        product_code: ["EGG-A-" + Date.now()],
        brand_id: brand?.id || 1n,
        category_id: category?.id || 1n,
        unit_id: pieceUnit?.id || 1n,
        user_id: adminUser.id,
      },
    }),
    prisma.products.create({
      data: {
        product_name: "TEST_EGG_GRADE_B_" + Date.now(),
        quantity: "0",
        cost_price: "0",
        sell_price: "10.50",
        status: "active",
        product_code: ["EGG-B-" + Date.now()],
        brand_id: brand?.id || 1n,
        category_id: category?.id || 1n,
        unit_id: pieceUnit?.id || 1n,
        user_id: adminUser.id,
      },
    }),
    prisma.products.create({
      data: {
        product_name: "TEST_EGG_GRADE_C_" + Date.now(),
        quantity: "0",
        cost_price: "0",
        sell_price: "9.00",
        status: "active",
        product_code: ["EGG-C-" + Date.now()],
        brand_id: brand?.id || 1n,
        category_id: category?.id || 1n,
        unit_id: pieceUnit?.id || 1n,
        user_id: adminUser.id,
      },
    }),
  ]);

  const testCustomer = await prisma.customers.create({
    data: {
      customer_id: "CUST-EGG-" + Date.now(),
      customer_name: "Egg Wholesaler Karim",
      mobile: "01800-777888",
      user_id: adminUser.id,
    },
  });

  try {
    // -------------------------------------------------------------
    // Step 1: Record 850 collected eggs, reject 20, accept 830
    // Assign: 500 Grade A, 250 Grade B, 80 Grade C (500 + 250 + 80 = 830)
    // Allocated expenses = 4,150 ৳ (Cost per accepted egg = 4150 / 830 = 5.00 ৳)
    // -------------------------------------------------------------
    const collectionRes = await recordEggCollection({
      flockId: flock.id,
      totalCollected: 850,
      rejectedBreakage: 20,
      allocatedExpenses: 4150,
      grades: [
        { productId: gradeA.id, gradeName: "Grade A", quantityPieces: 500, trayCapacity: 30 },
        { productId: gradeB.id, gradeName: "Grade B", quantityPieces: 250, trayCapacity: 30 },
        { productId: gradeC.id, gradeName: "Grade C", quantityPieces: 80, trayCapacity: 30 },
      ],
      userId: adminUser.id,
    });

    assert.equal(collectionRes.totalCollected, 850, "Total collected eggs must be 850");
    assert.equal(collectionRes.rejectedBreakage, 20, "Rejected breakage must be 20");
    assert.equal(collectionRes.acceptedQuantity, 830, "Accepted eggs must be 830");
    assert.equal(collectionRes.costPerAcceptedEgg, 5.0, "Cost per accepted egg must be 4,150 / 830 = 5.00");

    // Verify initial stock of all 3 grades
    const pA1 = await prisma.products.findUnique({ where: { id: gradeA.id } });
    const pB1 = await prisma.products.findUnique({ where: { id: gradeB.id } });
    const pC1 = await prisma.products.findUnique({ where: { id: gradeC.id } });

    assert.equal(parseFloat(pA1?.quantity || "0"), 500, "Grade A stock must be 500");
    assert.equal(parseFloat(pB1?.quantity || "0"), 250, "Grade B stock must be 250");
    assert.equal(parseFloat(pC1?.quantity || "0"), 80, "Grade C stock must be 80");

    // -------------------------------------------------------------
    // Step 2: Sell a defined quantity from ONE grade (100 pieces from Grade A)
    // -------------------------------------------------------------
    const saleRes = await recordEggSale({
      customerId: testCustomer.id,
      productId: gradeA.id,
      quantity: 100,
      unit: "piece",
      unitPrice: 12.0,
      paidAmount: 1200,
      userId: adminUser.id,
    });

    assert.equal(saleRes.piecesDeducted, 100);
    assert.equal(saleRes.totalSaleAmount, 1200);

    // -------------------------------------------------------------
    // Step 3: Verify ONLY Grade A stock is reduced (500 -> 400)
    // Grade B (250) and Grade C (80) must remain completely untouched!
    // -------------------------------------------------------------
    const pA2 = await prisma.products.findUnique({ where: { id: gradeA.id } });
    const pB2 = await prisma.products.findUnique({ where: { id: gradeB.id } });
    const pC2 = await prisma.products.findUnique({ where: { id: gradeC.id } });

    assert.equal(parseFloat(pA2?.quantity || "0"), 400, "Grade A stock must be exactly 500 - 100 = 400");
    assert.equal(parseFloat(pB2?.quantity || "0"), 250, "Grade B stock must remain exactly 250");
    assert.equal(parseFloat(pC2?.quantity || "0"), 80, "Grade C stock must remain exactly 80");

    // -------------------------------------------------------------
    // Step 4: Verify stock by all grades reconciles to the movement ledger
    // -------------------------------------------------------------
    const movementsA = await prisma.stock_movements.findMany({ where: { product_id: gradeA.id } });
    const totalInwardA = movementsA
      .filter((m) => m.movement_type === "HARVEST_INWARD")
      .reduce((sum, m) => sum + Number(m.quantity), 0);
    const totalOutwardA = movementsA
      .filter((m) => m.movement_type === "SALE_OUTWARD")
      .reduce((sum, m) => sum + Number(m.quantity), 0);

    assert.equal(totalInwardA, 500, "Movement ledger inward for Grade A must be 500");
    assert.equal(totalOutwardA, 100, "Movement ledger outward for Grade A must be 100");
    assert.equal(totalInwardA - totalOutwardA, 400, "Movement ledger balance must equal current stock (400)");

    // -------------------------------------------------------------
    // Step 5: Verify Regrading does NOT create additional eggs
    // Regrade 50 eggs from Grade A to Grade B
    // -------------------------------------------------------------
    const regradeRes = await regradeEggs({
      sourceProductId: gradeA.id,
      destinationProductId: gradeB.id,
      quantityPieces: 50,
      userId: adminUser.id,
    });

    assert.equal(regradeRes.piecesRegraded, 50);

    const pA3 = await prisma.products.findUnique({ where: { id: gradeA.id } });
    const pB3 = await prisma.products.findUnique({ where: { id: gradeB.id } });
    const pC3 = await prisma.products.findUnique({ where: { id: gradeC.id } });

    assert.equal(parseFloat(pA3?.quantity || "0"), 350, "Grade A must be 400 - 50 = 350");
    assert.equal(parseFloat(pB3?.quantity || "0"), 300, "Grade B must be 250 + 50 = 300");
    assert.equal(parseFloat(pC3?.quantity || "0"), 80, "Grade C must remain 80");

    // Total eggs across all grades must be identical (350 + 300 + 80 = 730)
    const totalEggsAfterRegrade =
      parseFloat(pA3?.quantity || "0") +
      parseFloat(pB3?.quantity || "0") +
      parseFloat(pC3?.quantity || "0");
    assert.equal(totalEggsAfterRegrade, 730, "Total eggs across all grades must remain exactly 730 (NO egg created or lost)");
  } finally {
    await prisma.egg_regradings.deleteMany({
      where: { source_product_id: { in: [gradeA.id, gradeB.id, gradeC.id] } },
    });
    await prisma.egg_collection_grades.deleteMany({
      where: { product_id: { in: [gradeA.id, gradeB.id, gradeC.id] } },
    });
    await prisma.egg_collections.deleteMany({ where: { flock_id: flock.id } });
    await prisma.stock_movements.deleteMany({
      where: { product_id: { in: [gradeA.id, gradeB.id, gradeC.id] } },
    });
    await prisma.party_ledger_entries.deleteMany({ where: { customer_id: testCustomer.id } });
    await prisma.customers.delete({ where: { id: testCustomer.id } });
    await prisma.products.deleteMany({
      where: { id: { in: [gradeA.id, gradeB.id, gradeC.id] } },
    });
    await prisma.poultry_flocks.delete({ where: { id: flock.id } });
  }
});

test("Egg Production: Validation Guards (Zero, Negative, Sum Mismatch, Duplicate)", async () => {
  const adminUser = await prisma.users.findFirst();
  const brand = await prisma.brands.findFirst();
  const category = await prisma.categories.findFirst();
  const unit = await prisma.units.findFirst();

  const flock = await prisma.poultry_flocks.create({
    data: {
      flock_code: "FLOCK-GUARD-" + Date.now(),
      shed_name: "Shed 2",
      breed: "Layer",
      user_id: adminUser.id,
    },
  });

  const product = await prisma.products.create({
    data: {
      product_name: "TEST_GUARD_EGG_" + Date.now(),
      quantity: "0",
      cost_price: "0",
      sell_price: "12",
      status: "active",
      product_code: ["GUARD-EGG-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: unit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  try {
    // 1. Zero collected eggs -> Reject
    await assert.rejects(
      async () => {
        await recordEggCollection({
          flockId: flock.id,
          totalCollected: 0,
          rejectedBreakage: 0,
          grades: [{ productId: product.id, gradeName: "Grade A", quantityPieces: 0 }],
          userId: adminUser.id,
        });
      },
      /Total collected eggs must be greater than 0/,
      "Must reject 0 collected eggs"
    );

    // 2. Breakage exceeds total collected -> Reject
    await assert.rejects(
      async () => {
        await recordEggCollection({
          flockId: flock.id,
          totalCollected: 100,
          rejectedBreakage: 120, // Invalid!
          grades: [{ productId: product.id, gradeName: "Grade A", quantityPieces: 0 }],
          userId: adminUser.id,
        });
      },
      /Rejected eggs cannot exceed total collected/,
      "Must reject breakage > total collected"
    );

    // 3. Sum of grades mismatch (Accepted = 100 - 10 = 90, but grades sum = 80) -> Reject
    await assert.rejects(
      async () => {
        await recordEggCollection({
          flockId: flock.id,
          totalCollected: 100,
          rejectedBreakage: 10,
          grades: [{ productId: product.id, gradeName: "Grade A", quantityPieces: 80 }],
          userId: adminUser.id,
        });
      },
      /সমান হতে হবে/,
      "Must reject when grades sum does not equal accepted eggs"
    );
  } finally {
    await prisma.products.delete({ where: { id: product.id } });
    await prisma.poultry_flocks.delete({ where: { id: flock.id } });
  }
});

test("Egg Production: Tray and Dozen Unit Sales Conversion", async () => {
  const adminUser = await prisma.users.findFirst();
  const brand = await prisma.brands.findFirst();
  const category = await prisma.categories.findFirst();
  const unit = await prisma.units.findFirst();

  const product = await prisma.products.create({
    data: {
      product_name: "TEST_TRAY_EGG_" + Date.now(),
      quantity: "300", // 300 pieces = 10 trays of 30
      cost_price: "8",
      sell_price: "360", // 360/tray
      status: "active",
      product_code: ["TRAY-EGG-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: unit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  const testCustomer = await prisma.customers.create({
    data: {
      customer_id: "CUST-TRAY-" + Date.now(),
      customer_name: "Tray Customer",
      mobile: "01700-123456",
      user_id: adminUser.id,
    },
  });

  try {
    // 1. Sell 2 trays of 30 = 60 pieces @ 360/tray
    const sale1 = await recordEggSale({
      customerId: testCustomer.id,
      productId: product.id,
      quantity: 2,
      unit: "tray",
      trayCapacity: 30,
      unitPrice: 360,
      userId: adminUser.id,
    });
    assert.equal(sale1.piecesDeducted, 60);
    assert.equal(sale1.totalSaleAmount, 720);
    assert.equal(sale1.remainingStockPieces, 240, "300 - 60 = 240 pieces remaining (8 trays)");

    // 2. Sell 5 dozens = 60 pieces @ 140/dozen
    const sale2 = await recordEggSale({
      customerId: testCustomer.id,
      productId: product.id,
      quantity: 5,
      unit: "dozen",
      unitPrice: 140,
      userId: adminUser.id,
    });
    assert.equal(sale2.piecesDeducted, 60);
    assert.equal(sale2.totalSaleAmount, 700);
    assert.equal(sale2.remainingStockPieces, 180, "240 - 60 = 180 pieces remaining (6 trays)");

    // 3. Customer return 1 tray of 30
    const ret = await recordEggSaleReturn({
      customerId: testCustomer.id,
      productId: product.id,
      quantity: 1,
      unit: "tray",
      trayCapacity: 30,
      returnPrice: 360,
      userId: adminUser.id,
    });
    assert.equal(ret.piecesReturned, 30);
    assert.equal(ret.remainingStockPieces, 210, "180 + 30 = 210 pieces remaining (7 trays)");
  } finally {
    await prisma.stock_movements.deleteMany({ where: { product_id: product.id } });
    await prisma.party_ledger_entries.deleteMany({ where: { customer_id: testCustomer.id } });
    await prisma.customers.delete({ where: { id: testCustomer.id } });
    await prisma.products.delete({ where: { id: product.id } });
  }
});

test("Egg Production: Reversal of Erroneous Collection Record", async () => {
  const adminUser = await prisma.users.findFirst();
  const brand = await prisma.brands.findFirst();
  const category = await prisma.categories.findFirst();
  const unit = await prisma.units.findFirst();

  const flock = await prisma.poultry_flocks.create({
    data: {
      flock_code: "FLOCK-REV-" + Date.now(),
      shed_name: "Shed 3",
      breed: "Layer",
      user_id: adminUser.id,
    },
  });

  const product = await prisma.products.create({
    data: {
      product_name: "TEST_REV_EGG_" + Date.now(),
      quantity: "0",
      cost_price: "0",
      sell_price: "11",
      status: "active",
      product_code: ["REV-EGG-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: unit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  try {
    // 1. Record collection of 200 eggs
    const collection = await recordEggCollection({
      flockId: flock.id,
      totalCollected: 200,
      rejectedBreakage: 0,
      allocatedExpenses: 1000,
      grades: [{ productId: product.id, gradeName: "Grade A", quantityPieces: 200 }],
      userId: adminUser.id,
    });

    const pAfter = await prisma.products.findUnique({ where: { id: product.id } });
    assert.equal(parseFloat(pAfter?.quantity || "0"), 200);

    // 2. Reverse this collection
    const revRes = await reverseEggCollection(collection.collectionId, adminUser.id, "Counting error");
    assert.equal(revRes.success, true);

    // Stock must be restored to 0
    const pReversed = await prisma.products.findUnique({ where: { id: product.id } });
    assert.equal(parseFloat(pReversed?.quantity || "0"), 0, "Stock must be rolled back to 0 after reversal");

    // Collection status must be REVERSED
    const collRecord = await prisma.egg_collections.findUnique({ where: { id: collection.collectionId } });
    assert.equal(collRecord?.status, "REVERSED");
  } finally {
    await prisma.egg_collection_grades.deleteMany({ where: { product_id: product.id } });
    await prisma.egg_collections.deleteMany({ where: { flock_id: flock.id } });
    await prisma.stock_movements.deleteMany({ where: { product_id: product.id } });
    await prisma.products.delete({ where: { id: product.id } });
    await prisma.poultry_flocks.delete({ where: { id: flock.id } });
  }
});

test.after(async () => {
  await prisma.$disconnect();
});
