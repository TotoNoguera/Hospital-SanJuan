import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import {
  createPatientSessionToken,
  PATIENT_SESSION_COOKIE,
  patientSessionCookieOptions,
} from "@/lib/auth-patient";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { name, dni, email, phone, password } = body ?? {};

  if (!name || !dni || !email || !phone || !password) {
    return NextResponse.json({ error: "Completá todos los campos" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 },
    );
  }

  const existing = await prisma.patient.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
  }

  const patient = await prisma.patient.create({
    data: { name, dni, email, phone, passwordHash: hashPassword(password) },
  });

  const token = await createPatientSessionToken(patient.id);
  const response = NextResponse.json({
    ok: true,
    patient: { id: patient.id, name: patient.name, email: patient.email },
  });
  response.cookies.set(PATIENT_SESSION_COOKIE, token, patientSessionCookieOptions);
  return response;
}
