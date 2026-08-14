import { NextRequest, NextResponse } from "next/server";
import { STAFF_SESSION_COOKIE, verifyStaffSessionToken } from "@/lib/auth-staff";
import { PATIENT_SESSION_COOKIE, verifyPatientSessionToken } from "@/lib/auth-patient";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
    const session = token ? await verifyStaffSessionToken(token) : null;
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/paciente")) {
    const token = request.cookies.get(PATIENT_SESSION_COOKIE)?.value;
    const session = token ? await verifyPatientSessionToken(token) : null;
    if (!session) {
      const loginUrl = new URL("/paciente/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/((?!login).*)",
    "/paciente/mis-turnos",
    "/paciente/mis-turnos/:path*",
    "/paciente/perfil",
    "/paciente/perfil/:path*",
  ],
};
