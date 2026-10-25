import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const fallbackUser = await prisma.users.findFirst({ select: { id: true } });
    const userId = user?.id || (fallbackUser ? Number(fallbackUser.id) : 7);

    const body = await req.json();
    const {
      supplier_id,
      paid_amount,
      discount_amount,
      payment_method,
      transaction_id,
      due_collection_date,
    } = body;

    if (!supplier_id || !paid_amount) {
      return NextResponse.json(
        { status: "fail", message: "Supplier and paid amount are required" },
        { status: 400 }
      );
    }

    const suppId = BigInt(supplier_id);
    const paidNum = parseFloat(String(paid_amount || "0"));
    const discNum = parseFloat(String(discount_amount || "0"));
    const colDate = due_collection_date ? new Date(due_collection_date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const supplier = await tx.suppliers.findUnique({
        where: { id: suppId },
      });

      if (!supplier) {
        throw new Error("Supplier not found");
      }

      const currentDue = parseFloat(supplier.purchase_payable_amount || "0");
      const deduction = paidNum + discNum;
      const newDue = Math.max(0, currentDue - deduction);

      // Create due collection record
      const collection = await tx.supplier_due_collections.create({
        data: {
          supplier_id: suppId,
          paid_amount: String(paidNum),
          discount_amount: String(discNum),
          due_amount: String(newDue),
          purchase_payable_amount: String(currentDue),
          payment_method: payment_method || "Cash",
          transaction_id: transaction_id || null,
          payment_status: newDue <= 0 ? "Paid" : "Partial",
          due_collection_date: colDate,
          user_id: BigInt(userId),
        },
      });

      // Update supplier's balance
      await tx.suppliers.update({
        where: { id: suppId },
        data: {
          purchase_payable_amount: String(newDue),
        },
      });

      return { collection, newDue };
    });

    return NextResponse.json({
      status: "success",
      message: "Supplier due payment recorded successfully",
      new_due_amount: result.newDue,
      collection_id: Number(result.collection.id),
    });
  } catch (error: any) {
    console.error("Supplier Due Collection Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to record due payment" },
      { status: 500 }
    );
  }
}
