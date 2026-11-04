import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { recordPartyTransaction } from "@/lib/party-ledger-service";

export const dynamic = "force-dynamic";

function generateExchangeRef(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `EXC-${dateStr}-${randomSuffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }
    const userId = Number(authResult.user.id);

    const body = await req.json();
    const {
      partyType = "CUSTOMER", // "CUSTOMER" | "SUPPLIER"
      customerId,
      supplierId,
      // Feed side
      feedUnit = "bags", // "bags" | "kg"
      feedQty = 0,
      feedRate = 0,
      feedTotal = 0,
      // Egg side
      eggEnabled = false,
      eggUnit = "trays", // "trays" | "halis" | "dozens" | "pieces"
      eggQty = 0,
      eggTotalPieces = 0,
      eggRate = 0,
      eggTotal = 0,
      // Cash portion
      cashEnabled = false,
      cashAmount = 0,
      paymentMethod = "Cash",
      // Empty bags portion
      emptyBagsEnabled = false,
      emptyBagsQty = 0,
      emptyBagsRate = 0,
      emptyBagsTotal = 0,
      // Totals
      totalSettlement = 0,
      netRemaining = 0,
      customNote = "",
    } = body;

    if (partyType === "CUSTOMER" && !customerId) {
      return NextResponse.json({ status: "fail", message: "অনুগ্রহ করে কাস্টমার নির্বাচন করুন।" }, { status: 400 });
    }
    if (partyType === "SUPPLIER" && !supplierId) {
      return NextResponse.json({ status: "fail", message: "অনুগ্রহ করে সরবরাহকারী নির্বাচন করুন।" }, { status: 400 });
    }

    const refNo = generateExchangeRef();

    // Construct descriptive bilingual note
    const noteParts: string[] = [];
    if (feedQty > 0) {
      const feedUnitBangla = feedUnit === "bags" ? "বস্তা" : "কেজি";
      noteParts.push(`ফিড: ${feedQty} ${feedUnitBangla} @ ৳${feedRate} = ৳${feedTotal.toLocaleString("bn-BD")}`);
    }

    const exchangeBreakdown: string[] = [];
    if (eggEnabled && eggTotalPieces > 0) {
      exchangeBreakdown.push(`ডিম ${eggTotalPieces} পিস (${eggQty} ${eggUnit}) @ ৳${eggRate}/পিস = ৳${eggTotal.toLocaleString("bn-BD")}`);
    }
    if (cashEnabled && cashAmount > 0) {
      exchangeBreakdown.push(`নগদ/পেমেন্ট (${paymentMethod}): ৳${cashAmount.toLocaleString("bn-BD")}`);
    }
    if (emptyBagsEnabled && emptyBagsQty > 0) {
      exchangeBreakdown.push(`খালি বস্তা: ${emptyBagsQty} টি @ ৳${emptyBagsRate} = ৳${emptyBagsTotal.toLocaleString("bn-BD")}`);
    }

    if (exchangeBreakdown.length > 0) {
      noteParts.push(`বিনিময় সমন্বয়: ${exchangeBreakdown.join(" + ")} (মোট: ৳${totalSettlement.toLocaleString("bn-BD")})`);
    }
    if (customNote) {
      noteParts.push(`নোট: ${customNote}`);
    }

    const fullNote = `[পণ্য বিনিময় ও সমন্বয়] ${noteParts.join(" | ")}`;

    const result = await prisma.$transaction(async (tx) => {
      let ledgerResult;

      if (partyType === "CUSTOMER") {
        // Customer ledger: Feed given to customer increases due (Debit), Egg/Cash/Bags received reduces due (Credit)
        ledgerResult = await recordPartyTransaction(
          {
            partyType: "CUSTOMER",
            customerId: Number(customerId),
            transactionType: "ADJUSTMENT",
            referenceType: "EXCHANGE",
            referenceNo: refNo,
            debit: Number(feedTotal) || 0,
            credit: Number(totalSettlement) || 0,
            note: fullNote,
            userId,
          },
          tx
        );
      } else {
        // Supplier ledger: Feed received from supplier increases payable (Credit), Egg/Cash/Bags provided reduces payable (Debit)
        ledgerResult = await recordPartyTransaction(
          {
            partyType: "SUPPLIER",
            supplierId: Number(supplierId),
            transactionType: "ADJUSTMENT",
            referenceType: "EXCHANGE",
            referenceNo: refNo,
            credit: Number(feedTotal) || 0,
            debit: Number(totalSettlement) || 0,
            note: fullNote,
            userId,
          },
          tx
        );
      }

      return {
        refNo,
        ledgerResult,
      };
    });

    return NextResponse.json({
      status: "success",
      message: "পণ্য বিনিময় ও সমন্বয় সফলভাবে সম্পন্ন ও লেজারে লিপিবদ্ধ হয়েছে!",
      data: {
        referenceNo: result.refNo,
        partyType,
        totalSettlement,
        newBalance: result.ledgerResult.newBalance,
        note: fullNote,
      },
    });
  } catch (error: any) {
    console.error("Exchange API error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "বিনিময় সম্পন্ন করতে ত্রুটি হয়েছে" },
      { status: 500 }
    );
  }
}

