import { SignJWT, jwtVerify } from "jose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { verifyPassword } from "@/lib/saas/password";

const MOBILE_TOKEN_TTL = "90d";

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function signMobileToken(user) {
  return new SignJWT({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    company: user.company || "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(MOBILE_TOKEN_TTL)
    .sign(getSecret());
}

export async function verifyMobileToken(token) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
}

export async function authenticateMobileUser(email, password) {
  await dbConnect();
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user?.password) return null;
  if (user.status === "suspended") return null;
  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;
  return user;
}

export function userToMobileProfile(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    company: user.company || "",
    image: user.avatar || user.profilePicture || "",
  };
}
