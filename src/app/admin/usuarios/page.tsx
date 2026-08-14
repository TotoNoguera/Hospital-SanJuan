import { redirect } from "next/navigation";
import { requireStaffRole } from "@/lib/auth-staff";
import { prisma } from "@/lib/prisma";
import StaffManager from "@/components/admin/StaffManager";

export const metadata = { title: "Usuarios — Admin" };

export default async function AdminUsuariosPage() {
  const session = await requireStaffRole(["ADMIN"]);
  if (!session) redirect("/admin");

  const [staff, doctors] = await Promise.all([
    prisma.staffUser.findMany({ include: { doctor: true }, orderBy: { name: "asc" } }),
    prisma.doctor.findMany({ include: { specialty: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Usuarios del staff</h1>
      <p className="mt-1 text-muted">Creá cuentas para secretaría y profesionales.</p>
      <div className="mt-6">
        <StaffManager
          currentStaffId={session.staffId}
          staff={staff.map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            role: s.role,
            doctorName: s.doctor?.name ?? null,
          }))}
          doctors={doctors.map((d) => ({ id: d.id, name: d.name, specialtyName: d.specialty.name }))}
        />
      </div>
    </div>
  );
}
