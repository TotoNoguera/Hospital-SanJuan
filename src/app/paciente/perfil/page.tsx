import { redirect } from "next/navigation";
import { IdCard, Mail, Phone, User } from "lucide-react";
import { getPatientSession } from "@/lib/auth-patient";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Mi perfil — Hospital San Juan" };

export default async function PerfilPage() {
  const session = await getPatientSession();
  if (!session) redirect("/paciente/login?next=/paciente/perfil");

  const patient = await prisma.patient.findUnique({ where: { id: session.patientId } });
  if (!patient) redirect("/paciente/login");

  const fields = [
    { icon: User, label: "Nombre", value: patient.name },
    { icon: IdCard, label: "DNI", value: patient.dni },
    { icon: Mail, label: "Email", value: patient.email },
    { icon: Phone, label: "Teléfono", value: patient.phone },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground">Mi perfil</h1>
      <div className="mt-8 space-y-3">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
              <f.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{f.label}</p>
              <p className="text-sm font-medium text-foreground">{f.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
