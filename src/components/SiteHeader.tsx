"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarPlus, HeartPulse, Menu, User, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/turnos", label: "Sacar turno" },
];

export default function SiteHeader({ patientName }: { patientName: string | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/patient/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="text-lg leading-tight">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {patientName ? (
            <>
              <Link
                href="/paciente/mis-turnos"
                className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition hover:text-primary"
              >
                <User className="h-4 w-4" /> {patientName.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-muted transition hover:text-danger"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/paciente/login"
              className="text-sm font-medium text-foreground/80 transition hover:text-primary"
            >
              Ingresar
            </Link>
          )}
          <Link
            href="/turnos"
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark"
          >
            <CalendarPlus className="h-4 w-4" /> Sacá tu turno
          </Link>
        </div>

        <button
          className="text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-foreground/80"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-border" />
            {patientName ? (
              <>
                <Link
                  href="/paciente/mis-turnos"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-foreground/80"
                >
                  Mis turnos ({patientName.split(" ")[0]})
                </Link>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-danger">
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/paciente/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-foreground/80"
              >
                Ingresar / Registrarme
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
