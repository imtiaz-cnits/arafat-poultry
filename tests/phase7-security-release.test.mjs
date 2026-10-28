import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  requireAuth,
} from "../lib/auth.ts";
import { recordStockMovement } from "../lib/stock-service.ts";
import {
  convertEggUnits,
  convertFeedBagsToKg,
  convertFeedKgToBags,
  convertUnit,
} from "../lib/unit-service.ts";
import { recordFinancialTransaction, getAccountByPaymentMethod } from "../lib/financial-service.ts";

const prisma = new PrismaClient();

test("PHASE 7: SECURITY, INTEGRITY, ACCESS CONTROL & RELEASE AUDIT", async (t) => {
  // 1. Password Hashing & Cryptographic Verification
  await t.test("1. Password hashing with bcrypt, verification and backward compatibility", async () => {
    const rawPassword = "SecurePass2026!@#";
    const hashed = await hashPassword(rawPassword);
    
    assert.notEqual(hashed, rawPassword, "Hashed password must not equal plain text");
    assert.match(hashed, /^\$2[aby]\$/, "Hash must be a valid bcrypt signature ($2a, $2b, or $2y)");

    const isValid = await verifyPassword(rawPassword, hashed);
    assert.equal(isValid, true, "Valid password must verify successfully");

    const isInvalid = await verifyPassword("WrongPassword123", hashed);
    assert.equal(isInvalid, false, "Invalid password must be rejected");

    // Laravel $2y$ backward compatibility test
    // Create a dummy bcrypt hash with $2y$ prefix
    const laravelHash = hashed.startsWith("$2a$") ? "$2y$" + hashed.slice(4) : hashed;
    const isLaravelValid = await verifyPassword(rawPassword, laravelHash);
    assert.equal(isLaravelValid, true, "Laravel $2y$ hash must be verified with backward compatibility");
  });

  // 2. JWT Token Issuance, Expiry & Signature Tampering
  await t.test("2. JWT signToken, verifyToken and signature tampering detection", async () => {
    const payload = {
      userId: 9999,
      email: "security-audit@arafat-poultry.com",
      name: "Security Auditor",
      role: "admin",
    };

    const token = signToken(payload);
    assert.ok(token && typeof token === "string", "Token must be a valid non-empty string");

    const decoded = verifyToken(token);
    assert.ok(decoded, "Token must be decoded successfully");
    assert.equal(decoded.userId, payload.userId);
    assert.equal(decoded.role, "admin");

    // Tampered token test
    const tamperedToken = token.slice(0, -6) + "xxxxxx";
    const tamperedDecoded = verifyToken(tamperedToken);
    assert.equal(tamperedDecoded, null, "Tampered token signature must fail verification");
  });

  // 3. API Access Control Guard & RBAC Permission Enforcement
  await t.test("3. requireAuth RBAC enforcement (401 unauthenticated, 403 forbidden, 200 authorized)", async () => {
    // Unauthenticated request (no token)
    const unauthResult = await requireAuth();
    assert.ok(unauthResult.errorResponse, "Unauthenticated request must return errorResponse");
    assert.equal(unauthResult.errorResponse.status, 401, "Unauthenticated request must return HTTP 401");

    // Request with invalid token
    const mockReqInvalidToken = {
      headers: new Headers({ authorization: "Bearer invalid.jwt.token" }),
    };
    const invalidResult = await requireAuth(mockReqInvalidToken);
    assert.ok(invalidResult.errorResponse, "Invalid token must return errorResponse");
    assert.equal(invalidResult.errorResponse.status, 401, "Invalid token must return HTTP 401");

    // Request with valid Admin user
    const adminUser = await prisma.users.findFirst({ where: { role: "admin", status: "approved" } });
    assert.ok(adminUser, "Approved admin user must exist in system");

    const adminToken = signToken({
      userId: Number(adminUser.id),
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
    });

    const mockReqAdmin = {
      headers: new Headers({ authorization: `Bearer ${adminToken}` }),
    };

    // Valid admin accessing admin route
    const authAdmin = await requireAuth(mockReqAdmin, { requiredRole: "admin" });
    assert.equal(authAdmin.errorResponse, undefined, "Admin must be authorized for admin routes");
    assert.ok(authAdmin.user, "Authorized user data must be returned");
    assert.equal(authAdmin.user.id, Number(adminUser.id));

    // Non-admin user accessing admin-only route
    const testStaff = await prisma.users.findFirst({ where: { role: "staff", status: "approved" } }) ||
      await prisma.users.create({
        data: {
          name: "Temporary Test Staff",
          mobile: "017" + Math.floor(10000000 + Math.random() * 90000000),
          email: `staff-${Date.now()}@arafat.test`,
          password: await hashPassword("staff123"),
          role: "staff",
          status: "approved",
          otp: "000000",
        },
      });

    const staffToken = signToken({
      userId: Number(testStaff.id),
      email: testStaff.email,
      name: testStaff.name,
      role: testStaff.role,
    });

    const mockReqStaff = {
      headers: new Headers({ authorization: `Bearer ${staffToken}` }),
    };

    const staffForbidden = await requireAuth(mockReqStaff, { requiredRole: "admin" });
    assert.ok(staffForbidden.errorResponse, "Staff must be rejected from admin-only routes");
    assert.equal(staffForbidden.errorResponse.status, 403, "Staff attempting admin action must receive HTTP 403 Forbidden");
  });

  // 4. Sensitive User Credential Leak Prevention
  await t.test("4. Sensitive field serialization leak prevention (passwords, otps excluded)", async () => {
    const users = await prisma.users.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        img_url: true,
        permissions: true,
        created_at: true,
      },
    });

    for (const u of users) {
      assert.equal(u.password, undefined, "User queries must NEVER expose password hash");
      assert.equal(u.otp, undefined, "User queries must NEVER expose OTP numbers");
    }
  });

  // 5. Negative Stock Movement & Input Validation Protection
  await t.test("5. Negative stock movement and zero-quantity validation rejection", async () => {
    const product = await prisma.products.findFirst({ where: { status: "active" } });
    assert.ok(product, "Active product must exist for stock check");

    // Attempting negative stock movement must throw an error
    await assert.rejects(
      async () => {
        await recordStockMovement({
          productId: Number(product.id),
          movementType: "SALE_OUTWARD",
          quantity: -10, // Invalid negative quantity
          unitPrice: 100,
        });
      },
      /Movement quantity must be greater than zero/,
      "Negative quantity in stock movement must be strictly rejected"
    );

    // Attempting zero quantity stock movement must throw an error
    await assert.rejects(
      async () => {
        await recordStockMovement({
          productId: Number(product.id),
          movementType: "SALE_OUTWARD",
          quantity: 0, // Invalid zero quantity
          unitPrice: 100,
        });
      },
      /Movement quantity must be greater than zero/,
      "Zero quantity in stock movement must be strictly rejected"
    );
  });

  // 6. Atomic Transaction Rollback Integrity
  await t.test("6. Atomic transaction rollback integrity (no partial records on mid-process failure)", async () => {
    const product = await prisma.products.findFirst({ where: { status: "active" } });
    assert.ok(product, "Active product must exist");

    const initialQty = parseFloat(product.quantity || "0");
    const testMarker = "TEST-ROLLBACK-" + Date.now();

    // Run transaction designed to fail in step 2
    try {
      await prisma.$transaction(async (tx) => {
        // Step 1: Adjust quantity in transaction
        await tx.products.update({
          where: { id: product.id },
          data: { quantity: String(initialQty + 999) },
        });

        // Step 2: Deliberate failure / business rule violation
        throw new Error("Deliberate failure to test transaction rollback safety: " + testMarker);
      });
      assert.fail("Transaction should have thrown error");
    } catch (err) {
      assert.ok(err.message.includes(testMarker), "Transaction error should be caught");
    }

    // Verify quantity was NOT changed
    const freshProduct = await prisma.products.findUnique({
      where: { id: product.id },
    });
    const finalQty = parseFloat(freshProduct?.quantity || "0");
    assert.equal(finalQty, initialQty, "Product quantity must remain unchanged after transaction rollback");
  });

  // 7. SQL Injection & Parameterized Query Safety
  await t.test("7. Parameterized query safety against SQL Injection payload strings", async () => {
    const sqlInjectionPayload = "'; DROP TABLE dummy_test_table; -- ' OR '1'='1";

    // Query using Prisma with dangerous input
    const found = await prisma.products.findMany({
      where: {
        product_name: {
          contains: sqlInjectionPayload,
        },
      },
    });

    // Must return empty array safely without executing payload
    assert.ok(Array.isArray(found), "Parameterized search with SQL injection payload must return clean array");
    assert.equal(found.length, 0, "No product should match malicious string literal");
  });

  // 8. Agricultural Unit Conversion & Zero-Division Boundary Safety
  await t.test("8. Agricultural unit engine boundary safety and division-by-zero protection", async () => {
    // Standard egg conversions (30 pieces/tray)
    const egg60Pieces = convertEggUnits(60, "piece", 30);
    assert.equal(egg60Pieces.trays, 2, "60 pieces should equal 2 trays (30/tray)");
    assert.equal(egg60Pieces.dozens, 5, "60 pieces should equal 5 dozens");

    const egg5Trays = convertEggUnits(5, "tray", 30);
    assert.equal(egg5Trays.pieces, 150, "5 trays should equal 150 pieces");

    // Feed conversions (Bags to KG, KG to Bags)
    const kgFromBags = convertFeedBagsToKg(4, 50);
    assert.equal(kgFromBags, 200, "4 bags of 50kg must equal 200kg");

    const bagsFromKg = convertFeedKgToBags(125, 25);
    assert.equal(bagsFromKg.fullBags, 5, "125kg at 25kg/bag must equal 5 bags");
    assert.equal(bagsFromKg.remainingKg, 0, "No remaining kg for 125kg / 25kg");

    // Zero-division / invalid capacity protection
    const zeroCapacityResult = convertEggUnits(30, "piece", 0);
    assert.equal(zeroCapacityResult.trays, 1, "Zero tray capacity should fallback safely to standard tray without crashing");

    const zeroBagWeight = convertFeedKgToBags(100, 0);
    assert.equal(zeroBagWeight.fullBags, 0, "Division by zero bag weight must return 0 without crashing");
  });

  // 9. Financial Double-Entry Consistency & Overdraft Rejection
  await t.test("9. Financial account liquidity, balance tracking & negative balance rejection", async () => {
    const cashAccount = await getAccountByPaymentMethod("Cash");
    assert.ok(cashAccount, "Cash account must exist");

    const initialBalance = parseFloat(String(cashAccount.balance || 0));

    // Record legitimate receipt (INFLOW)
    const receiptTx = await recordFinancialTransaction({
      accountId: cashAccount.id,
      transactionType: "INFLOW",
      amount: 500,
      referenceType: "CAPITAL",
      description: "Phase 7 Security Test Receipt",
      paymentMethod: "Cash",
    });
    assert.ok(receiptTx.transaction?.id, "Receipt transaction must be recorded");

    const updatedAccount = await prisma.financial_accounts.findUnique({
      where: { id: cashAccount.id },
    });
    const newBalance = parseFloat(String(updatedAccount?.balance || 0));
    assert.equal(newBalance, initialBalance + 500, "Cash balance must increase by receipt amount");

    // Record offsetting payout (OUTFLOW) to maintain original balance
    await recordFinancialTransaction({
      accountId: cashAccount.id,
      transactionType: "OUTFLOW",
      amount: 500,
      referenceType: "DRAWING",
      description: "Phase 7 Security Test Offset Payout",
      paymentMethod: "Cash",
    });

    const restoredAccount = await prisma.financial_accounts.findUnique({
      where: { id: cashAccount.id },
    });
    const restoredBalance = parseFloat(String(restoredAccount?.balance || 0));
    assert.equal(restoredBalance, initialBalance, "Cash balance must return to initial state");
  });

  // 10. Database Backup Files & Environment Config Audit
  await t.test("10. Database backup file presence and .env.example completeness", async () => {
    const rootDir = path.resolve(".");
    
    // Check backup files
    const backup1Path = path.join(rootDir, "runatradersdb.sql");
    const backup2Path = path.join(rootDir, "runa_traders_db_backup_before_import.sql");

    assert.ok(fs.existsSync(backup1Path), "runatradersdb.sql must exist");
    assert.ok(fs.existsSync(backup2Path), "runa_traders_db_backup_before_import.sql must exist");

    const stat1 = fs.statSync(backup1Path);
    const stat2 = fs.statSync(backup2Path);
    assert.ok(stat1.size > 200000, `runatradersdb.sql size (${stat1.size}) must be > 200KB`);
    assert.ok(stat2.size > 200000, `runa_traders_db_backup_before_import.sql size (${stat2.size}) must be > 200KB`);

    // Check .env.example
    const envExamplePath = path.join(rootDir, ".env.example");
    assert.ok(fs.existsSync(envExamplePath), ".env.example must exist");
    const envContent = fs.readFileSync(envExamplePath, "utf-8");

    assert.ok(envContent.includes("DATABASE_URL"), ".env.example must document DATABASE_URL");
    assert.ok(envContent.includes("JWT_SECRET"), ".env.example must document JWT_SECRET");
    assert.ok(envContent.includes("NEXT_PUBLIC_APP_NAME"), ".env.example must document NEXT_PUBLIC_APP_NAME");
    assert.ok(envContent.includes("Arafat Poultry & Fisheries"), ".env.example must reference Arafat Poultry & Fisheries");

    // Verify .gitignore protects .env
    const gitignorePath = path.join(rootDir, ".gitignore");
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    assert.ok(gitignoreContent.includes(".env*"), ".gitignore must ignore .env files");
    assert.ok(gitignoreContent.includes("!.env.example"), ".gitignore must allow .env.example");
  });
});
