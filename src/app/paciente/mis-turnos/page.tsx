import { redirect } from "next/navigation";
import { getPatientSession } from "@/lib/auth-patient";
import { prisma } from "@/lib/prisma";
import AppointmentList from "@/components/booking/AppointmentList";

export const metadata = { title: "Mis turnos — Hospital San Juan" };

export default async function MisTurnosPage() {
  const session = await getPatientSession();
  if (!session) redirect("/paciente/login?next=/paciente/mis-turnos");

  const appointments = await prisma.appointment.findMany({
    where: { patientId: session.patientId },
    include: { doctor: true, specialty: true },
    orderBy: { date: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Mis turnos</h1>
      <p className="mt-2 text-muted">Consultá o cancelá tus turnos reservados online.</p>
      <div className="mt-8">
        <AppointmentList
          now={new Date().toISOString()}
          appointments={appointments.map((a) => ({
            id: a.id,
            date: a.date.toISOString(),
            status: a.status,
            doctorName: a.doctor.name,
            specialtyName: a.specialty.name,
          }))}
        />
      </div>
    </div>
  );
}
