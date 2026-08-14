import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffRole } from "@/lib/auth-staff";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const specialtyId = searchParams.get("specialtyId");

  const doctors = await prisma.doctor.findMany({
    where: { active: true, ...(specialtyId ? { specialtyId } : {}) },
    include: { specialty: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ doctors });
}

export async function POST(request: Request) {
  const session = await requireStaffRole(["ADMIN", "SECRETARY"]);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const { name, bio, photoUrl, specialtyId } = body ?? {};
  if (!name || !specialtyId) {
    return NextResponse.json({ error: "Nombre y especialidad son obligatorios" }, { status: 400 });
  }

  const specialty = await prisma.specialty.findUnique({ where: { id: specialtyId } });
  if (!specialty) {
    return NextResponse.json({ error: "La especialidad no existe" }, { status: 404 });
  }
  if (specialty.bookingMode !== "ONLINE") {
    return NextResponse.json(
      { error: "Solo se pueden cargar profesionales en especialidades con reserva online" },
      { status: 400 },
    );
  }

  const doctor = await prisma.doctor.create({
    data: { name, bio: bio || null, photoUrl: photoUrl || null, specialtyId },
  });
  return NextResponse.json({ doctor }, { status: 201 });
}
