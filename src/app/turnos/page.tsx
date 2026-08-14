import BookingWizard from "@/components/booking/BookingWizard";
import { prisma } from "@/lib/prisma";
import { getPatientSession } from "@/lib/auth-patient";

export const metadata = { title: "Reservar turno — Hospital San Juan" };

export default async function TurnosPage({
  searchParams,
}: {
  searchParams: Promise<{ especialidad?: string }>;
}) {
  const { especialidad } = await searchParams;

  const specialties = await prisma.specialty.findMany({
    where: { bookingMode: "ONLINE" },
    orderBy: { order: "asc" },
    include: { doctors: { where: { active: true }, orderBy: { name: "asc" } } },
  });

  const session = await getPatientSession();
  let patient: { id: string; name: string } | null = null;
  if (session) {
    const p = await prisma.patient.findUnique({
      where: { id: session.patientId },
      select: { id: true, name: true },
    });
    if (p) patient = p;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Reservá tu turno</h1>
      <p className="mt-2 text-muted">
        Elegí especialidad, profesional, día y horario. Confirmás en menos de 2 minutos.
      </p>

      <div className="mt-10">
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
