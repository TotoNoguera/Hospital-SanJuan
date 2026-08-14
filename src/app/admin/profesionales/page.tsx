import { redirect } from "next/navigation";
import { requireStaffRole } from "@/lib/auth-staff";
import { prisma } from "@/lib/prisma";
import DoctorManager from "@/components/admin/DoctorManager";

export const metadata = { title: "Profesionales — Admin" };

export default async function AdminProfesionalesPage() {
  const session = await requireStaffRole(["ADMIN", "SECRETARY"]);
  if (!session) redirect("/admin");

  const [doctors, specialties] = await Promise.all([
    prisma.doctor.findMany({ include: { specialty: true }, orderBy: { name: "asc" } }),
    prisma.specialty.findMany({ where: { bookingMode: "ONLINE" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Profesionales</h1>
      <p className="mt-1 text-muted">
        Cargá profesionales y sus horarios de atención para reserva online.
      </p>
      <div className="mt-6">
        <DoctorManager
          doctors={doctors.map((d) => ({
            id: d.id,
            name: d.name,
            bio: d.bio,
            active: d.active,
            specialtyId: d.specialtyId,
            specialtyName: d.specialty.name,
          }))}
          specialties={specialties.map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>
    </div>
  );
}
