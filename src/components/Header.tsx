import { getPatientSession } from "@/lib/auth-patient";
import { prisma } from "@/lib/prisma";
import SiteHeader from "./SiteHeader";

export default async function Header() {
  const session = await getPatientSession();
  let patientName: string | null = null;

  if (session) {
    const patient = await prisma.patient.findUnique({
      where: { id: session.patientId },
      select: { name: true },
    });
    patientName = patient?.name ?? null;
  }

  return <SiteHeader patientName={patientName} />;
}
