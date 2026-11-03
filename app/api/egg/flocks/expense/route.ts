import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recordFlockExpense } from "@/lib/poultry-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const { flock_id, amount, expense_type, expense_details, date, payment_method } = body;

    if (!flock_id || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { status: "fail", message: "ফ্লক এবং সঠিক খরচের পরিমাণ প্রদান আবশ্যক" },
        { status: 400 }
      );
    }

    const result = await recordFlockExpense({
      flockId: flock_id,
      amount: Number(amount),
      expenseType: expense_type || "Medicine/Vaccine",
      expenseDetails: expense_details,
      date: date ? new Date(date) : new Date(),
      paymentMethod: payment_method || "Cash",
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      data: result,
      message: "ফ্লকের খরচ সফলভাবে যুক্ত ও মোট উৎপাদন ব্যয়ে অন্তর্ভুক্ত হয়েছে",
    });
  } catch (error: any) {
    console.error("Flock Expense POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record flock expense" },
      { status: 500 }
    );
  }
}

