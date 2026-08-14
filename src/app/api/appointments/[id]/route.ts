import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@/generated/prisma/client";
import { getPatientSession } from "@/lib/auth-patient";
import { getStaffSession } from "@/lib/auth-staff";

const STAFF_STATUSES: AppointmentStatus[] = ["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status as string | undefined;

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    return NextResponse.json({ error: "El turno no existe" }, { status: 404 });
  }

  const staffSession = await getStaffSession();
  if (staffSession) {
    if (staffSession.role === "DOCTOR" && appointment.doctorId !== staffSession.doctorId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (!status || !STAFF_STATUSES.includes(status as AppointmentStatus)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: status as AppointmentStatus },
      include: { patient: true, doctor: true, specialty: true },
    });
    return NextResponse.json({ appointment: updated });
  }

  const patientSession = await getPatientSession();
  if (patientSession) {
    if (appointment.patientId !== patientSession.patientId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Solo podés cancelar tu turno" },
        { status: 400 },
      );
    }
    if (appointment.date.getTime() < Date.now()) {
      return NextResponse.json({ error: "No se puede cancelar un turno que ya pasó" }, { status: 400 });
    }
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { doctor: true, specialty: true },
    });
    return NextResponse.json({ appointment: updated });
  }

  return NextResponse.json({ error: "No autenticado" }, { status: 401 });
}
