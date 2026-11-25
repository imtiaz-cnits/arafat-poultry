import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { recordActivity } from "@/lib/audit-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseId = BigInt(id);

    const purchase = await prisma.purchases.findUnique({
      where: { id: purchaseId },
      include: {
        suppliers: true,
        purchase_order_details: {
          include: {
            products: {
              include: {
                units: true,
              },
            },
          },
        },
        purchase_payment_details: true,
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json({ status: "fail", message: "Purchase not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: "success",
      data: {
        id: Number(purchase.id),
        purchase_id: purchase.purchase_id,
        referance_no: purchase.referance_no,
        date: purchase.date ? purchase.date.toISOString().split("T")[0] : null,
        grand_subtotal: parseFloat(purchase.grand_subtotal || "0"),
        delivery_charge: parseFloat(String(purchase.delivery_charge || 0)),
        paid_amount: parseFloat(purchase.paid_amount || "0"),
        due_amount: parseFloat(purchase.due_amount || "0"),
        purchase_payable_amount: parseFloat(purchase.purchase_payable_amount || "0"),
        creator: purchase.users?.name || "Admin",
        supplier: purchase.suppliers
          ? {
              id: Number(purchase.suppliers.id),
              supplier_id: purchase.suppliers.supplier_id,
              name: purchase.suppliers.name,
              company: purchase.suppliers.company,
              mobile: purchase.suppliers.mobile,
              address: purchase.suppliers.address,
              payable_amount: parseFloat(purchase.suppliers.purchase_payable_amount || "0"),
            }
          : null,
        details: purchase.purchase_order_details.map((d) => ({
          id: Number(d.id),
          product_id: Number(d.product_id),
          product_name: d.products?.product_name || "N/A",
          quantity: parseFloat(d.quantity || "0"),
          cost_price: parseFloat(d.cost_price || "0"),
          subtotal: parseFloat(d.subtotal || "0"),
          unit: d.products?.units?.unit_name || "Pcs",
        })),
        payments: purchase.purchase_payment_details.map((pm) => ({
          id: Number(pm.id),
          paid_amount: Number(pm.paid_amount || 0),
          payment_method: pm.payment_method || "Cash",
          payment_status: pm.payment_status || "Paid",
          transaction_id: pm.transaction_id,
          date: pm.purchase_due_collection_date
            ? pm.purchase_due_collection_date.toISOString().split("T")[0]
            : null,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: "fail", message: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseId = BigInt(id);

    const purchase = await prisma.purchases.findUnique({
      where: { id: purchaseId },
      include: {
        purchase_order_details: true,
      },
    });

    if (!purchase) {
      return NextResponse.json({ status: "fail", message: "Purchase record not found" }, { status: 404 });
    }

    // Execute atomic deletion with stock and balance reversal
    await prisma.$transaction(async (tx) => {
      // 1. Revert product stocks
      for (const d of purchase.purchase_order_details) {
        const qtyNum = parseFloat(d.quantity || "0");
        const prod = await tx.products.findUnique({
          where: { id: d.product_id },
          select: { quantity: true },
        });
        if (prod) {
          const currentStock = parseFloat(prod.quantity || "0");
          const revertedStock = Math.max(0, currentStock - qtyNum);
          await tx.products.update({
            where: { id: d.product_id },
            data: { quantity: String(revertedStock) },
          });
        }
      }

      // 2. Adjust supplier payable due amount
      const dueNum = parseFloat(purchase.due_amount || "0");
      if (purchase.supplier_id && dueNum > 0) {
        const supp = await tx.suppliers.findUnique({
          where: { id: purchase.supplier_id },
          select: { purchase_payable_amount: true },
        });
        if (supp) {
          const currentPayable = parseFloat(supp.purchase_payable_amount || "0");
          const revertedPayable = Math.max(0, currentPayable - dueNum);
          await tx.suppliers.update({
            where: { id: purchase.supplier_id },
            data: { purchase_payable_amount: String(revertedPayable) },
          });
        }
      }

      // 3. Delete returns, payments, items, and purchase
      await tx.purchase_returns.deleteMany({
        where: { purchase_id: purchaseId },
      });

      await tx.purchase_payment_details.deleteMany({
        where: { purchases_id: purchaseId },
      });

      await tx.purchase_order_details.deleteMany({
        where: { purchase_id: purchaseId },
      });

      await tx.purchases.delete({
        where: { id: purchaseId },
      });
    });

    try {
      const authUser = await getAuthUser(req);
      await recordActivity({
        req,
        userId: authUser?.id,
        action: "DELETE",
        module: "Purchases",
        entityId: String(purchaseId),
        description: `Deleted purchase inward "${purchase.purchase_id}" (Reverted inventory & supplier due: ৳ ${purchase.due_amount || 0})`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "Purchase record deleted and inventory/balances reverted successfully.",
    });
  } catch (error: any) {
    console.error("Purchase DELETE Error:", error);
    return NextResponse.json({ status: "fail", message: error?.message || "Failed to delete purchase" }, { status: 500 });
  }
}

// PUT: Update Purchase Inward (Atomic Recalculation of Stock & Supplier Balances)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchaseId = BigInt(id);

    const body = await req.json();
    const {
      supplier_id,
      referance_no,
      date,
      grand_subtotal,
      delivery_charge,
      paid_amount,
      due_amount,
      payment_method,
      transaction_id,
      items, // Array of { product_id, quantity, cost_price, subtotal }
    } = body;

    if (!supplier_id) {
      return NextResponse.json(
        { status: "fail", message: "সরবরাহকারী নির্বাচন আবশ্যক!" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { status: "fail", message: "ক্রয়ের তালিকায় অন্তত একটি পণ্য থাকা আবশ্যক!" },
        { status: 400 }
      );
    }

    const newSuppId = BigInt(supplier_id);
    const purDate = date ? new Date(date) : new Date();
    const grandSub = parseFloat(String(grand_subtotal || "0"));
    const delivChg = parseFloat(String(delivery_charge || "0"));
    const paidNum = parseFloat(String(paid_amount || "0"));
    const dueNum = parseFloat(String(due_amount || "0"));

    const existingPurchase = await prisma.purchases.findUnique({
      where: { id: purchaseId },
      include: {
        purchase_order_details: true,
        purchase_payment_details: true,
      },
    });

    if (!existingPurchase) {
      return NextResponse.json(
        { status: "fail", message: "ক্রয় মেমোটি পাওয়া যায়নি!" },
        { status: 404 }
      );
    }

    // Execute atomic update with stock adjustments and supplier ledger reconciliations
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Revert previous stock additions from existing purchase
      for (const oldDetail of existingPurchase.purchase_order_details) {
        const oldQty = parseFloat(oldDetail.quantity || "0");
        const prod = await tx.products.findUnique({
          where: { id: oldDetail.product_id },
          select: { quantity: true },
        });
        if (prod) {
          const currentStock = parseFloat(prod.quantity || "0");
          const revertedStock = Math.max(0, currentStock - oldQty);
          await tx.products.update({
            where: { id: oldDetail.product_id },
            data: { quantity: String(revertedStock) },
          });
        }
      }

      // 2. Revert previous due from old supplier
      const oldDue = parseFloat(existingPurchase.due_amount || "0");
      if (existingPurchase.supplier_id && oldDue > 0) {
        const oldSupp = await tx.suppliers.findUnique({
          where: { id: existingPurchase.supplier_id },
          select: { purchase_payable_amount: true },
        });
        if (oldSupp) {
          const currentPayable = parseFloat(oldSupp.purchase_payable_amount || "0");
          const revertedPayable = Math.max(0, currentPayable - oldDue);
          await tx.suppliers.update({
            where: { id: existingPurchase.supplier_id },
            data: { purchase_payable_amount: String(revertedPayable) },
          });
        }
      }

      // 3. Apply new due to current supplier
      const newSupp = await tx.suppliers.findUnique({
        where: { id: newSuppId },
        select: { purchase_payable_amount: true },
      });
      if (!newSupp) {
        throw new Error("নির্বাচিত সরবরাহকারী পাওয়া যায়নি!");
      }
      const newPayable = parseFloat(newSupp.purchase_payable_amount || "0") + dueNum;
      await tx.suppliers.update({
        where: { id: newSuppId },
        data: { purchase_payable_amount: String(newPayable) },
      });

      // 4. Update purchase master
      const updatedPur = await tx.purchases.update({
        where: { id: purchaseId },
        data: {
          supplier_id: newSuppId,
          referance_no: referance_no ? String(referance_no).trim() : null,
          grand_subtotal: String(grandSub),
          delivery_charge: delivChg,
          paid_amount: String(paidNum),
          due_amount: String(dueNum),
          purchase_payable_amount: String(newPayable),
          date: purDate,
        },
      });

      // 5. Replace purchase_order_details with new items and increment product stocks
      await tx.purchase_order_details.deleteMany({
        where: { purchase_id: purchaseId },
      });

      for (const item of items) {
        if (!item.product_id || !item.quantity) continue;
        const prodId = BigInt(item.product_id);
        const qtyNum = parseFloat(String(item.quantity || "0"));
        const costNum = parseFloat(String(item.cost_price || "0"));
        const lineTotal = costNum * qtyNum;

        await tx.purchase_order_details.create({
          data: {
            purchase_id: purchaseId,
            product_id: prodId,
            quantity: String(qtyNum),
            cost_price: String(costNum),
            subtotal: String(lineTotal),
            user_id: existingPurchase.user_id,
          },
        });

        // Add new stock to product
        const prod = await tx.products.findUnique({
          where: { id: prodId },
          select: { quantity: true },
        });
        if (prod) {
          const currentStock = parseFloat(prod.quantity || "0");
          await tx.products.update({
            where: { id: prodId },
            data: { quantity: String(currentStock + qtyNum) },
          });
        }
      }

      // 6. Update payment details
      await tx.purchase_payment_details.deleteMany({
        where: { purchases_id: purchaseId },
      });

      if (paidNum > 0) {
        await tx.purchase_payment_details.create({
          data: {
            purchases_id: purchaseId,
            paid_amount: String(paidNum),
            payment_method: payment_method || "Cash",
            transaction_id: transaction_id || null,
            purchase_due_collection_date: purDate,
            payment_status: dueNum <= 0 ? "Paid" : "Partial",
            user_id: existingPurchase.user_id,
          },
        });
      }

      return updatedPur;
    });

    try {
      const authUser = await getAuthUser(req);
      await recordActivity({
        req,
        userId: authUser?.id,
        action: "UPDATE",
        module: "Purchases",
        entityId: String(purchaseId),
        description: `Updated purchase invoice #${existingPurchase.purchase_id}: Subtotal ৳${grandSub}, Due ৳${dueNum}`,
      });
    } catch {}

    return NextResponse.json({
      status: "success",
      message: "ক্রয় ও স্টক ইন সফলভাবে আপডেট করা হয়েছে!",
      data: { id: Number(updated.id) },
    });
  } catch (error: any) {
    console.error("Purchase PUT Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to update purchase" },
      { status: 500 }
    );
  }
}
