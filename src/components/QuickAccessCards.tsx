import Link from "next/link";
import { CalendarPlus, ClipboardList, LayoutGrid, type LucideIcon } from "lucide-react";

const CARDS: { href: string; icon: LucideIcon; title: string; description: string }[] = [
  {
    href: "/turnos",
    icon: CalendarPlus,
    title: "Sacá turno",
    description: "Reservá online con nuestros profesionales: elegís día y horario.",
  },
  {
    href: "/paciente/mis-turnos",
    icon: ClipboardList,
    title: "Mis turnos",
    description: "Consultá, cancelá o revisá el historial de tus turnos.",
  },
  {
    href: "/especialidades",
    icon: LayoutGrid,
    title: "Especialidades",
    description: "Encontrá cómo pedir turno en cada servicio del hospital.",
  },
];

export default function QuickAccessCards() {
  return (
    <section className="mx-auto mt-12 max-w-6xl px-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <card.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-semibold text-foreground">{card.title}</p>
            <p className="mt-1 text-sm text-muted">{card.description}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-primary group-hover:underline">
              Ver más →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
