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
      customer_id,
      paid_amount,
      discount_amount,
      payment_method,
      transaction_id,
      order_id,
      note,
    } = body;

    if (!customer_id || !paid_amount) {
      return NextResponse.json(
        { status: "fail", message: "Customer and payment amount are required!" },
        { status: 400 }
      );
    }

    const custId = BigInt(customer_id);
    const paidNum = parseFloat(String(paid_amount || "0"));
    const discNum = parseFloat(String(discount_amount || "0"));
    const totalDeduction = paidNum + discNum;

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customers.findUnique({
        where: { id: custId },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      const prevDue = parseFloat(customer.previous_due_amount || "0");
      const newCustomerDue = Math.max(0, prevDue - totalDeduction);

      // Update customer previous due amount
      await tx.customers.update({
        where: { id: custId },
        data: {
          previous_due_amount: String(newCustomerDue),
        },
      });

      // Create customer_payment_details record
      await tx.customer_payment_details.create({
        data: {
          customer_id: custId,
          paid_amount: String(paidNum),
          discount_amount: String(discNum),
          due_amount: String(newCustomerDue),
          previous_due_amount: String(prevDue),
          payment_method: payment_method || "Cash",
          transaction_id: transaction_id || null,
          payment_status: newCustomerDue <= 0 ? "Paid" : "Partial",
          due_collection_date: body.due_collection_date ? new Date(body.due_collection_date) : new Date(),
          user_id: BigInt(userId),
        },
      });

      // If specific order is attached, adjust order and add payment detail
      if (order_id) {
        const order = await tx.orders.findUnique({
          where: { id: BigInt(order_id) },
        });

        if (order) {
          const currentOrderPaid = Number(order.paid_amount || 0);
          const currentOrderDue = Number(order.due_amount || 0);
          const newOrderPaid = currentOrderPaid + paidNum;
          const newOrderDue = Math.max(0, currentOrderDue - totalDeduction);

          await tx.orders.update({
            where: { id: BigInt(order_id) },
            data: {
              paid_amount: newOrderPaid,
              due_amount: newOrderDue,
            },
          });

          await tx.order_payment_details.create({
            data: {
              order_id: BigInt(order_id),
              paid_amount: paidNum,
              payment_method: payment_method || "Cash",
              transaction_id: transaction_id || null,
              payment_status: newOrderDue <= 0 ? "Paid" : "Due",
              due_collection_date: new Date().toISOString().split("T")[0],
              user_id: BigInt(userId),
            },
          });
        }
      }

      return { newCustomerDue };
    });

    return NextResponse.json({
      status: "success",
      message: "Customer due payment collected successfully!",
      new_due_amount: result.newCustomerDue,
    });
  } catch (error: any) {
    console.error("Customer Due Collection Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to collect due" },
      { status: 500 }
    );
  }
}
