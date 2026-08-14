import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  createStaffSessionToken,
  STAFF_SESSION_COOKIE,
  staffSessionCookieOptions,
} from "@/lib/auth-staff";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { email, password } = body ?? {};
  if (!email || !password) {
    return NextResponse.json({ error: "Completá email y contraseña" }, { status: 400 });
  }

  const staff = await prisma.staffUser.findUnique({ where: { email } });
  if (!staff || !verifyPassword(password, staff.passwordHash)) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  const token = await createStaffSessionToken({
    staffId: staff.id,
    role: staff.role,
    doctorId: staff.doctorId,
    name: staff.name,
  });
  const response = NextResponse.json({
    ok: true,
    staff: { id: staff.id, name: staff.name, role: staff.role },
  });
  response.cookies.set(STAFF_SESSION_COOKIE, token, staffSessionCookieOptions);
  return response;
}
