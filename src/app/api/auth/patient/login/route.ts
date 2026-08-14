import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  createPatientSessionToken,
  PATIENT_SESSION_COOKIE,
  patientSessionCookieOptions,
} from "@/lib/auth-patient";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { email, password } = body ?? {};
  if (!email || !password) {
    return NextResponse.json({ error: "Completá email y contraseña" }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { email } });
  if (!patient || !verifyPassword(password, patient.passwordHash)) {
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  }

  const token = await createPatientSessionToken(patient.id);
  const response = NextResponse.json({
    ok: true,
    patient: { id: patient.id, name: patient.name, email: patient.email },
  });
  response.cookies.set(PATIENT_SESSION_COOKIE, token, patientSessionCookieOptions);
  return response;
}
