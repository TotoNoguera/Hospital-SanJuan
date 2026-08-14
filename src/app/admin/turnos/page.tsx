import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-staff";
import { prisma } from "@/lib/prisma";
import { AppointmentStatus, Prisma } from "@/generated/prisma/client";
import AppointmentFilters from "@/components/admin/AppointmentFilters";
import AppointmentsTable from "@/components/admin/AppointmentsTable";

export const metadata = { title: "Turnos — Hospital San Juan" };

export default async function AdminTurnosPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; specialtyId?: string; doctorId?: string; status?: string }>;
}) {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");

  const { date, specialtyId, doctorId, status } = await searchParams;

  const where: Prisma.AppointmentWhereInput = {};
  if (session.role === "DOCTOR") {
    where.doctorId = session.doctorId ?? "__none__";
  } else {
    if (doctorId) where.doctorId = doctorId;
    if (specialtyId) where.specialtyId = specialtyId;
  }
  if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
    where.status = status as AppointmentStatus;
  }
  if (date) {
    where.date = { gte: new Date(`${date}T00:00:00`), lte: new Date(`${date}T23:59:59`) };
  }

  const [appointments, specialties, doctors] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { patient: true, doctor: true, specialty: true },
      orderBy: { date: "asc" },
    }),
    prisma.specialty.findMany({ where: { bookingMode: "ONLINE" }, orderBy: { name: "asc" } }),
    prisma.doctor.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Turnos</h1>
      <p className="mt-1 text-muted">Gestioná el estado de los turnos reservados online.</p>

      {session.role !== "DOCTOR" && (
        <div className="mt-6">
          <AppointmentFilters specialties={specialties} doctors={doctors} />
        </div>
      )}

      <div className="mt-6">
        <AppointmentsTable
          appointments={appointments.map((a) => ({
            id: a.id,
            date: a.date.toISOString(),
            status: a.status,
            patientName: a.patient.name,
            patientPhone: a.patient.phone,
            doctorName: a.doctor.name,
            specialtyName: a.specialty.name,
          }))}
        />
      </div>
    </div>
  );
}
