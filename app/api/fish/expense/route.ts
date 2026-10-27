import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recordBatchExpense } from "@/lib/fish-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const { batch_id, amount, expense_category, payment_method, date, note } = body;

    if (!batch_id || !amount || Number(amount) <= 0 || !expense_category) {
      return NextResponse.json(
        {
          status: "fail",
          message: "ব্যাচ, খরচের খাত এবং সঠিক টাকার পরিমাণ প্রদান করা আবশ্যক",
        },
        { status: 400 }
      );
    }

    const result = await recordBatchExpense({
      batchId: batch_id,
      amount: Number(amount),
      expenseCategory: expense_category,
      paymentMethod: payment_method || "Cash",
      date: date ? new Date(date) : new Date(),
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      data: {
        ...result,
        batchId: Number(result.batchId),
      },
      message: "ব্যাচের অন্যান্য খরচ সফলভাবে যুক্ত হয়েছে",
    });
  } catch (error: any) {
    console.error("Fish Expense POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record batch expense" },
      { status: 500 }
    );
  }
}
