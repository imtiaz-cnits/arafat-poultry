import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { convertEggUnits, convertFeedBagsToKg, convertFeedKgToBags } from "../lib/unit-service.ts";
import { recordStockMovement } from "../lib/stock-service.ts";
import { recordPartyTransaction } from "../lib/party-ledger-service.ts";
import { recordFinancialTransaction } from "../lib/financial-service.ts";
import { requireAuth } from "../lib/auth.ts";

const prisma = new PrismaClient();

test("Unit Conversions Engine: Egg conversions", () => {
  // Test 1: Standard Tray (30 pcs)
  const trayConversion = convertEggUnits(2, "tray", 30);
  assert.equal(trayConversion.pieces, 60, "2 trays should equal 60 pieces");
  assert.equal(trayConversion.dozens, 5, "60 pieces should equal 5 dozens");

  // Test 2: Custom Tray (24 pcs)
  const customTray = convertEggUnits(3, "tray", 24);
  assert.equal(customTray.pieces, 72, "3 custom trays of 24 should equal 72 pieces");
  assert.equal(customTray.dozens, 6, "72 pieces should equal 6 dozens");

  // Test 3: Dozen conversion
  const dozenConversion = convertEggUnits(10, "dozen", 30);
  assert.equal(dozenConversion.pieces, 120, "10 dozens should equal 120 pieces");
  assert.equal(dozenConversion.trays, 4, "120 pieces should equal 4 trays of 30");

  // Test 4: Piece conversion
  const pieceConversion = convertEggUnits(850, "piece", 30);
  assert.equal(pieceConversion.pieces, 850);
  assert.equal(pieceConversion.trays, 28.33);
});

test("Unit Conversions Engine: Feed conversions", () => {
  // Test 20 bags x 50kg = 1000kg
  const kgTotal = convertFeedBagsToKg(20, 50);
  assert.equal(kgTotal, 1000, "20 bags of 50kg should equal 1000kg");

  // Test 750kg back to 50kg bags
  const bagResult = convertFeedKgToBags(750, 50);
  assert.equal(bagResult.fullBags, 15, "750kg should yield 15 full 50kg bags");
  assert.equal(bagResult.remainingKg, 0);

  // Test fractional bags: 125kg of 50kg bags
  const fractional = convertFeedKgToBags(125, 50);
  assert.equal(fractional.fullBags, 2, "125kg has 2 full bags");
  assert.equal(fractional.remainingKg, 25, "125kg has 25kg remainder");
  assert.equal(fractional.fractionalBags, 2.5);
});

test("Database Integrity: Business Units seeded", async () => {
  const units = await prisma.business_units.findMany();
  assert.ok(units.length >= 4, "Expected at least 4 business units (EGG, FISH, FEED, GENERAL)");
  const codes = units.map((u) => u.code);
  assert.ok(codes.includes("EGG"), "EGG business unit should exist");
  assert.ok(codes.includes("FISH"), "FISH business unit should exist");
  assert.ok(codes.includes("FEED"), "FEED business unit should exist");
  assert.ok(codes.includes("GENERAL"), "GENERAL business unit should exist");
});

test("Database Integrity: Financial Accounts seeded", async () => {
  const accounts = await prisma.financial_accounts.findMany();
  assert.ok(accounts.length >= 4, "Expected at least 4 financial accounts");
  const types = accounts.map((a) => a.account_type);
  assert.ok(types.includes("CASH"), "Cash account should exist");
  assert.ok(types.includes("MFS"), "MFS account should exist");
  assert.ok(types.includes("BANK"), "Bank account should exist");
});

test("Database Integrity: Agricultural Units and conversions seeded", async () => {
  const units = await prisma.units.findMany();
  const unitNames = units.map((u) => u.unit_name);
  assert.ok(unitNames.includes("Kg"), "Kg unit should exist");
  assert.ok(unitNames.includes("Bag"), "Bag unit should exist");
  assert.ok(unitNames.includes("Tray"), "Tray unit should exist");
  assert.ok(unitNames.includes("Dozen"), "Dozen unit should exist");

  const conversions = await prisma.unit_conversions.findMany();
  assert.ok(conversions.length >= 3, "Expected standard conversions (Dozen, Tray, Kg)");
});

test("Security Engine: requireAuth rejects unauthenticated requests", async () => {
  const result = await requireAuth();
  assert.equal(result.user, null, "User should be null when unauthenticated");
  assert.ok(result.errorResponse, "errorResponse must be returned");
  assert.equal(result.errorResponse.status, 401, "Status code must be 401 Unauthorized");
});

test("Stock Engine: Atomic movement and negative stock prevention", async () => {
  // Find or create test product
  let product = await prisma.products.findFirst({
    where: { product_name: "TEST_POULTRY_FEED_50KG" },
  });

  const adminUser = await prisma.users.findFirst();
  const category = await prisma.categories.findFirst();
  const brand = await prisma.brands.findFirst();
  const unit = await prisma.units.findFirst({ where: { unit_name: "Bag" } });

  if (!product && adminUser && category && brand) {
    product = await prisma.products.create({
      data: {
        product_name: "TEST_POULTRY_FEED_50KG",
        quantity: "10",
        cost_price: "2400",
        sell_price: "2600",
        status: "active",
        product_code: ["TEST-FEED-01"],
        brand_id: brand.id,
        category_id: category.id,
        unit_id: unit?.id || 1,
        user_id: adminUser.id,
      },
    });
  }

  if (product && adminUser) {
    const initialQty = parseFloat(product.quantity || "0");

    // 1. Inward 5 bags
    const inwardRes = await recordStockMovement({
      productId: product.id,
      movementType: "PURCHASE_INWARD",
      quantity: 5,
      unitPrice: 2400,
      referenceType: "PURCHASE",
      referenceNo: "TEST-IN-01",
      userId: adminUser.id,
    });
    assert.equal(inwardRes.newStock, initialQty + 5, "Stock must increase by 5");

    // 2. Outward 2 bags
    const outwardRes = await recordStockMovement({
      productId: product.id,
      movementType: "SALE_OUTWARD",
      quantity: 2,
      unitPrice: 2600,
      referenceType: "ORDER",
      referenceNo: "TEST-OUT-01",
      userId: adminUser.id,
    });
    assert.equal(outwardRes.newStock, initialQty + 5 - 2, "Stock must decrease by 2");

    // 3. Attempt to outward 99999 bags (must throw Insufficient Stock error)
    await assert.rejects(
      async () => {
        await recordStockMovement({
          productId: product.id,
          movementType: "SALE_OUTWARD",
          quantity: 99999,
          referenceType: "ORDER",
          userId: adminUser.id,
          allowNegativeStock: false,
        });
      },
      /Insufficient stock/,
      "Must throw Insufficient stock error when quantity exceeds available stock"
    );

    // Clean up test product
    await prisma.stock_movements.deleteMany({ where: { product_id: product.id } });
    await prisma.products.delete({ where: { id: product.id } });
  }
});

test("Party Ledger Engine: Customer ledger debit, credit & balance calculation", async () => {
  const adminUser = await prisma.users.findFirst();
  if (!adminUser) return;

  // Create isolated test customer
  const testCustomer = await prisma.customers.create({
    data: {
      customer_id: "TEST-CUST-" + Date.now(),
      customer_name: "Test Poultry Dealer",
      mobile: "01700-000000",
      previous_due_amount: "500.00",
      user_id: adminUser.id,
    },
  });

  // 1. Sale invoice of 2000 with 1200 paid (800 due)
  const tx1 = await recordPartyTransaction({
    partyType: "CUSTOMER",
    customerId: testCustomer.id,
    transactionType: "INVOICE",
    referenceType: "ORDER",
    referenceNo: "TEST-ORD-01",
    debit: 2000,
    credit: 1200,
    userId: adminUser.id,
  });
  // Balance should be: 500 (prev) + 2000 (debit) - 1200 (credit) = 1300
  assert.equal(tx1.newBalance, 1300, "New customer balance should be 1300");

  // 2. Customer payment of 1000
  const tx2 = await recordPartyTransaction({
    partyType: "CUSTOMER",
    customerId: testCustomer.id,
    transactionType: "PAYMENT",
    referenceType: "DUE_COLLECTION",
    referenceNo: "TEST-PAY-01",
    debit: 0,
    credit: 1000,
    userId: adminUser.id,
  });
  // Balance should be: 1300 - 1000 = 300
  assert.equal(tx2.newBalance, 300, "Customer balance should be reduced to 300");

  // Clean up
  await prisma.party_ledger_entries.deleteMany({ where: { customer_id: testCustomer.id } });
  await prisma.customers.delete({ where: { id: testCustomer.id } });
});

test("Financial Accounts Engine: Inflow, outflow and overdraft protection", async () => {
  const adminUser = await prisma.users.findFirst();
  if (!adminUser) return;

  const testAccount = await prisma.financial_accounts.create({
    data: {
      account_name: "TEST_CASH_ACCOUNT_" + Date.now(),
      account_type: "CASH",
      balance: 1000,
      user_id: adminUser.id,
    },
  });

  // 1. Inflow 500 -> Balance becomes 1500
  const inRes = await recordFinancialTransaction({
    accountId: testAccount.id,
    transactionType: "INFLOW",
    amount: 500,
    referenceType: "SALE_PAYMENT",
    userId: adminUser.id,
  });
  assert.equal(inRes.newBalance, 1500, "Account balance should be 1500 after 500 inflow");

  // 2. Outflow 600 -> Balance becomes 900
  const outRes = await recordFinancialTransaction({
    accountId: testAccount.id,
    transactionType: "OUTFLOW",
    amount: 600,
    referenceType: "PURCHASE_PAYMENT",
    userId: adminUser.id,
  });
  assert.equal(outRes.newBalance, 900, "Account balance should be 900 after 600 outflow");

  // 3. Outflow 5000 without overdraft -> must reject
  await assert.rejects(
    async () => {
      await recordFinancialTransaction({
        accountId: testAccount.id,
        transactionType: "OUTFLOW",
        amount: 5000,
        referenceType: "EXPENSE",
        userId: adminUser.id,
        allowOverdraft: false,
      });
    },
    /Insufficient funds/,
    "Must throw Insufficient funds error when account balance is insufficient"
  );

  // Clean up
  await prisma.financial_transactions.deleteMany({ where: { account_id: testAccount.id } });
  await prisma.financial_accounts.delete({ where: { id: testAccount.id } });
});

test.after(async () => {
  await prisma.$disconnect();
});
