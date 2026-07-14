import type { APIRequestContext } from "@playwright/test";

/**
 * API helper used by both API-only tests and browser-driven tests
 * that need to seed data or authenticate directly against the server.
 */

export const ADMIN_USERNAME = process.env.TEST_ADMIN_USERNAME ?? "admin";
export const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "marioandmaria";

/** Log in as admin. Returns the response so callers can assert status. */
export async function adminLogin(
  request: APIRequestContext,
  username = ADMIN_USERNAME,
  password = ADMIN_PASSWORD,
) {
  return request.post("/api/admin/login", {
    data: { username, password },
  });
}

/** Grab the first active (used, unexpired) customer code for reuse in tests. */
export async function getActiveCustomerCode(request: APIRequestContext) {
  const res = await request.get("/api/admin/codes?limit=25");
  if (!res.ok()) return null;
  const body = (await res.json()) as {
    codes?: Array<{
      code: string;
      device_id: string | null;
      is_used: boolean;
      expires_at: string | null;
      tier: number;
      customer_name: string | null;
    }>;
  };
  const now = Date.now();
  return (
    body.codes?.find(
      (c) =>
        c.is_used &&
        c.device_id &&
        c.expires_at !== null &&
        new Date(c.expires_at).getTime() > now,
    ) ?? null
  );
}

/** Verify a customer code + device pair, setting the customer session cookie. */
export async function verifyCustomer(
  request: APIRequestContext,
  code: string,
  deviceId: string,
) {
  return request.post("/api/verify-code", {
    data: { code, device_id: deviceId },
  });
}

/** Generate a fresh device_id matching the server-side format. */
export function makeDeviceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return (
    "dev_" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}
