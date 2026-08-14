import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth-staff";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const availability = await prisma.availability.findMany({
    where: { doctorId: id },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json({ availability });
}

type AvailabilityInput = {
  weekday: number;
  startTime: string;
  endTime: string;
  slotMinutes?: number;
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getStaffSession();
  const isFrontDesk = session && (session.role === "ADMIN" || session.role === "SECRETARY");
  const isOwnDoctor = session && session.role === "DOCTOR" && session.doctorId === id;
  if (!isFrontDesk && !isOwnDoctor) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const slots: AvailabilityInput[] = Array.isArray(body?.availability) ? body.availability : [];

  const valid = slots.every(
    (s) =>
      typeof s.weekday === "number" &&
      s.weekday >= 0 &&
      s.weekday <= 6 &&
      /^\d{2}:\d{2}$/.test(s.startTime) &&
      /^\d{2}:\d{2}$/.test(s.endTime) &&
      s.startTime < s.endTime,
  );
  if (!valid) {
    return NextResponse.json({ error: "Horarios inválidos" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { doctorId: id } }),
    prisma.availability.createMany({
      data: slots.map((s) => ({
        doctorId: id,
        weekday: s.weekday,
        startTime: s.startTime,
        endTime: s.endTime,
        slotMinutes: s.slotMinutes && s.slotMinutes > 0 ? s.slotMinutes : 20,
      })),
    }),
  ]);

  const availability = await prisma.availability.findMany({
    where: { doctorId: id },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json({ availability });
}
