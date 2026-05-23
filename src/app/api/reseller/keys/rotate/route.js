import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reseller from "@/models/Reseller";
import { requireResellerSession } from "@/lib/saas/session";
import { rotateResellerKeys } from "@/lib/saas/resellerService";
import { logApiUsage } from "@/lib/saas/trackUsage";

export async function POST() {
  try {
    const session = await requireResellerSession();
    await dbConnect();

    const reseller = await Reseller.findOne({ userId: session.userId });
    if (!reseller) {
      return NextResponse.json({ error: "Reseller not found" }, { status: 404 });
    }

    const { apiKey, apiSecret } = await rotateResellerKeys(reseller._id);

    await logApiUsage({
      resellerId: reseller._id,
      userId: session.userId,
      endpoint: "/reseller/keys/rotate",
    });

    return NextResponse.json({
      ok: true,
      apiKey,
      apiSecret,
      message: "Store the secret now — it will not be shown again.",
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
