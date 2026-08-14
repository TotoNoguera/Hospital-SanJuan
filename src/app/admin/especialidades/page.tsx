import { redirect } from "next/navigation";
import { requireStaffRole } from "@/lib/auth-staff";
import { prisma } from "@/lib/prisma";
import SpecialtyManager from "@/components/admin/SpecialtyManager";

export const metadata = { title: "Especialidades — Admin" };

export default async function AdminEspecialidadesPage() {
  const session = await requireStaffRole(["ADMIN", "SECRETARY"]);
  if (!session) redirect("/admin");

  const specialties = await prisma.specialty.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Especialidades</h1>
      <p className="mt-1 text-muted">
        Editá cómo se pide turno en cada servicio — reemplaza a la planilla.
      </p>
      <div className="mt-6">
        <SpecialtyManager specialties={specialties} />
      </div>
    </div>
  );
}
