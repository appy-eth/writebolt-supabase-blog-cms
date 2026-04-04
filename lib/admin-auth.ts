import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const COOKIE_NAME = "admin_session";

/** Deterministic session token from env (same process recomputes on every request). */
export function adminSessionCookieValue(): string {
  const u = process.env.ADMIN_USERNAME ?? "";
  const p = process.env.ADMIN_PASSWORD ?? "";
  return createHash("sha256").update(p + u).digest("hex");
}

function sessionCookieMatches(provided: string | undefined): boolean {
  if (!provided) return false;
  const expected = adminSessionCookieValue();
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(provided, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}

// ---------- PAGE PROTECTION ----------
export async function requireAdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (!sessionCookieMatches(session?.value)) {
    redirect("/admin/login");
  }
}

// ---------- API PROTECTION ----------
export async function requireAdminApi(): Promise<Response | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (!sessionCookieMatches(session?.value)) {
    return new Response("Unauthorized", { status: 401 });
  }

  return null;
}
