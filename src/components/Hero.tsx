import Link from "next/link";
import { CalendarPlus, Search } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            La Plata · Buenos Aires
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Tu turno, en minutos y sin filas.
          </h1>
          <p className="mt-4 max-w-lg text-white/85">
            Reservá turno online con nuestros profesionales o encontrá al instante cómo pedirlo
            en cada especialidad del hospital.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/turnos"
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-dark/30 transition hover:bg-accent-dark"
            >
              <CalendarPlus className="h-4 w-4" /> Sacar turno online
            </Link>
            <Link
              href="/especialidades"
              className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              <Search className="h-4 w-4" /> Ver especialidades
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-sm">
            <div className="rounded-2xl bg-white p-6 text-foreground shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Próximo turno
              </p>
              <p className="mt-2 text-lg font-semibold">Clínica Médica</p>
              <p className="text-sm text-muted">Dra. Marina Ibáñez</p>
              <p className="mt-4 text-2xl font-bold text-primary">Lun 18 · 09:20 hs</p>
              <div className="mt-4 inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                Confirmado
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
