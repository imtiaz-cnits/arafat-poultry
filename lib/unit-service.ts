import prisma from "@/lib/prisma";

export interface EggConversionResult {
  pieces: number;
  halis: number;
  dozens: number;
  trays: number;
}

/**
 * Unit Conversion & Agricultural Conversion Engine
 */
export async function convertUnit(
  fromUnitId: bigint | number,
  toUnitId: bigint | number,
  quantity: number
): Promise<number | null> {
  const fromId = BigInt(fromUnitId);
  const toId = BigInt(toUnitId);

  if (fromId === toId) return quantity;

  // 1. Direct conversion
  const direct = await prisma.unit_conversions.findFirst({
    where: { from_unit_id: fromId, to_unit_id: toId },
  });

  if (direct) {
    const rate = Number(direct.conversion_rate);
    return direct.operator === "MULTIPLY" ? quantity * rate : quantity / rate;
  }

  // 2. Inverse conversion
  const inverse = await prisma.unit_conversions.findFirst({
    where: { from_unit_id: toId, to_unit_id: fromId },
  });

  if (inverse) {
    const rate = Number(inverse.conversion_rate);
    return inverse.operator === "MULTIPLY" ? quantity / rate : quantity * rate;
  }

  return null;
}

/**
 * Convert Egg quantities between Pieces, Halis, Dozens, and Trays
 * Rule 8.2: 1 Hali = 4 Pieces, 1 Dozen = 12 Pieces, 1 Tray = 30 Pieces (configurable)
 * Base authoritative inventory unit is Piece.
 */
export function convertEggUnits(
  quantity: number,
  fromUnit: "piece" | "hali" | "dozen" | "tray",
  trayCapacity: number = 30
): EggConversionResult {
  const cap = trayCapacity > 0 ? trayCapacity : 30;
  const q = Math.max(0, quantity);
  let totalPieces = 0;

  if (fromUnit === "piece") {
    totalPieces = q;
  } else if (fromUnit === "hali") {
    totalPieces = q * 4;
  } else if (fromUnit === "dozen") {
    totalPieces = q * 12;
  } else if (fromUnit === "tray") {
    totalPieces = q * cap;
  }

  return {
    pieces: totalPieces,
    halis: parseFloat((totalPieces / 4).toFixed(2)),
    dozens: parseFloat((totalPieces / 12).toFixed(2)),
    trays: parseFloat((totalPieces / cap).toFixed(2)),
  };
}

/**
 * Convert Feed quantities: Bags to Kilograms
 */
export function convertFeedBagsToKg(bags: number, bagWeightKg: number): number {
  return Math.max(0, bags) * Math.max(0, bagWeightKg);
}

/**
 * Convert Feed quantities: Kilograms to Bags
 */
export function convertFeedKgToBags(totalKg: number, bagWeightKg: number): {
  fullBags: number;
  remainingKg: number;
  fractionalBags: number;
} {
  if (bagWeightKg <= 0) return { fullBags: 0, remainingKg: 0, fractionalBags: 0 };
  const fullBags = Math.floor(totalKg / bagWeightKg);
  const remainingKg = parseFloat((totalKg % bagWeightKg).toFixed(3));
  const fractionalBags = parseFloat((totalKg / bagWeightKg).toFixed(2));
  return { fullBags, remainingKg, fractionalBags };
}

/**
 * Fish & Product Weight Conversions (1 kg = 1000 grams)
 */
export function convertWeightKgToGram(kg: number): number {
  return Math.max(0, kg) * 1000;
}

export function convertWeightGramToKg(gram: number): number {
  return Math.max(0, gram) / 1000;
}

/**
 * Automatic Age Calculation: 30 days = 1 month (Rules 9.2 & 10.3)
 * Example: 30 days -> 1 মাস, 31 days -> 1 মাস 1 দিন, 65 days -> 2 মাস 5 দিন
 */
export function calculateAgeInMonthsAndDays(
  startDate: Date | string,
  referenceDate: Date = new Date()
): {
  totalDays: number;
  months: number;
  days: number;
  text: string;
  display: string;
} {
  const start = new Date(startDate);
  const ref = new Date(referenceDate);
  const diffTime = Math.max(0, ref.getTime() - start.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  let text = "";
  if (months > 0 && days > 0) {
    text = `${months} মাস ${days} দিন`;
  } else if (months > 0) {
    text = `${months} মাস`;
  } else {
    text = `${days} দিন`;
  }

  return {
    totalDays,
    months,
    days,
    text,
    display: text,
  };
}

/**
 * Layer Chicken Feed Requirement (Rule 9.4: Default 120 grams per adult layer bird per day)
 */
export function calculateDailyFeedRequirementKg(
  liveBirds: number,
  gramsPerBirdPerDay: number = 120
): {
  dailyKg: number;
  monthlyKg: number;
} {
  const birds = Math.max(0, liveBirds);
  const rateGrams = Math.max(0, gramsPerBirdPerDay);
  const dailyKg = (birds * rateGrams) / 1000;
  const monthlyKg = dailyKg * 30;
  return {
    dailyKg: parseFloat(dailyKg.toFixed(3)),
    monthlyKg: parseFloat(monthlyKg.toFixed(3)),
  };
}
