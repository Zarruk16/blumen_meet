import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signMobileToken, userToMobileProfile } from "@/lib/mobileAuth";

/** Exchange NextAuth session (after Google/GitHub) for a mobile JWT. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.status === "suspended") {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const token = await signMobileToken(user);
    return NextResponse.json({
      token,
      user: userToMobileProfile(user),
    });
  } catch (error) {
    console.error("[mobile/auth/bridge]", error);
    return NextResponse.json({ error: "Bridge failed" }, { status: 500 });
  }
}
