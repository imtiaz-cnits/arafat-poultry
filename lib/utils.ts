import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes cleanly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number or Prisma Decimal into dynamic Bangladeshi Currency format
 * e.g. 24800.5 -> "৳ 24,800.50"
 */
export function formatBdCurrency(amount: any): string {
  if (amount === null || amount === undefined) {
    return '৳ 0.00';
  }

  let strVal = typeof amount === 'object' && 'toString' in amount ? amount.toString() : String(amount);
  strVal = strVal.replace(/৳/g, '').trim();
  const num = Number(strVal);
  if (isNaN(num)) {
    return '৳ 0.00';
  }

  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Bangladeshi comma grouping format (last 3 digits, then groups of 2 digits)
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }

  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `৳ ${formattedInteger}.${decimalPart}`;
}

/**
 * Format Date into Day-Month-Year (e.g. 15-11-2026 - দিন-মাস-বছর)
 */
export function formatBdDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "-";
  try {
    if (typeof dateInput === "string") {
      const trimmed = dateInput.trim();
      // Handle YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const parts = trimmed.split("T")[0].split("-");
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Convert number to Bengali words (কথায় রূপান্তর)
 * e.g. 33000 -> "তেত্রিশ হাজার", 27500 -> "সাতাশ হাজার পাঁচশত"
 */
export function numberToBanglaWords(num: number): string {
  const banglaDigits = [
    "", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
    "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ", "বিশ",
    "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছাব্বিশ", "সাতাশ", "আঠাশ", "ঊনত্রিশ", "ত্রিশ",
    "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাঁইত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ",
    "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চুয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ",
    "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চুয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট", "ষাট",
    "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর",
    "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চুয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আঠাত্তর", "ঊনআশি", "আশি",
    "একাশি", "বিরাশি", "তিরাশি", "চুরাশি", "পঁচাশি", "ছিয়াশি", "সাতাশি", "অষ্টআশি", "ঊননব্বই", "নব্বই",
    "একানব্বই", "বানব্বই", "তিরানব্বই", "চুরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"
  ];

  const inBanglaWords = (n: number): string => {
    let str = "";
    if (n >= 10000000) {
      str += inBanglaWords(Math.floor(n / 10000000)) + " কোটি ";
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inBanglaWords(Math.floor(n / 100000)) + " লাখ ";
      n %= 100000;
    }
    if (n >= 1000) {
      str += inBanglaWords(Math.floor(n / 1000)) + " হাজার ";
      n %= 1000;
    }
    if (n >= 100) {
      str += inBanglaWords(Math.floor(n / 100)) + " শত ";
      n %= 100;
    }
    if (n > 0) {
      str += banglaDigits[n] + " ";
    }
    return str.trim();
  };

  const whole = Math.floor(Math.abs(num));
  if (whole === 0) return "শূন্য";
  return inBanglaWords(whole).trim();
}

/**
 * Deep serializer for BigInt values to ensure clean JSON responses
 */
export function serializeBigInt<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? (Number.isSafeInteger(Number(value)) ? Number(value) : value.toString()) : value
    )
  );
}
