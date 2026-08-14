import { NextResponse } from "next/server";
import { STAFF_SESSION_COOKIE, staffSessionCookieOptions } from "@/lib/auth-staff";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // .delete() no siempre matchea el path de la cookie original; se sobreescribe
  // explícitamente con los mismos atributos y maxAge 0 para asegurar el borrado.
  response.cookies.set(STAFF_SESSION_COOKIE, "", { ...staffSessionCookieOptions, maxAge: 0 });
  return response;
}
