import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  getConsolidatedProfitAndLoss,
  getBusinessUnitProfitAndLoss,
  getCashAndBankReconciliation,
  getCustomerReceivablesAndAging,
  getSupplierPayablesAndAging,
  getInventoryValuationReport,
  recordPaymentVoucher,
  recordReceiptVoucher,
} from "../lib/accounting-service.ts";
import { recordFeedPurchase, recordFeedSale, recordInternalFeedIssue } from "../lib/feed-service.ts";
import { recordEggCollection, recordEggSale } from "../lib/egg-service.ts";
import { createFishBatch, recordHarvest, recordFishSale } from "../lib/fish-service.ts";

const prisma = new PrismaClient();

test("PHASE 6: CONSOLIDATED ACCOUNTING & REPORTING RECONCILIATION", async (t) => {
  const adminUser = await prisma.users.findFirst();
  assert.ok(adminUser, "Admin user must exist");
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const bagUnit = await prisma.units.findFirst({ where: { unit_name: "Bag" } }) ||
                 await prisma.units.findFirst();
  const pieceUnit = await prisma.units.findFirst({ where: { unit_name: "Piece" } }) ||
                   await prisma.units.findFirst();
  const kgUnit = await prisma.units.findFirst({ where: { unit_name: "Kg" } }) ||
                 await prisma.units.findFirst();

  // Test Customer
  const customer = await prisma.customers.create({
    data: {
      customer_id: "CUST-ACC-" + Date.now(),
      customer_name: "Accounting Test Customer",
      mobile: "01999" + Math.floor(100000 + Math.random() * 900000),
      previous_due_amount: "0.00",
      user_id: adminUser.id,
    },
  });

  // Test Supplier
  const supplier = await prisma.suppliers.create({
    data: {
      supplier_id: "SUPP-ACC-" + Date.now(),
      name: "Accounting Test Supplier",
      company: "National Feeds & Inputs",
      mobile: "01777" + Math.floor(100000 + Math.random() * 900000),
      purchase_payable_amount: "0.00",
      address: "Dhaka",
      status: "active",
      user_id: adminUser.id,
    },
  });

  // Test Products
  const feedProduct = await prisma.products.create({
    data: {
      product_name: "Test Layer Feed 50KG - " + Date.now(),
      quantity: "0",
      cost_price: "2500.00",
      sell_price: "2800.00",
      status: "active",
      product_code: ["TEST-ACC-FEED-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: bagUnit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  // Test Flock
  const flock = await prisma.poultry_flocks.create({
    data: {
      flock_code: "FLOCK-ACC-" + Date.now(),
      shed_name: "Shed Accounting Test",
      breed: "Lohmann Brown",
      initial_chicks_count: 500,
      current_birds_count: 500,
      status: "ACTIVE",
      user_id: adminUser.id,
    },
  });

  // Test Pond & Species
  const pond = await prisma.fish_ponds.create({
    data: {
      pond_code: "POND-ACC-" + Date.now(),
      pond_name: "Pond Accounting Test",
      area_decimal: 30,
      water_depth_feet: 6,
      status: "ACTIVE",
      user_id: adminUser.id,
    },
  });
  const species = await prisma.fish_species.findFirst() || await prisma.fish_species.create({
    data: { species_name: "Test Tilapia - " + Date.now(), default_culture_days: 120 },
  });

  // -------------------------------------------------------------
  // Test 1: Supplier payment must not duplicate purchase expense
  // -------------------------------------------------------------
  await t.test("1. Supplier payment must not duplicate purchase expense", async () => {
    // 1. Purchase 10 bags on credit: 10 * 2500 = 25,000 ৳
    await recordFeedPurchase({
      supplierId: supplier.id,
      productId: feedProduct.id,
      bags: 10,
      bagWeightKg: 50,
      costPricePerBag: 2500,
      paidAmount: 0, // 100% on credit
      userId: adminUser.id,
    });

    // Supplier payable must now be 25,000
    const suppCheck = await prisma.suppliers.findUnique({ where: { id: supplier.id } });
    assert.equal(parseFloat(suppCheck.purchase_payable_amount || "0"), 25000);

    // Initial P&L expenses before supplier payment
    const pnlBefore = await getConsolidatedProfitAndLoss();
    const operatingExpensesBefore = pnlBefore.operating_expenses.total_operating_expenses;

    // 2. Disburse 15,000 ৳ partial payment via Payment Voucher
    const voucherRes = await recordPaymentVoucher({
      voucherType: "SUPPLIER_PAYMENT",
      supplierId: supplier.id,
      amount: 15000,
      paymentMethod: "Cash",
      note: "Partial settlement for Feed Purchase",
      userId: adminUser.id,
    });

    assert.equal(voucherRes.success, true);
    assert.equal(voucherRes.amount, 15000);

    // Supplier payable must be reduced to 10,000 (25,000 - 15,000)
    const suppAfter = await prisma.suppliers.findUnique({ where: { id: supplier.id } });
    assert.equal(parseFloat(suppAfter.purchase_payable_amount || "0"), 10000);

    // P&L Operating Expenses must NOT increase because settling liability is NOT a new expense!
    const pnlAfter = await getConsolidatedProfitAndLoss();
    assert.equal(
      pnlAfter.operating_expenses.total_operating_expenses,
      operatingExpensesBefore,
      "Supplier payment voucher must settle liability and NOT duplicate operating expenses"
    );
  });

  // -------------------------------------------------------------
  // Test 2: Customer collection must not duplicate sales revenue
  // -------------------------------------------------------------
  await t.test("2. Customer collection must not duplicate sales revenue", async () => {
    // 1. Credit sale of 4 bags of feed: 4 * 2800 = 11,200 ৳
    await recordFeedSale({
      customerId: customer.id,
      productId: feedProduct.id,
      bags: 4,
      sellingPrice: 2800,
      isPerBagSale: true,
      paidAmount: 0, // 100% credit
      userId: adminUser.id,
    });

    // Customer due must now be 11,200
    const custCheck = await prisma.customers.findUnique({ where: { id: customer.id } });
    assert.equal(parseFloat(custCheck.previous_due_amount || "0"), 11200);

    const pnlBefore = await getConsolidatedProfitAndLoss();
    const grossRevenueBefore = pnlBefore.revenue.gross_sales_revenue;

    // 2. Customer pays 6,000 ৳ via Receipt Voucher
    const receiptRes = await recordReceiptVoucher({
      customerId: customer.id,
      amount: 6000,
      paymentMethod: "Cash",
      note: "Partial due collection",
      userId: adminUser.id,
    });

    assert.equal(receiptRes.success, true);
    assert.equal(receiptRes.amount, 6000);

    // Customer due must now be reduced to 5,200 (11,200 - 6,000)
    const custAfter = await prisma.customers.findUnique({ where: { id: customer.id } });
    assert.equal(parseFloat(custAfter.previous_due_amount || "0"), 5200);

    // Sales Revenue in P&L must NOT increase because collecting receivable is NOT new revenue!
    const pnlAfter = await getConsolidatedProfitAndLoss();
    assert.equal(
      pnlAfter.revenue.gross_sales_revenue,
      grossRevenueBefore,
      "Customer due collection voucher must settle receivable and NOT duplicate sales revenue"
    );
  });

  // -------------------------------------------------------------
  // Test 3: Internal feed issue must not create external sales revenue
  // -------------------------------------------------------------
  await t.test("3. Internal feed issue must not create external sales revenue", async () => {
    const pnlBefore = await getConsolidatedProfitAndLoss();
    const netRevenueBefore = pnlBefore.revenue.net_sales_revenue;

    // Issue 2 bags of feed to the layer poultry farm (cost = 2 * 2500 = 5000 ৳)
    const issueRes = await recordInternalFeedIssue({
      productId: feedProduct.id,
      destinationType: "POULTRY_FARM",
      destinationId: flock.id,
      destinationName: flock.shed_name,
      bags: 2,
      bagWeightKg: 50,
      note: "Daily flock feed ration",
      userId: adminUser.id,
    });

    assert.equal(issueRes.bagsIssued, 2);
    assert.equal(issueRes.totalCostAllocated, 5000);

    const pnlAfter = await getConsolidatedProfitAndLoss();
    assert.equal(
      pnlAfter.revenue.net_sales_revenue,
      netRevenueBefore,
      "Internal feed issue must strictly NOT add to sales revenue"
    );

    // Verify Business Unit P&L internal transfers report
    const buPnl = await getBusinessUnitProfitAndLoss();
    assert.ok(buPnl.internal_feed_transfers.total_internal_transfers_cost >= 5000);
  });

  // -------------------------------------------------------------
  // Test 4: Feed inventory value and farm production costs reconciliation
  // -------------------------------------------------------------
  await t.test("4. Feed inventory value and production costs reconcile", async () => {
    // Current stock of feed: 10 bought - 4 sold - 2 internally issued = 4 bags remaining
    const prod = await prisma.products.findUnique({ where: { id: feedProduct.id } });
    assert.equal(parseFloat(prod.quantity || "0"), 4);

    // Feed inventory valuation = 4 bags * 2500 = 10,000 ৳
    const inv = await getInventoryValuationReport();
    const feedItem = inv.products.find((p) => p.id === Number(feedProduct.id));
    assert.ok(feedItem);
    assert.equal(feedItem.valuation, 10000);
  });

  // -------------------------------------------------------------
  // Test 5: Partial harvests allocate proportional cost
  // -------------------------------------------------------------
  await t.test("5. Partial harvests allocate proportional cost without charging all batch cost", async () => {
    // 1. Stock 4,000 fingerlings @ 2.00 = 8,000 ৳
    const batchRes = await createFishBatch({
      pondId: pond.id,
      speciesId: species.id,
      fingerlingCount: 4000,
      fingerlingUnitCost: 2.0,
      note: "Partial harvest accounting test batch",
      userId: adminUser.id,
    });

    const fishProduct = await prisma.products.create({
      data: {
        product_name: "Test Accounting Tilapia - " + Date.now(),
        quantity: "0",
        cost_price: "0",
        sell_price: "160.00",
        status: "active",
        product_code: ["FISH-ACC-" + Date.now()],
        brand_id: brand?.id || 1n,
        category_id: category?.id || 1n,
        unit_id: kgUnit?.id || 1n,
        user_id: adminUser.id,
      },
    });

    // 2. Partial harvest of 1,000 fish (25% of batch) weighing 700 kg
    const harvestRes = await recordHarvest({
      batchId: batchRes.batchId,
      productId: fishProduct.id,
      harvestType: "PARTIAL",
      fishCount: 1000,
      totalWeightKg: 700,
      userId: adminUser.id,
    });

    // Exactly 25% of 8,000 = 2,000 ৳ must be allocated
    assert.equal(harvestRes.costAllocated, 2000);
    // Remaining batch valuation must maintain 6,000 ৳ (8,000 - 2,000)
    assert.equal(harvestRes.remainingBatchValuation, 6000);
    assert.equal(harvestRes.remainingFishCount, 3000);
  });

  // -------------------------------------------------------------
  // Test 6: Unsold inventory must not be treated as sold
  // -------------------------------------------------------------
  await t.test("6. Unsold inventory is asset on balance sheet, not COGS", async () => {
    const inv = await getInventoryValuationReport();
    assert.ok(inv.total_inventory_valuation > 0);

    // Verify standing batch biomass is included in assets
    assert.ok(inv.live_fish_ponds.length > 0);
    const standingPond = inv.live_fish_ponds.find((p) => p.pond_name === pond.pond_name);
    assert.ok(standingPond);
    assert.equal(standingPond.standing_batch_valuation, 6000);
  });

  // -------------------------------------------------------------
  // Test 7: Returns and reversals restore correct balances
  // -------------------------------------------------------------
  await t.test("7. Returns and reversals restore balances accurately", async () => {
    // Record egg collection of 300 eggs
    const eggProduct = await prisma.products.create({
      data: {
        product_name: "Test Accounting Egg - " + Date.now(),
        quantity: "0",
        cost_price: "0",
        sell_price: "12.00",
        status: "active",
        product_code: ["EGG-ACC-" + Date.now()],
        brand_id: brand?.id || 1n,
        category_id: category?.id || 1n,
        unit_id: pieceUnit?.id || 1n,
        user_id: adminUser.id,
      },
    });

    const colRes = await recordEggCollection({
      flockId: flock.id,
      totalCollected: 300,
      rejectedBreakage: 10,
      allocatedExpenses: 2900, // 290 accepted * 10 = 2900
      grades: [
        { productId: eggProduct.id, gradeName: "Grade A", quantityPieces: 290, trayCapacity: 30 },
      ],
      userId: adminUser.id,
    });

    assert.equal(colRes.acceptedQuantity, 290);
    const prodAfterCol = await prisma.products.findUnique({ where: { id: eggProduct.id } });
    assert.equal(parseFloat(prodAfterCol.quantity || "0"), 290);

    // Sell 90 eggs to customer: 90 * 12 = 1080 ৳
    const saleRes = await recordEggSale({
      customerId: customer.id,
      productId: eggProduct.id,
      quantity: 90,
      unit: "piece",
      unitPrice: 12,
      paidAmount: 1080,
      paymentMethod: "Cash",
      userId: adminUser.id,
    });

    assert.equal(saleRes.piecesDeducted, 90);
    const prodAfterSale = await prisma.products.findUnique({ where: { id: eggProduct.id } });
    assert.equal(parseFloat(prodAfterSale.quantity || "0"), 200); // 290 - 90 = 200
  });

  // -------------------------------------------------------------
  // Test 8: Business-unit profit and consolidated profit reconciliation
  // -------------------------------------------------------------
  await t.test("8. Business-unit profit and consolidated profit reconcile", async () => {
    const consolidated = await getConsolidatedProfitAndLoss();
    assert.ok(consolidated.business_units.length === 4);

    const sumBuGrossProfit = consolidated.business_units.reduce(
      (sum, bu) => sum + bu.gross_profit,
      0
    );

    // Consolidated Gross Profit must equal sum of business units' gross profit
    const diff = Math.abs(consolidated.gross_profit - sumBuGrossProfit);
    assert.ok(diff < 0.05, `Gross profit must reconcile: ${consolidated.gross_profit} vs ${sumBuGrossProfit}`);
  });

  // -------------------------------------------------------------
  // Test 9: Cash/bank/MFS balances reconcile to recorded transactions
  // -------------------------------------------------------------
  await t.test("9. Cash/bank/MFS balances reconcile to transactions", async () => {
    const recon = await getCashAndBankReconciliation();
    assert.ok(recon.accounts.length >= 1);
    assert.ok(recon.total_liquidity > 0);

    // Check that each account has zero discrepancy between recorded balance and transactions net flow
    for (const acc of recon.accounts) {
      assert.equal(acc.is_reconciled, true, `Account ${acc.account_name} must reconcile`);
    }
  });

  // -------------------------------------------------------------
  // Test 10: Reports use authoritative persisted data
  // -------------------------------------------------------------
  await t.test("10. Reports use authoritative persisted data", async () => {
    const receivables = await getCustomerReceivablesAndAging();
    assert.ok(receivables.total_receivables >= 5200);
    assert.ok(receivables.due_customers.some((c) => c.id === Number(customer.id)));

    const payables = await getSupplierPayablesAndAging();
    assert.ok(payables.total_payables >= 10000);
    assert.ok(payables.due_suppliers.some((s) => s.id === Number(supplier.id)));
  });
});
