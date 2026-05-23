import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Reseller from "@/models/Reseller";
import Meeting from "@/models/Meeting";
import Recording from "@/models/Recording";
import ApiUsage from "@/models/ApiUsage";
import { requireAdminSession } from "@/lib/saas/session";

export async function GET() {
  try {
    await requireAdminSession();
    await dbConnect();

    const [
      resellerCount,
      activeResellers,
      meetingCount,
      activeMeetings,
      recordingCount,
      totalMinutes,
      apiRequestsToday,
    ] = await Promise.all([
      Reseller.countDocuments(),
      Reseller.countDocuments({ isSuspended: false }),
      Meeting.countDocuments(),
      Meeting.countDocuments({ status: "active" }),
      Recording.countDocuments(),
      Reseller.aggregate([{ $group: { _id: null, total: { $sum: "$minutesUsed" } } }]),
      ApiUsage.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    const recentResellers = await Reseller.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .lean();

    return NextResponse.json({
      stats: {
        resellers: resellerCount,
        activeResellers,
        meetings: meetingCount,
        activeMeetings,
        recordings: recordingCount,
        totalMinutes: totalMinutes[0]?.total || 0,
        apiRequestsToday,
        users: await User.countDocuments(),
      },
      recentResellers: recentResellers.map((r) => ({
        id: r._id.toString(),
        companyName: r.companyName,
        plan: r.subscriptionPlan,
        minutesUsed: r.minutesUsed,
        isSuspended: r.isSuspended,
        user: r.userId,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    const status = error.status || 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
