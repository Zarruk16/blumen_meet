import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Reseller from "@/models/Reseller";
import ResellerCustomer from "@/models/ResellerCustomer";
import { requireResellerSession } from "@/lib/saas/session";

async function getReseller(userId) {
  const reseller = await Reseller.findOne({ userId });
  if (!reseller) throw Object.assign(new Error("Reseller not found"), { status: 404 });
  return reseller;
}

export async function GET() {
  try {
    const session = await requireResellerSession();
    await dbConnect();
    const reseller = await getReseller(session.userId);
    const customers = await ResellerCustomer.find({ resellerId: reseller._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      customers: customers.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        email: c.email,
        company: c.company,
        status: c.status,
        meetingsCount: c.meetingsCount,
        minutesUsed: c.minutesUsed,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}

export async function POST(req) {
  try {
    const session = await requireResellerSession();
    const { name, email, company, notes } = await req.json();
    if (!name || !email) {
      return NextResponse.json({ error: "name and email required" }, { status: 400 });
    }

    await dbConnect();
    const reseller = await getReseller(session.userId);

    const customer = await ResellerCustomer.create({
      resellerId: reseller._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || "",
      notes: notes?.trim() || "",
    });

    return NextResponse.json({
      ok: true,
      customer: { id: customer._id.toString(), name: customer.name, email: customer.email },
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
