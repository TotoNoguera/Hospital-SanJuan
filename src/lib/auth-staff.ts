import { cookies } from "next/headers";
import { signSession, verifySession } from "./session";

export const STAFF_SESSION_COOKIE = "hsj_staff_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 días

export type StaffRole = "ADMIN" | "SECRETARY" | "DOCTOR";

export type StaffSessionPayload = {
  staffId: string;
  role: StaffRole;
  doctorId: string | null;
  name: string;
};

export async function createStaffSessionToken(payload: StaffSessionPayload) {
  return signSession<StaffSessionPayload>(payload, SESSION_DURATION_SECONDS);
}

export async function verifyStaffSessionToken(token: string) {
  return verifySession<StaffSessionPayload>(token);
}

export async function getStaffSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyStaffSessionToken(token);
}

/** Devuelve la sesión si el rol alcanza, o null. Úsalo en layouts/pages para autorización fina. */
export async function requireStaffRole(roles: StaffRole[]) {
  const session = await getStaffSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}

export const staffSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
