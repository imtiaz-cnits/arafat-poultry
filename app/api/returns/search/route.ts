import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/returns/search?type=sales|purchase&query=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "sales";
    const rawQuery = (searchParams.get("query") || searchParams.get("order_no") || searchParams.get("purchase_no") || "").trim();

    if (!rawQuery) {
      return NextResponse.json(
        { status: "fail", message: type === "purchase" ? "Purchase memo number is required" : "Invoice number is required" },
        { status: 400 }
      );
    }

    const cleanQuery = rawQuery.replace(/^#/, "").trim();

    if (type === "purchase") {
      // Search Purchase by ID, reference no, or supplier name
      let purchase: any = null;

      // Try numeric ID
      const numId = parseInt(cleanQuery.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(numId) && numId > 0) {
        purchase = await prisma.purchases.findFirst({
          where: {
            OR: [
              { id: BigInt(numId) },
              { purchase_id: { contains: cleanQuery } },
              { referance_no: { contains: cleanQuery } },
            ],
          },
          include: {
            suppliers: true,
            purchase_order_details: {
              include: {
                products: true,
              },
            },
          },
        });
      }

      if (!purchase) {
        purchase = await prisma.purchases.findFirst({
          where: {
            OR: [
              { purchase_id: { contains: cleanQuery } },
              { referance_no: { contains: cleanQuery } },
              {
                suppliers: {
                  OR: [
                    { name: { contains: cleanQuery } },
                    { company: { contains: cleanQuery } },
                  ],
                },
              },
            ],
          },
          orderBy: { id: "desc" },
          include: {
            suppliers: true,
            purchase_order_details: {
              include: {
                products: true,
              },
            },
          },
        });
      }

      if (!purchase) {
        return NextResponse.json(
          { status: "fail", message: `No purchase record found matching '${rawQuery}'` },
          { status: 404 }
        );
      }

      // Fetch existing purchase returns for this purchase to calculate remaining returnable quantity
      const existingReturns = await prisma.purchase_returns.findMany({
        where: { purchase_id: purchase.id },
      });

      const returnedQtyByProduct = new Map<string, number>();
      for (const ret of existingReturns) {
        const pKey = ret.product_id.toString();
        returnedQtyByProduct.set(pKey, (returnedQtyByProduct.get(pKey) || 0) + (ret.quantity || 0));
      }

      const items = purchase.purchase_order_details.map((detail: any) => {
        const prod = detail.products;
        const pIdStr = detail.product_id.toString();
        const purchasedQty = parseInt(String(detail.quantity || 0), 10);
        const alreadyReturnedQty = returnedQtyByProduct.get(pIdStr) || 0;
        const remainingQty = Math.max(0, purchasedQty - alreadyReturnedQty);

        let code = "N/A";
        if (prod?.product_code) {
          try {
            const parsed = Array.isArray(prod.product_code)
              ? prod.product_code
              : JSON.parse(String(prod.product_code));
            code = parsed[0] || "N/A";
          } catch {
            code = String(prod.product_code);
          }
        }

        const costPrice = parseFloat(String(detail.cost_price || 0));

        return {
          detail_id: Number(detail.id),
          product_id: Number(detail.product_id),
          product_name: prod?.product_name || "Product",
          product_code: code,
          tile_size: prod?.tile_size || null,
          pcs_per_box: prod?.pcs_per_box ? parseInt(prod.pcs_per_box, 10) : null,
          grade: prod?.grade || null,
          purchased_quantity: purchasedQty,
          already_returned_quantity: alreadyReturnedQty,
          returnable_quantity: remainingQty,
          unit_price: costPrice,
          subtotal: parseFloat(String(detail.subtotal || purchasedQty * costPrice)),
        };
      });

      return NextResponse.json({
        status: "success",
        data: {
          id: Number(purchase.id),
          purchase_no: purchase.purchase_id ? `#${purchase.purchase_id}` : `#PurID${String(purchase.id).padStart(5, "0")}`,
          supplier_id: Number(purchase.supplier_id),
          supplier_name: purchase.suppliers?.name || purchase.suppliers?.company || "Supplier",
          supplier_mobile: purchase.suppliers?.mobile || "N/A",
          purchase_date: purchase.date ? new Date(purchase.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A",
          grand_subtotal: parseFloat(String(purchase.grand_subtotal || 0)),
          paid_amount: parseFloat(String(purchase.paid_amount || 0)),
          due_amount: parseFloat(String(purchase.due_amount || 0)),
          items,
        },
      });
    } else {
      // Search Sales Invoice by Order No, ID, or customer name/mobile
      let order: any = null;

      order = await prisma.orders.findFirst({
        where: {
          OR: [
            { order_no: rawQuery },
            { order_no: `#${cleanQuery}` },
            { order_no: cleanQuery },
            { order_no: { contains: cleanQuery } },
          ],
        },
        include: {
          customers: true,
          order_details: {
            include: {
              products: true,
            },
          },
        },
      });

      // Try numeric ID if not found
      if (!order) {
        const numId = parseInt(cleanQuery.replace(/[^0-9]/g, ""), 10);
        if (!isNaN(numId) && numId > 0) {
          order = await prisma.orders.findUnique({
            where: { id: BigInt(numId) },
            include: {
              customers: true,
              order_details: {
                include: {
                  products: true,
                },
              },
            },
          });
        }
      }

      if (!order) {
        return NextResponse.json(
          { status: "fail", message: `No invoice found matching '${rawQuery}'` },
          { status: 404 }
        );
      }

      // Fetch existing product returns for this order to calculate remaining returnable quantity
      const existingReturns = await prisma.product_returns.findMany({
        where: { order_id: order.id },
      });

      const returnedQtyByProduct = new Map<string, number>();
      for (const ret of existingReturns) {
        if (ret.product_id) {
          const pKey = ret.product_id.toString();
          returnedQtyByProduct.set(pKey, (returnedQtyByProduct.get(pKey) || 0) + (ret.quantity || 0));
        }
      }

      const items = order.order_details.map((detail: any) => {
        const prod = detail.products;
        const pIdStr = detail.product_id.toString();
        const purchasedQty = parseInt(String(detail.quantity || 0), 10);
        const alreadyReturnedQty = returnedQtyByProduct.get(pIdStr) || 0;
        const remainingQty = Math.max(0, purchasedQty - alreadyReturnedQty);

        let code = "N/A";
        if (prod?.product_code) {
          try {
            const parsed = Array.isArray(prod.product_code)
              ? prod.product_code
              : JSON.parse(String(prod.product_code));
            code = parsed[0] || "N/A";
          } catch {
            code = String(prod.product_code);
          }
        }

        const sellingPrice = parseFloat(String(detail.selling_price || 0));
        const unitPrice = purchasedQty > 0 ? sellingPrice / purchasedQty : 0;

        return {
          detail_id: Number(detail.id),
          product_id: Number(detail.product_id),
          product_name: prod?.product_name || "Product",
          product_code: code,
          tile_size: prod?.tile_size || null,
          pcs_per_box: prod?.pcs_per_box ? parseInt(prod.pcs_per_box, 10) : null,
          grade: prod?.grade || null,
          surface_finish: prod?.surface_finish || null,
          purchased_quantity: purchasedQty,
          already_returned_quantity: alreadyReturnedQty,
          returnable_quantity: remainingQty,
          unit_price: Math.round(unitPrice * 100) / 100,
          total_selling_price: sellingPrice,
        };
      });

      return NextResponse.json({
        status: "success",
        data: {
          id: Number(order.id),
          order_no: order.order_no || `#ORD-${order.id}`,
          customer_id: Number(order.customer_id || 0),
          customer_name: order.customers?.customer_name || "Customer",
          customer_mobile: order.customers?.mobile || "N/A",
          invoice_date: order.invoice_date
            ? new Date(order.invoice_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : order.created_at
            ? new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "N/A",
          sub_total: parseFloat(String(order.sub_total || 0)),
          paid_amount: parseFloat(String(order.paid_amount || 0)),
          due_amount: parseFloat(String(order.due_amount || 0)),
          discount_amount: parseFloat(String(order.discount_amount || 0)),
          items,
        },
      });
    }
  } catch (error: any) {
    console.error("Return Search Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to search record" },
      { status: 500 }
    );
  }
}
