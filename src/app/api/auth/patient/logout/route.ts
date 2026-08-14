import { NextResponse } from "next/server";
import { PATIENT_SESSION_COOKIE, patientSessionCookieOptions } from "@/lib/auth-patient";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // .delete() no siempre matchea el path de la cookie original; se sobreescribe
  // explícitamente con los mismos atributos y maxAge 0 para asegurar el borrado.
  response.cookies.set(PATIENT_SESSION_COOKIE, "", { ...patientSessionCookieOptions, maxAge: 0 });
  return response;
}
