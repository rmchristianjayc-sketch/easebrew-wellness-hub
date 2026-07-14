import { SignJWT } from "jose";

/**
 * Directly sign session JWTs using JWT_SECRET so tests skip the /api/verify-code
 * and /api/admin/login endpoints (avoiding rate-limit consumption during CI).
 * Uses the exact same shape as lib/auth.ts so the app accepts the token.
 */

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET not set — tests need it (load .env.local)");
  return new TextEncoder().encode(s);
}

export async function signCustomerJwt(session: {
  code: string;
  tier: number;
  packs: number;
  expires_at: string;
  device_id: string;
}) {
  const exp = Math.floor(new Date(session.expires_at).getTime() / 1000);
  return new SignJWT({ ...session, kind: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret());
}

export async function signAdminJwt(username: string, role: "owner" | "coach" = "owner") {
  return new SignJWT({ username, role, kind: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}
