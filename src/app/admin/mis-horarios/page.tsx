import { redirect } from "next/navigation";
import { requireStaffRole } from "@/lib/auth-staff";
import { prisma } from "@/lib/prisma";
import DoctorScheduleEditor from "@/components/admin/DoctorScheduleEditor";

export const metadata = { title: "Mis horarios — Admin" };

export default async function MisHorariosPage() {
  const session = await requireStaffRole(["DOCTOR"]);
  if (!session || !session.doctorId) redirect("/admin");

  const doctor = await prisma.doctor.findUnique({
    where: { id: session.doctorId },
    include: { specialty: true },
  });
  if (!doctor) redirect("/admin");

  const availability = await prisma.availability.findMany({
    where: { doctorId: doctor.id },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Mis horarios</h1>
      <p className="mt-1 text-muted">
        Definí los días y horarios en los que atendés — los pacientes van a poder reservar turno
        online en esos rangos.
      </p>
      <div className="mt-6 max-w-2xl">
        <DoctorScheduleEditor
          doctorId={doctor.id}
          doctorName={doctor.name}
          specialtyName={doctor.specialty.name}
          initial={availability.map((a) => ({
            weekday: a.weekday,
            startTime: a.startTime,
            endTime: a.endTime,
            slotMinutes: a.slotMinutes,
          }))}
        />
      </div>
    </div>
  );
}
