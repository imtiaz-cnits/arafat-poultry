import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { regradeEggs } from "@/lib/egg-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const body = await req.json();
    const { source_product_id, destination_product_id, quantity_pieces, date, note } = body;

    if (!source_product_id || !destination_product_id) {
      return NextResponse.json(
        { status: "fail", message: "উৎস এবং গন্তব্য গ্রেড নির্বাচন আবশ্যক" },
        { status: 400 }
      );
    }

    const pieces = parseInt(quantity_pieces);
    if (!pieces || pieces <= 0) {
      return NextResponse.json(
        { status: "fail", message: "স্থানান্তরযোগ্য ডিমের সংখ্যা ০-এর বেশি হতে হবে" },
        { status: 400 }
      );
    }

    const result = await regradeEggs({
      sourceProductId: source_product_id,
      destinationProductId: destination_product_id,
      quantityPieces: pieces,
      date: date ? new Date(date) : new Date(),
      note,
      userId: authResult.user.id,
    });

    return NextResponse.json({
      status: "success",
      message: `${pieces}টি ডিম সফলভাবে রিগ্রেড করা হয়েছে`,
      data: result,
    });
  } catch (error: any) {
    console.error("Regrade POST Error:", error);
    return NextResponse.json(
      { status: "fail", message: error?.message || "Failed to regrade eggs" },
      { status: 400 }
    );
  }
}
