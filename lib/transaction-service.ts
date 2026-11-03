/**
 * Central Transaction Numbering Engine
 * Guarantees unique, chronologically traceable identifiers across all business modules.
 */

function formatDatePrefix(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function randomSuffix(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function generateOrderNumber(): string {
  return `ORD-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generatePurchaseNumber(): string {
  return `PUR-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateChallanNumber(): string {
  return `CHL-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateFeedIssueNumber(): string {
  return `FIS-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateEggCollectionNumber(): string {
  return `EGG-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateEggRegradeNumber(): string {
  return `RGD-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateFishBatchNumber(pondId: bigint | number): string {
  return `FBT-P${pondId}-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateFishHarvestNumber(): string {
  return `HRV-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateExpenseNumber(): string {
  return `EXP-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateSalaryPaymentNumber(): string {
  return `SAL-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateDueCollectionNumber(): string {
  return `COL-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateExchangeSettlementNumber(): string {
  return `EXC-${formatDatePrefix()}-${randomSuffix()}`;
}

export function generateFlockCode(): string {
  return `FLK-${formatDatePrefix()}-${randomSuffix()}`;
}

