import BookingWizard from "@/components/booking/BookingWizard";
import { prisma } from "@/lib/prisma";
import { getPatientSession } from "@/lib/auth-patient";
import { redirect } from "next/navigation";

export const metadata = { title: "Reservar turno — Hospital San Juan" };

export default async function TurnosPage({
  searchParams,
}: {
  searchParams: Promise<{ especialidad?: string }>;
}) {
  // Verificar sesión - si no existe, redirigir a autenticación
  const session = await getPatientSession();
  if (!session) {
    redirect("/turnos/auth");
  }

  const { especialidad } = await searchParams;

  const specialties = await prisma.specialty.findMany({
    where: { bookingMode: "ONLINE" },
    orderBy: { order: "asc" },
    include: { doctors: { where: { active: true }, orderBy: { name: "asc" } } },
  });

  // Obtener datos del paciente autenticado
  const patient = await prisma.patient.findUnique({
    where: { id: session.patientId },
    select: { id: true, name: true },
  });

  if (!patient) {
    redirect("/turnos/auth");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reservá tu turno</h1>
      <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted">
        Elegí especialidad, profesional, día y horario. Confirmás en menos de 2 minutos.
      </p>

      <div className="mt-6 sm:mt-10">
        <BookingWizard
          specialties={specialties.map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            icon: s.icon,
            doctors: s.doctors.map((d) => ({ id: d.id, name: d.name, bio: d.bio })),
          }))}
          initialSpecialtySlug={especialidad}
          initialPatient={patient}
        />
      </div>
    </div>
  );
}
