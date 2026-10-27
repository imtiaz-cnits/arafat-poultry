import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  recordFeedPurchase,
  recordFeedSale,
  recordFeedPurchaseReturn,
  recordFeedCustomerReturn,
  recordInternalFeedIssue,
  getFeedStockAndProfitability,
} from "../lib/feed-service.ts";

const prisma = new PrismaClient();

test("MANDATORY INTERNAL FEED ISSUE WORKFLOW", async () => {
  const adminUser = await prisma.users.findFirst();
  assert.ok(adminUser, "Admin user must exist");
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const bagUnit = await prisma.units.findFirst({ where: { unit_name: "Bag" } });

  // 1. Setup isolated test feed product
  const feedProduct = await prisma.products.create({
    data: {
      product_name: "TEST_QUALITY_FEED_50KG_" + Date.now(),
      quantity: "0",
      cost_price: "2400.00",
      sell_price: "2600.00",
      status: "active",
      product_code: ["TEST-FEED-50KG-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: bagUnit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  const testSupplier = await prisma.suppliers.create({
    data: {
      supplier_id: "SUP-TEST-" + Date.now(),
      name: "Quality Feeds Ltd",
      company: "Quality Group",
      mobile: "01700-111222",
      address: "Dhaka",
      status: "active",
      user_id: adminUser.id,
    },
  });

  const testCustomer = await prisma.customers.create({
    data: {
      customer_id: "CUST-TEST-" + Date.now(),
      customer_name: "Farmer Rahim",
      mobile: "01800-333444",
      previous_due_amount: "0.00",
      user_id: adminUser.id,
    },
  });

  // Ensure cash account has capital balance for cash purchase test
  const cashAccount = await prisma.financial_accounts.findFirst({
    where: { account_type: "CASH" },
  });
  const originalBalance = cashAccount ? cashAccount.balance : 0;
  if (cashAccount) {
    await prisma.financial_accounts.update({
      where: { id: cashAccount.id },
      data: { balance: 100000 },
    });
  }

  try {
    // -------------------------------------------------------------
    // Step 1: Purchase 20 bags × 50 kg = 1,000 kg @ 2,400/bag
    // -------------------------------------------------------------
    const purchaseRes = await recordFeedPurchase({
      supplierId: testSupplier.id,
      productId: feedProduct.id,
      bags: 20,
      bagWeightKg: 50,
      costPricePerBag: 2400,
      paidAmount: 48000,
      paymentMethod: "Cash",
      referenceNo: "PUR-TEST-001",
      userId: adminUser.id,
    });

    assert.equal(purchaseRes.bags, 20, "Purchased bags must be 20");
    assert.equal(purchaseRes.totalKg, 1000, "Purchased kg must be 1,000 kg (20 bags × 50 kg)");
    assert.equal(purchaseRes.newStock, 20, "Physical stock must be 20 bags");
    assert.equal(purchaseRes.totalBill, 48000, "Total purchase bill must be 20 × 2400 = 48,000");

    // -------------------------------------------------------------
    // Step 2: Sell 3 bags = 150 kg @ 2,600/bag
    // -------------------------------------------------------------
    const saleRes = await recordFeedSale({
      customerId: testCustomer.id,
      productId: feedProduct.id,
      bags: 3,
      sellingPrice: 2600,
      isPerBagSale: true,
      paidAmount: 7800,
      paymentMethod: "Cash",
      userId: adminUser.id,
    });

    assert.equal(saleRes.quantitySold, 3, "Sold bags must be 3");
    assert.equal(saleRes.totalSaleAmount, 7800, "External sales revenue must be 3 × 2600 = 7,800");
    assert.equal(saleRes.remainingStock, 17, "Remaining inventory after sale must be 17 bags (850 kg)");

    // Verify customer ledger has exactly 1 entry for 7,800
    const custLedger = await prisma.party_ledger_entries.findMany({
      where: { customer_id: testCustomer.id },
    });
    assert.equal(custLedger.length, 1, "Customer should have exactly 1 invoice ledger entry");
    assert.equal(Number(custLedger[0].debit), 7800, "Customer debit must be 7,800");

    // -------------------------------------------------------------
    // Step 3: Issue 2 bags = 100 kg to a fish batch
    // -------------------------------------------------------------
    const issueRes = await recordInternalFeedIssue({
      productId: feedProduct.id,
      destinationType: "FISH_POND",
      destinationName: "Pond 1 / Tilapia Batch 2",
      bags: 2,
      bagWeightKg: 50,
      userId: adminUser.id,
    });

    assert.equal(issueRes.bagsIssued, 2, "Issued bags must be 2");
    assert.equal(issueRes.totalKg, 100, "Issued kg must be 100 kg (2 bags × 50 kg)");
    assert.equal(issueRes.totalCostAllocated, 4800, "Fish batch receives exactly 100 kg feed cost: 2 × 2400 = 4,800");

    // -------------------------------------------------------------
    // Step 4: Verification of Expected Remaining Feed Inventory
    // Expected = 20 - 3 - 2 = 15 bags (750 kg)
    // -------------------------------------------------------------
    assert.equal(issueRes.remainingFeedStock, 15, "Remaining feed inventory must be 15 bags");
    const remainingKg = issueRes.remainingFeedStock * 50;
    assert.equal(remainingKg, 750, "Expected remaining feed inventory must be 750 kg");

    // -------------------------------------------------------------
    // Step 5: Verify NO External Sale or Customer Receivable Created
    // -------------------------------------------------------------
    const allCustomerLedger = await prisma.party_ledger_entries.findMany({
      where: { customer_id: testCustomer.id },
    });
    assert.equal(allCustomerLedger.length, 1, "Customer ledger must NOT contain any entry from internal issue");
    assert.equal(Number(allCustomerLedger[0].debit), 7800, "External sales revenue includes ONLY the 3 sold bags (7,800)");

    // Verify orders table has NO order from internal issue
    const orders = await prisma.orders.findMany({
      where: { customer_id: testCustomer.id },
    });
    for (const o of orders) {
      assert.notEqual(o.order_no, issueRes.issueCode, "Internal issue must never create an order row");
    }

    // Verify internal_feed_issues table has the record
    const internalRecord = await prisma.internal_feed_issues.findUnique({
      where: { issue_no: issueRes.issueCode },
    });
    assert.ok(internalRecord, "Internal feed issue record must be persisted");
    assert.equal(Number(internalRecord.bags), 2);
    assert.equal(Number(internalRecord.total_kg), 100);
    assert.equal(Number(internalRecord.total_cost), 4800);

    // Verify Cash Account Balance (100000 - 48000 + 7800 = 59800)
    if (cashAccount) {
      const updatedCash = await prisma.financial_accounts.findUnique({ where: { id: cashAccount.id } });
      assert.equal(Number(updatedCash?.balance), 59800, "Cash balance should be 100000 - 48000 + 7800 = 59800");
    }
  } finally {
    // Clean up
    if (cashAccount) {
      await prisma.financial_accounts.update({
        where: { id: cashAccount.id },
        data: { balance: originalBalance },
      });
      await prisma.financial_transactions.deleteMany({
        where: { reference_no: { in: ["PUR-TEST-001"] } },
      });
    }
    await prisma.internal_feed_issues.deleteMany({ where: { product_id: feedProduct.id } });
    await prisma.stock_movements.deleteMany({ where: { product_id: feedProduct.id } });
    await prisma.feed_products.deleteMany({ where: { product_id: feedProduct.id } });
    await prisma.party_ledger_entries.deleteMany({ where: { customer_id: testCustomer.id } });
    await prisma.party_ledger_entries.deleteMany({ where: { supplier_id: testSupplier.id } });
    await prisma.customers.delete({ where: { id: testCustomer.id } });
    await prisma.suppliers.delete({ where: { id: testSupplier.id } });
    await prisma.products.delete({ where: { id: feedProduct.id } });
  }
});

test("Feed Trading: Different Bag Sizes (25kg bags)", async () => {
  const adminUser = await prisma.users.findFirst();
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const bagUnit = await prisma.units.findFirst({ where: { unit_name: "Bag" } });

  const feed25kg = await prisma.products.create({
    data: {
      product_name: "TEST_FEED_25KG_" + Date.now(),
      quantity: "0",
      cost_price: "1300.00",
      sell_price: "1450.00",
      status: "active",
      product_code: ["TEST-25KG-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: bagUnit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  const testSupplier = await prisma.suppliers.create({
    data: {
      supplier_id: "SUP-TEST-25-" + Date.now(),
      name: "Aftab Feeds",
      company: "Aftab Group",
      mobile: "01700-999888",
      address: "Gazipur",
      status: "active",
      user_id: adminUser.id,
    },
  });

  try {
    // Purchase 10 bags of 25kg = 250 kg @ 1300/bag on credit
    const purchase = await recordFeedPurchase({
      supplierId: testSupplier.id,
      productId: feed25kg.id,
      bags: 10,
      bagWeightKg: 25,
      costPricePerBag: 1300,
      userId: adminUser.id,
    });
    assert.equal(purchase.bags, 10);
    assert.equal(purchase.totalKg, 250, "10 bags × 25 kg = 250 kg");
    assert.equal(purchase.costPerKg, 52, "Cost per kg must be 1300 / 25 = 52.00");

    // Issue 4 bags of 25kg = 100 kg to Poultry Shed
    const issue = await recordInternalFeedIssue({
      productId: feed25kg.id,
      destinationType: "POULTRY_FARM",
      destinationName: "Shed 1 / Layer Batch 5",
      bags: 4,
      bagWeightKg: 25,
      userId: adminUser.id,
    });
    assert.equal(issue.totalKg, 100, "4 bags of 25kg = 100 kg");
    assert.equal(issue.totalCostAllocated, 5200, "4 bags × 1300 = 5,200");
    assert.equal(issue.remainingFeedStock, 6, "10 - 4 = 6 bags remaining (150 kg)");
  } finally {
    await prisma.internal_feed_issues.deleteMany({ where: { product_id: feed25kg.id } });
    await prisma.stock_movements.deleteMany({ where: { product_id: feed25kg.id } });
    await prisma.feed_products.deleteMany({ where: { product_id: feed25kg.id } });
    await prisma.party_ledger_entries.deleteMany({ where: { supplier_id: testSupplier.id } });
    await prisma.suppliers.delete({ where: { id: testSupplier.id } });
    await prisma.products.delete({ where: { id: feed25kg.id } });
  }
});

test("Feed Trading: Partial-Bag Sales (selling in kg)", async () => {
  const adminUser = await prisma.users.findFirst();
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const bagUnit = await prisma.units.findFirst({ where: { unit_name: "Bag" } });

  const feedProduct = await prisma.products.create({
    data: {
      product_name: "TEST_PARTIAL_BAG_FEED_" + Date.now(),
      quantity: "10", // 10 bags initially
      cost_price: "2500.00",
      sell_price: "55.00", // 55/kg
      status: "active",
      product_code: ["PARTIAL-FEED-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: bagUnit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  await prisma.feed_products.create({
    data: {
      product_id: feedProduct.id,
      feed_type: "Poultry Feed",
      target_type: "POULTRY",
      bag_weight_kg: 50,
      user_id: adminUser.id,
    },
  });

  const testCustomer = await prisma.customers.create({
    data: {
      customer_id: "CUST-PARTIAL-" + Date.now(),
      customer_name: "Small Poultry Farmer",
      mobile: "01900-555666",
      user_id: adminUser.id,
    },
  });

  try {
    // Sell 25 kg (0.5 bag) @ 55/kg
    const saleRes = await recordFeedSale({
      customerId: testCustomer.id,
      productId: feedProduct.id,
      kg: 25,
      sellingPrice: 55,
      isPerBagSale: false,
      paidAmount: 1375,
      userId: adminUser.id,
    });

    assert.equal(saleRes.quantitySold, 25, "Sold 25 kg");
    assert.equal(saleRes.totalSaleAmount, 1375, "25 kg × ৳55 = ৳1,375");
    assert.equal(saleRes.stockBagsDeducted, 0.5, "25 kg / 50 kg per bag = 0.5 bag deducted");
    assert.equal(saleRes.remainingStock, 9.5, "10 - 0.5 = 9.5 bags remaining");
  } finally {
    await prisma.stock_movements.deleteMany({ where: { product_id: feedProduct.id } });
    await prisma.feed_products.deleteMany({ where: { product_id: feedProduct.id } });
    await prisma.party_ledger_entries.deleteMany({ where: { customer_id: testCustomer.id } });
    await prisma.customers.delete({ where: { id: testCustomer.id } });
    await prisma.products.delete({ where: { id: feedProduct.id } });
  }
});

test("Feed Trading: Returns Workflow (Supplier Return & Customer Return)", async () => {
  const adminUser = await prisma.users.findFirst();
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const bagUnit = await prisma.units.findFirst({ where: { unit_name: "Bag" } });

  const feedProduct = await prisma.products.create({
    data: {
      product_name: "TEST_RETURN_FEED_" + Date.now(),
      quantity: "20",
      cost_price: "2400.00",
      sell_price: "2600.00",
      status: "active",
      product_code: ["RET-FEED-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: bagUnit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  const testSupplier = await prisma.suppliers.create({
    data: {
      supplier_id: "SUP-RET-" + Date.now(),
      name: "Return Test Supplier",
      company: "Feed Corp",
      mobile: "01700-555111",
      address: "Dhaka",
      status: "active",
      user_id: adminUser.id,
    },
  });

  const testCustomer = await prisma.customers.create({
    data: {
      customer_id: "CUST-RET-" + Date.now(),
      customer_name: "Return Test Customer",
      mobile: "01800-555222",
      user_id: adminUser.id,
    },
  });

  try {
    // 1. Supplier Return: Return 2 damaged bags to supplier @ 2400
    const pret = await recordFeedPurchaseReturn({
      supplierId: testSupplier.id,
      productId: feedProduct.id,
      bags: 2,
      returnPricePerBag: 2400,
      userId: adminUser.id,
    });
    assert.equal(pret.bagsReturned, 2);
    assert.equal(pret.totalReturnBill, 4800);
    assert.equal(pret.remainingStock, 18, "Stock must decrease from 20 to 18 bags");

    // 2. Customer Return: Customer returns 1 bag @ 2600
    const cret = await recordFeedCustomerReturn({
      customerId: testCustomer.id,
      productId: feedProduct.id,
      bags: 1,
      returnPricePerBag: 2600,
      userId: adminUser.id,
    });
    assert.equal(cret.bagsReturned, 1);
    assert.equal(cret.totalReturnBill, 2600);
    assert.equal(cret.remainingStock, 19, "Stock must increase from 18 to 19 bags");
  } finally {
    await prisma.stock_movements.deleteMany({ where: { product_id: feedProduct.id } });
    await prisma.party_ledger_entries.deleteMany({ where: { supplier_id: testSupplier.id } });
    await prisma.party_ledger_entries.deleteMany({ where: { customer_id: testCustomer.id } });
    await prisma.suppliers.delete({ where: { id: testSupplier.id } });
    await prisma.customers.delete({ where: { id: testCustomer.id } });
    await prisma.products.delete({ where: { id: feedProduct.id } });
  }
});

test("Feed Trading: Purchase Cost Changes & Weighted Average Cost", async () => {
  const adminUser = await prisma.users.findFirst();
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const bagUnit = await prisma.units.findFirst({ where: { unit_name: "Bag" } });

  const feedProduct = await prisma.products.create({
    data: {
      product_name: "TEST_COST_CHANGE_FEED_" + Date.now(),
      quantity: "0",
      cost_price: "2000.00",
      sell_price: "2400.00",
      status: "active",
      product_code: ["COST-FEED-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: bagUnit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  const testSupplier = await prisma.suppliers.create({
    data: {
      supplier_id: "SUP-COST-" + Date.now(),
      name: "Cost Supplier",
      company: "Agro Feeds",
      mobile: "01700-555333",
      address: "Dhaka",
      status: "active",
      user_id: adminUser.id,
    },
  });

  try {
    // 1. Purchase 10 bags @ 2000 = total 20,000 (stock = 10, cost = 2000)
    const p1 = await recordFeedPurchase({
      supplierId: testSupplier.id,
      productId: feedProduct.id,
      bags: 10,
      costPricePerBag: 2000,
      userId: adminUser.id,
    });
    assert.equal(p1.newStock, 10);
    assert.equal(p1.weightedAvgCost, 2000);

    // 2. Purchase 10 bags @ 2600 = total 26,000 (total stock = 20, total cost = 46,000, weighted avg = 2300)
    const p2 = await recordFeedPurchase({
      supplierId: testSupplier.id,
      productId: feedProduct.id,
      bags: 10,
      costPricePerBag: 2600,
      userId: adminUser.id,
    });
    assert.equal(p2.newStock, 20);
    assert.equal(p2.weightedAvgCost, 2300, "Weighted average cost should be (10*2000 + 10*2600)/20 = 2300");

    // Verify product record updated in DB
    const updated = await prisma.products.findUnique({ where: { id: feedProduct.id } });
    assert.equal(parseFloat(updated?.cost_price || "0"), 2300);
  } finally {
    await prisma.stock_movements.deleteMany({ where: { product_id: feedProduct.id } });
    await prisma.feed_products.deleteMany({ where: { product_id: feedProduct.id } });
    await prisma.party_ledger_entries.deleteMany({ where: { supplier_id: testSupplier.id } });
    await prisma.suppliers.delete({ where: { id: testSupplier.id } });
    await prisma.products.delete({ where: { id: feedProduct.id } });
  }
});

test("Feed Trading: Concurrent Transactions", async () => {
  const adminUser = await prisma.users.findFirst();
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const bagUnit = await prisma.units.findFirst({ where: { unit_name: "Bag" } });

  const feedProduct = await prisma.products.create({
    data: {
      product_name: "TEST_CONCURRENT_FEED_" + Date.now(),
      quantity: "5", // Only 5 bags available
      cost_price: "2400.00",
      sell_price: "2700.00",
      status: "active",
      product_code: ["CONC-FEED-" + Date.now()],
      brand_id: brand?.id || 1n,
      category_id: category?.id || 1n,
      unit_id: bagUnit?.id || 1n,
      user_id: adminUser.id,
    },
  });

  const testCustomer = await prisma.customers.create({
    data: {
      customer_id: "CUST-CONC-" + Date.now(),
      customer_name: "Concurrent Customer",
      mobile: "01800-555444",
      user_id: adminUser.id,
    },
  });

  try {
    // Launch two parallel sales of 3 bags each (total 6 bags demanded, but only 5 available!)
    // Exactly one must succeed and one must fail with Insufficient stock!
    const results = await Promise.allSettled([
      recordFeedSale({
        customerId: testCustomer.id,
        productId: feedProduct.id,
        bags: 3,
        sellingPrice: 2700,
        userId: adminUser.id,
      }),
      recordFeedSale({
        customerId: testCustomer.id,
        productId: feedProduct.id,
        bags: 3,
        sellingPrice: 2700,
        userId: adminUser.id,
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 1, "Exactly one sale should succeed");
    assert.equal(rejected.length, 1, "The competing sale must be rejected due to stock locking");

    const finalProduct = await prisma.products.findUnique({ where: { id: feedProduct.id } });
    assert.equal(parseFloat(finalProduct?.quantity || "0"), 2, "Final stock must be exactly 5 - 3 = 2 bags");
  } finally {
    await prisma.stock_movements.deleteMany({ where: { product_id: feedProduct.id } });
    await prisma.party_ledger_entries.deleteMany({ where: { customer_id: testCustomer.id } });
    await prisma.customers.delete({ where: { id: testCustomer.id } });
    await prisma.products.delete({ where: { id: feedProduct.id } });
  }
});

test.after(async () => {
  await prisma.$disconnect();
});
