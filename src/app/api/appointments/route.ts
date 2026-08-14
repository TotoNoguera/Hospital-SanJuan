import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, AppointmentStatus } from "@/generated/prisma/client";
import { getPatientSession } from "@/lib/auth-patient";
import { getStaffSession } from "@/lib/auth-staff";
import { getAvailableSlots, slotDateTime } from "@/lib/slots";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateFilter = searchParams.get("date");
  const specialtyId = searchParams.get("specialtyId");
  const doctorId = searchParams.get("doctorId");
  const status = searchParams.get("status");

  const staffSession = await getStaffSession();
  if (staffSession) {
    const where: Prisma.AppointmentWhereInput = {};
    if (staffSession.role === "DOCTOR") {
      if (!staffSession.doctorId) return NextResponse.json({ appointments: [] });
      where.doctorId = staffSession.doctorId;
    } else if (doctorId) {
      where.doctorId = doctorId;
    }
    if (specialtyId) where.specialtyId = specialtyId;
    if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      where.status = status as AppointmentStatus;
    }
    if (dateFilter) {
      where.date = {
        gte: new Date(`${dateFilter}T00:00:00`),
        lte: new Date(`${dateFilter}T23:59:59`),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true, doctor: true, specialty: true },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ appointments });
  }

  const patientSession = await getPatientSession();
  if (patientSession) {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patientSession.patientId },
      include: { doctor: true, specialty: true },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ appointments });
  }

  return NextResponse.json({ error: "No autenticado" }, { status: 401 });
}

export async function POST(request: Request) {
  const patientSession = await getPatientSession();
  if (!patientSession) {
    return NextResponse.json(
      { error: "Necesitás iniciar sesión para reservar un turno" },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const { doctorId, date, time } = body ?? {};
  if (!doctorId || !date || !time) {
    return NextResponse.json({ error: "Faltan datos del turno" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: "Formato de fecha u horario inválido" }, { status: 400 });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { specialty: true },
  });
  if (!doctor || !doctor.active) {
    return NextResponse.json({ error: "El profesional no existe" }, { status: 404 });
  }
  if (doctor.specialty.bookingMode !== "ONLINE") {
    return NextResponse.json({ error: "Esta especialidad no admite reserva online" }, { status: 400 });
  }

  const availableSlots = await getAvailableSlots(doctorId, date);
  if (!availableSlots.includes(time)) {
    return NextResponse.json(
      { error: "Ese horario ya no está disponible, elegí otro." },
      { status: 409 },
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patientSession.patientId,
      doctorId,
      specialtyId: doctor.specialtyId,
      date: slotDateTime(date, time),
      status: "CONFIRMED",
    },
    include: { patient: true, doctor: true, specialty: true },
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
