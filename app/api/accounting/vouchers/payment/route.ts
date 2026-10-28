import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { recordPaymentVoucher } from "@/lib/accounting-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const { voucher_type, supplier_id, expense_type_id, business_unit_id, amount, payment_method, reference_no, date, note } = body;

    if (!amount || Number(amount) <= 0 || !payment_method) {
      return NextResponse.json(
        { status: "fail", message: "পরিশোধের টাকার পরিমাণ এবং মাধ্যম প্রদান করা আবশ্যক" },
        { status: 400 }
      );
    }

    const result = await recordPaymentVoucher({
      voucherType: voucher_type || "SUPPLIER_PAYMENT",
      supplierId: supplier_id || null,
      expenseTypeId: expense_type_id || null,
      businessUnitId: business_unit_id || null,
      amount: Number(amount),
      paymentMethod: payment_method,
      referenceNo: reference_no,
      date: date ? new Date(date) : new Date(),
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      data: result,
      message: "পেমেন্ট ভাউচার সফলভাবে সম্পন্ন হয়েছে",
    });
  } catch (error: any) {
    console.error("Payment Voucher POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record payment voucher" },
      { status: 500 }
    );
  }
}
