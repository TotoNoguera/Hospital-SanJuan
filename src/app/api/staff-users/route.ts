import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireStaffRole, StaffRole } from "@/lib/auth-staff";

const ROLES: StaffRole[] = ["ADMIN", "SECRETARY", "DOCTOR"];

export async function GET() {
  const session = await requireStaffRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const staff = await prisma.staffUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      doctorId: true,
      createdAt: true,
      doctor: { include: { specialty: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ staff });
}

export async function POST(request: Request) {
  const session = await requireStaffRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const { name, email, password, role, doctorId } = body ?? {};

  if (!name || !email || !password || !ROLES.includes(role)) {
    return NextResponse.json({ error: "Completá todos los campos correctamente" }, { status: 400 });
  }
  if (role === "DOCTOR" && !doctorId) {
    return NextResponse.json(
      { error: "Elegí a qué profesional corresponde esta cuenta" },
      { status: 400 },
    );
  }

  const existing = await prisma.staffUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
  }

  const staff = await prisma.staffUser.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      doctorId: role === "DOCTOR" ? doctorId : null,
    },
    select: { id: true, name: true, email: true, role: true, doctorId: true, createdAt: true },
  });
  return NextResponse.json({ staff }, { status: 201 });
}
