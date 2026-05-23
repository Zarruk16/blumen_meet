import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { canAccessAdmin, canAccessResellerDashboard } from "./permissions";

export async function getPlatformSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role || "customer",
    company: session.user.company || "",
    avatar: session.user.image || session.user.profilePicture || "",
  };
}

export async function requirePlatformSession() {
  const session = await getPlatformSession();
  if (!session) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requirePlatformSession();
  if (!canAccessAdmin(session.role)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  return session;
}

export async function requireResellerSession() {
  const session = await requirePlatformSession();
  if (!canAccessResellerDashboard(session.role)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  return session;
}
