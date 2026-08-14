import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth-staff";
import { prisma } from "@/lib/prisma";
import AppointmentsTable from "@/components/admin/AppointmentsTable";

export const metadata = { title: "Panel — Hospital San Juan" };

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await getStaffSession();
  if (!session) redirect("/admin/login");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const isDoctor = session.role === "DOCTOR";

  const [todayAppointments, totalPatients, totalSpecialties] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: { gte: todayStart, lte: todayEnd },
        ...(isDoctor ? { doctorId: session.doctorId ?? "__none__" } : {}),
      },
      include: { patient: true, doctor: true, specialty: true },
      orderBy: { date: "asc" },
    }),
    prisma.patient.count(),
    prisma.specialty.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Hola, {session.name.split(" ")[0]}</h1>
      <p className="mt-1 text-muted">
        Turnos de hoy {isDoctor ? "en tu agenda" : "en todo el hospital"}.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Turnos hoy" value={todayAppointments.length} />
        {!isDoctor && <StatCard label="Pacientes registrados" value={totalPatients} />}
        {!isDoctor && <StatCard label="Especialidades" value={totalSpecialties} />}
      </div>

      <div className="mt-8">
        <AppointmentsTable
          appointments={todayAppointments.map((a) => ({
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
