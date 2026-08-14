"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  LayoutGrid,
  LogOut,
  Stethoscope,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { StaffRole } from "@/lib/auth-staff";

const LINKS: { href: string; label: string; icon: LucideIcon; roles: StaffRole[] }[] = [
  { href: "/admin", label: "Panel", icon: LayoutGrid, roles: ["ADMIN", "SECRETARY", "DOCTOR"] },
  { href: "/admin/turnos", label: "Turnos", icon: CalendarDays, roles: ["ADMIN", "SECRETARY", "DOCTOR"] },
  { href: "/admin/mis-horarios", label: "Mis horarios", icon: CalendarClock, roles: ["DOCTOR"] },
  { href: "/admin/especialidades", label: "Especialidades", icon: Stethoscope, roles: ["ADMIN", "SECRETARY"] },
  { href: "/admin/profesionales", label: "Profesionales", icon: Users, roles: ["ADMIN", "SECRETARY"] },
  { href: "/admin/usuarios", label: "Usuarios", icon: UserCog, roles: ["ADMIN"] },
];

const ROLE_LABEL: Record<StaffRole, string> = {
  ADMIN: "Administración",
  SECRETARY: "Secretaría",
  DOCTOR: "Profesional",
};

export default function AdminNav({ name, role }: { name: string; role: StaffRole }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/staff/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const links = LINKS.filter((l) => l.roles.includes(role));

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {ROLE_LABEL[role]}
          </p>
          <p className="font-semibold text-foreground">{name}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-primary-light hover:text-primary"
                }`}
              >
                <l.icon className="h-4 w-4" /> {l.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-danger transition hover:bg-danger/10"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
