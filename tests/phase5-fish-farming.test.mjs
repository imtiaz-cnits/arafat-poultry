import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  createPond,
  createFishBatch,
  recordMortality,
  recordGrowthSample,
  recordHarvest,
  recordFishSale,
  recordBatchExpense,
  getFishFarmingDashboardData,
} from "../lib/fish-service.ts";
import { recordFeedPurchase, recordInternalFeedIssue } from "../lib/feed-service.ts";

const prisma = new PrismaClient();

test("PHASE 5: COMPREHENSIVE FISH FARMING & COMMERCE WORKFLOW", async (t) => {
  const adminUser = await prisma.users.findFirst();
  assert.ok(adminUser, "Admin user must exist");
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const kgUnit = await prisma.units.findFirst({ where: { unit_name: "Kg" } }) ||
                 await prisma.units.findFirst();

  // Test Customer
  const customer = await prisma.customers.create({
    data: {
      customer_id: "CUST-TEST-" + Date.now(),
      customer_name: "Fish Trader Rahim",
      mobile: "01755" + Math.floor(100000 + Math.random() * 900000),
      previous_due_amount: "0.00",
      user_id: adminUser.id,
    },
  });

  // Test Supplier for feed
  const supplier = await prisma.suppliers.create({
    data: {
      supplier_id: "SUP-TEST-" + Date.now(),
      name: "Mega Aqua Feeds Ltd",
      company: "Mega Feeds",
      mobile: "01822" + Math.floor(100000 + Math.random() * 900000),
      address: "Dhaka",
      status: "active",
      user_id: adminUser.id,
    },
  });

  // Ensure Species exist
  let speciesRohu = await prisma.fish_species.findFirst({ where: { species_name: "Rohu (রুই)" } });
  if (!speciesRohu) {
    speciesRohu = await prisma.fish_species.create({
      data: {
        species_name: "Rohu (রুই)",
        scientific_name: "Labeo rohita",
        default_culture_days: 240,
      },
    });
  }

  let speciesCatla = await prisma.fish_species.findFirst({ where: { species_name: "Catla (কাতলা)" } });
  if (!speciesCatla) {
    speciesCatla = await prisma.fish_species.create({
      data: {
        species_name: "Catla (কাতলা)",
        scientific_name: "Gibelion catla",
        default_culture_days: 270,
      },
    });
  }

  // Create Ponds
  const pond1Code = "POND-TEST-" + Date.now();
  const pond1 = await createPond({
    pondCode: pond1Code,
    pondName: "North Pond 01",
    location: "Block A, Farm Complex",
    areaDecimal: 50,
    waterDepthFeet: 6.5,
    note: "Commercial grow-out pond",
    userId: adminUser.id,
  });
  assert.ok(pond1.id, "Pond 1 must be created");

  // Create Saleable Products for harvested fish
  const rohuProduct = await prisma.products.create({
    data: {
      product_name: "Live Rohu Fish (জীবন্ত রুই মাছ) - " + Date.now(),
      quantity: "0",
      cost_price: "0",
      sell_price: "220.00",
      status: "active",
      product_code: ["FISH-ROHU-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: kgUnit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  const catlaProduct = await prisma.products.create({
    data: {
      product_name: "Live Catla Fish (জীবন্ত কাতলা মাছ) - " + Date.now(),
      quantity: "0",
      cost_price: "0",
      sell_price: "250.00",
      status: "active",
      product_code: ["FISH-CATLA-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: kgUnit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  // Step 1: Stock defined number of fingerlings (5,000 @ 2.00 = 10,000 ৳)
  await t.test("1. Stock defined number of fingerlings into batch", async () => {
    const batchRes = await createFishBatch({
      pondId: pond1.id,
      speciesId: speciesRohu.id,
      productId: rohuProduct.id,
      fingerlingCount: 5000,
      fingerlingUnitCost: 2.0,
      note: "Stocked 5,000 Rohu fingerlings",
      userId: adminUser.id,
    });

    assert.equal(batchRes.success, true);
    assert.equal(batchRes.fingerlingCount, 5000);
    assert.equal(batchRes.totalCost, 10000);
    assert.equal(batchRes.currentFishCount, 5000);

    const b = await prisma.fish_batches.findUnique({ where: { id: batchRes.batchId } });
    assert.equal(Number(b.fingerling_total_cost), 10000);
    assert.equal(b.current_fish_count, 5000);
    assert.equal(b.total_mortality_count, 0);
    assert.equal(b.status, "ACTIVE");
  });

  // Step 2: Record mortality (200 fish -> 4,800 remaining)
  let activeBatch;
  await t.test("2. Record fish mortality and check validation", async () => {
    activeBatch = await prisma.fish_batches.findFirst({
      where: { pond_id: pond1.id, species_id: speciesRohu.id },
    });
    assert.ok(activeBatch, "Active batch must exist");

    // Negative test: mortality exceeding current fish count must throw
    await assert.rejects(
      async () => {
        await recordMortality({
          batchId: activeBatch.id,
          mortalityCount: 6000,
          userId: adminUser.id,
        });
      },
      /মৃত মাছের সংখ্যা বর্তমান মাছের চেয়ে বেশি হতে পারে না/
    );

    // Valid mortality: 200 fish
    const mortRes = await recordMortality({
      batchId: activeBatch.id,
      mortalityCount: 200,
      reason: "Initial transport acclimatization loss",
      userId: adminUser.id,
    });

    assert.equal(mortRes.success, true);
    assert.equal(mortRes.mortalityCount, 200);
    assert.equal(mortRes.remainingCount, 4800);

    const updated = await prisma.fish_batches.findUnique({ where: { id: activeBatch.id } });
    assert.equal(updated.current_fish_count, 4800);
    assert.equal(updated.total_mortality_count, 200);
  });

  // Step 3: Record average-weight sample (800g / 0.8kg -> 3,840 kg estimated live biomass)
  await t.test("3. Growth sampling & live biomass calculation (800g -> 3,840 kg)", async () => {
    // 50 fish sample weighing 40 kg => 40/50 = 0.8 kg = 800 g
    const sampleRes = await recordGrowthSample({
      batchId: activeBatch.id,
      sampleCount: 50,
      sampleWeightKg: 40.0,
      note: "Bi-weekly growth monitoring sample",
      userId: adminUser.id,
    });

    assert.equal(sampleRes.success, true);
    assert.equal(sampleRes.avgWeightG, 800);
    assert.equal(sampleRes.currentFishCount, 4800);
    // 4800 * 0.8 = 3840 kg
    assert.equal(sampleRes.estimatedBiomassKg, 3840);

    const updated = await prisma.fish_batches.findUnique({ where: { id: activeBatch.id } });
    assert.equal(Number(updated.latest_avg_weight_g), 800);
    assert.equal(Number(updated.estimated_biomass_kg), 3840);
  });

  // Step 4: Issue internal feed to pond & batch expenses
  await t.test("4. Feed procurement and internal feed issue to pond", async () => {
    // Create feed product
    const feedProduct = await prisma.products.create({
      data: {
        product_name: "Mega Sinking Aqua Feed 28% - " + Date.now(),
        quantity: "0",
        cost_price: "2000.00",
        sell_price: "2200.00",
        status: "active",
        product_code: ["FEED-AQUA-" + Date.now()],
        brand_id: brand?.id || 1n,
        category_id: category?.id || 1n,
        unit_id: kgUnit?.id || 1n,
        user_id: adminUser.id,
      },
    });

    // Procure 20 bags @ 2,000 = 40,000 (credit purchase from supplier)
    await recordFeedPurchase({
      supplierId: supplier.id,
      productId: feedProduct.id,
      bags: 20,
      bagWeightKg: 50,
      costPricePerBag: 2000,
      paidAmount: 0,
      userId: adminUser.id,
    });

    // Issue 10 bags to pond1 (allocated to activeBatch)
    const issueRes = await recordInternalFeedIssue({
      productId: feedProduct.id,
      destinationType: "FISH_POND",
      destinationId: activeBatch.id,
      destinationName: pond1.pond_name,
      bags: 10,
      bagWeightKg: 50,
      note: "Allocated 10 bags sinking feed for growout",
      userId: adminUser.id,
    });

    assert.equal(issueRes.bagsIssued, 10);
    assert.equal(issueRes.totalCostAllocated, 20000);

    // Verify batch accumulated feed cost
    const updatedBatch = await prisma.fish_batches.findUnique({ where: { id: activeBatch.id } });
    assert.equal(Number(updatedBatch.accumulated_feed_cost), 20000);

    // Also record operational expense (labor/lime) = 2,000 ৳
    const expRes = await recordBatchExpense({
      batchId: activeBatch.id,
      amount: 2000,
      expenseCategory: "MEDICINE_AND_LIME",
      note: "Pond water treatment lime application",
      userId: adminUser.id,
    });
    assert.equal(expRes.success, true);
    assert.equal(expRes.amount, 2000);

    const recheck = await prisma.fish_batches.findUnique({ where: { id: activeBatch.id } });
    // Total production cost so far:
    // 10,000 (fingerlings) + 20,000 (feed) + 2,000 (lime/other) = 32,000 ৳
    const totalCost =
      Number(recheck.fingerling_total_cost) +
      Number(recheck.accumulated_feed_cost) +
      Number(recheck.accumulated_other_expenses);
    assert.equal(totalCost, 32000);
  });

  // Step 5: Record partial harvest (1,000 fish weighing 850 kg)
  await t.test("5. Record partial harvest (1,000 fish / 850 kg) & verify inventory", async () => {
    // Attempting harvest exceeding available fish must fail
    await assert.rejects(
      async () => {
        await recordHarvest({
          batchId: activeBatch.id,
          productId: rohuProduct.id,
          harvestType: "PARTIAL",
          fishCount: 5000, // only 4800 available
          totalWeightKg: 4000,
          userId: adminUser.id,
        });
      },
      /আহরণের সংখ্যা বর্তমান মাছের চেয়ে বেশি হতে পারে না/
    );

    // Partial harvest: 1,000 fish, 850 kg
    const harvestRes = await recordHarvest({
      batchId: activeBatch.id,
      productId: rohuProduct.id,
      harvestType: "PARTIAL",
      fishCount: 1000,
      totalWeightKg: 850,
      note: "First commercial partial netting",
      userId: adminUser.id,
    });

    assert.equal(harvestRes.success, true);
    assert.equal(harvestRes.fishCount, 1000);
    assert.equal(harvestRes.totalWeightKg, 850);
    assert.equal(harvestRes.remainingFishCount, 3800); // 4800 - 1000 = 3800

    // Cost allocation check:
    // Total batch cost was 32,000. 1000 / 4800 = 0.208333... of 32,000 = 6,666.67 ৳
    const expectedAllocatedCost = parseFloat(((1000 / 4800) * 32000).toFixed(2));
    assert.equal(harvestRes.costAllocated, expectedAllocatedCost);

    // Remaining batch valuation = 32,000 - 6,666.67 = 25,333.33 ৳
    assert.equal(harvestRes.remainingBatchValuation, parseFloat((32000 - expectedAllocatedCost).toFixed(2)));

    // Verify saleable inventory created EXACTLY ONCE
    const prod = await prisma.products.findUnique({ where: { id: rohuProduct.id } });
    assert.equal(parseFloat(prod.quantity), 850);

    const movements = await prisma.stock_movements.findMany({
      where: {
        product_id: rohuProduct.id,
        movement_type: "HARVEST_INWARD",
      },
    });
    assert.equal(movements.length, 1);
    assert.equal(parseFloat(movements[0].quantity), 850);
  });

  // Step 6: Sell part of harvested quantity (300 kg @ 180 ৳/kg = 54,000 ৳)
  await t.test("6. Commercial Fish Sale (300 kg @ 180 ৳) & stock deduction", async () => {
    const saleRes = await recordFishSale({
      customerId: customer.id,
      productId: rohuProduct.id,
      kg: 300,
      sellingPricePerKg: 180,
      paidAmount: 54000,
      paymentMethod: "Cash",
      note: "Live wholesale sale to Rahim",
      userId: adminUser.id,
    });

    assert.equal(saleRes.success, true);
    assert.equal(saleRes.kgSold, 300);
    assert.equal(saleRes.totalSaleAmount, 54000);
    assert.equal(saleRes.paidAmount, 54000);
    assert.equal(saleRes.dueAmount, 0);

    // Verify remaining inventory is 550 kg (850 - 300)
    assert.equal(saleRes.remainingStockKg, 550);

    const prod = await prisma.products.findUnique({ where: { id: rohuProduct.id } });
    assert.equal(parseFloat(prod.quantity), 550);

    // Check Customer Ledger
    const ledger = await prisma.party_ledger_entries.findFirst({
      where: { customer_id: customer.id, reference_type: "ORDER" },
      orderBy: { id: "desc" },
    });
    assert.ok(ledger);
    assert.equal(Number(ledger.debit), 54000);
    assert.equal(Number(ledger.credit), 54000);
  });

  // Step 7: Final harvest and batch completion
  await t.test("7. Final harvest of remaining 3,800 fish & batch closure", async () => {
    const finalHarvestRes = await recordHarvest({
      batchId: activeBatch.id,
      productId: rohuProduct.id,
      harvestType: "FINAL",
      fishCount: 3800,
      totalWeightKg: 3200,
      note: "Final pond drainage harvest",
      userId: adminUser.id,
    });

    assert.equal(finalHarvestRes.success, true);
    assert.equal(finalHarvestRes.remainingFishCount, 0);
    assert.equal(finalHarvestRes.isCompleted, true);

    // Batch status must be COMPLETED
    const closedBatch = await prisma.fish_batches.findUnique({ where: { id: activeBatch.id } });
    assert.equal(closedBatch.status, "COMPLETED");
    assert.equal(closedBatch.current_fish_count, 0);
    assert.equal(closedBatch.total_harvested_count, 4800);
    assert.equal(Number(closedBatch.total_harvested_kg), 850 + 3200);

    // Total harvested cost must equal total batch production cost (32,000)
    assert.equal(Number(closedBatch.total_harvested_cost), 32000);

    // Stock in inventory: 550 previous + 3200 = 3750 kg
    const finalProd = await prisma.products.findUnique({ where: { id: rohuProduct.id } });
    assert.equal(parseFloat(finalProd.quantity), 3750);
  });

  // Step 8: Multi-species & Multi-batch in one pond
  await t.test("8. Multiple species & concurrent batches in same pond", async () => {
    const catlaBatch = await createFishBatch({
      pondId: pond1.id,
      speciesId: speciesCatla.id,
      productId: catlaProduct.id,
      fingerlingCount: 2000,
      fingerlingUnitCost: 5.0,
      note: "Polyculture Catla batch",
      userId: adminUser.id,
    });

    assert.equal(catlaBatch.success, true);
    assert.equal(catlaBatch.fingerlingCount, 2000);

    // Verify both batches exist on pond1
    const pondBatches = await prisma.fish_batches.findMany({ where: { pond_id: pond1.id } });
    assert.ok(pondBatches.length >= 2, "Pond must support multiple batches");
  });

  // Step 9: Dashboard and analytical reporting reconciliation
  await t.test("9. Fish farming dashboard data & reconciliation", async () => {
    const dash = await getFishFarmingDashboardData();
    assert.ok(dash.summary.total_ponds >= 1);
    assert.ok(dash.summary.total_batches >= 2);
    assert.ok(dash.summary.total_harvested_kg >= 4050);
    assert.ok(dash.summary.total_harvested_cost >= 32000);
    assert.ok(dash.batches.length >= 2);
    assert.ok(dash.recent_harvests.length >= 2);
  });
});
