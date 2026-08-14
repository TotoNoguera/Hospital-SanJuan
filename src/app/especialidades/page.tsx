import SpecialtyDirectory from "@/components/SpecialtyDirectory";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Especialidades — Hospital San Juan",
};

export default async function EspecialidadesPage() {
  const specialties = await prisma.specialty.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Especialidades</h1>
        <p className="mt-2 text-muted">
          Buscá tu especialidad y enterate al instante cómo se pide el turno: algunas se reservan
          online con calendario, otras requieren orden médica o se coordinan por teléfono,
          WhatsApp o email.
        </p>
      </div>

      <div className="mt-8">
        <SpecialtyDirectory specialties={specialties} />
      </div>
    </div>
  );
}
