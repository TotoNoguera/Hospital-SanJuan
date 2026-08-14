import { cookies } from "next/headers";
import { signSession, verifySession } from "./session";

export const PATIENT_SESSION_COOKIE = "hsj_patient_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 días

export type PatientSessionPayload = { patientId: string };

export async function createPatientSessionToken(patientId: string) {
  return signSession<PatientSessionPayload>({ patientId }, SESSION_DURATION_SECONDS);
}

export async function verifyPatientSessionToken(token: string) {
  return verifySession<PatientSessionPayload>(token);
}

export async function getPatientSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PATIENT_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyPatientSessionToken(token);
}

export async function requirePatientSession() {
  const session = await getPatientSession();
  if (!session) throw new Error("No autenticado");
  return session;
}

export const patientSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
