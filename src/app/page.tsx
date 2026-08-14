import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck, Users } from "lucide-react";
import Hero from "@/components/Hero";
import QuickAccessCards from "@/components/QuickAccessCards";
import SpecialtyCard from "@/components/SpecialtyCard";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

const TRUST_POINTS = [
  {
    icon: Clock,
    title: "Reserva en menos de 2 minutos",
    description: "Elegís especialidad, profesional y horario sin llamar por teléfono.",
  },
  {
    icon: ShieldCheck,
    title: "Confirmación garantizada",
    description: "Recibís el resumen de tu turno por WhatsApp al instante.",
  },
  {
    icon: Users,
    title: "Todo el hospital, en un solo lugar",
    description: "Cada especialidad muestra exactamente cómo se pide el turno hoy.",
  },
];

export default async function HomePage() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { order: "asc" },
    take: 8,
  });

  return (
    <>
      <Hero />
      <QuickAccessCards />

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="grid gap-6 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                <point.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{point.title}</p>
                <p className="mt-1 text-sm text-muted">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Especialidades</h2>
            <p className="mt-1 text-muted">Encontrá cómo pedir turno en cada servicio.</p>
          </div>
          <Link
            href="/especialidades"
            className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {specialties.map((s) => (
            <SpecialtyCard key={s.id} specialty={s} />
          ))}
        </div>
        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/especialidades" className="text-sm font-semibold text-primary">
            Ver todas las especialidades →
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 pb-4">
        <div className="overflow-hidden rounded-3xl bg-primary text-white">
          <div className="grid gap-6 p-8 sm:grid-cols-2 sm:items-center sm:p-12">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">¿Dónde estamos?</h2>
              <p className="mt-2 text-white/85">{siteConfig.address}</p>
              <p className="mt-1 text-white/85">{siteConfig.name}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                Cómo llegar <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 ring-1 ring-white/20">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Central de turnos
              </p>
              <p className="mt-2 text-xl font-bold">{siteConfig.generalPhone}</p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/70">
                Guardia (24 hs)
              </p>
              <p className="mt-2 text-xl font-bold">{siteConfig.emergencyPhone}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
