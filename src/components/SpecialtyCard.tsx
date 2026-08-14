import Link from "next/link";
import { CalendarCheck, Mail, Phone, ShieldAlert } from "lucide-react";
import { SpecialtyIcon } from "@/lib/icons";
import { buildWhatsAppContactLink } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/site-config";

export type SpecialtyCardData = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  bookingMode: "ONLINE" | "ASSISTED";
  howToBook: string | null;
  days: string | null;
  hours: string | null;
  requiresMedicalOrder: boolean;
  contactPhone: string | null;
  contactExtension: string | null;
  contactEmail: string | null;
  contactWhatsapp: string | null;
};

export default function SpecialtyCard({ specialty }: { specialty: SpecialtyCardData }) {
  const phone = specialty.contactPhone ?? siteConfig.generalPhone;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
          <SpecialtyIcon name={specialty.icon} className="h-5 w-5" />
        </span>
        {specialty.bookingMode === "ONLINE" ? (
          <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
            Online
          </span>
        ) : specialty.requiresMedicalOrder ? (
          <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
            <ShieldAlert className="h-3 w-3" /> Orden médica
          </span>
        ) : null}
      </div>

      <p className="mt-4 font-semibold text-foreground">{specialty.name}</p>

      {specialty.bookingMode === "ASSISTED" ? (
        <div className="mt-2 space-y-1 text-sm text-muted">
          <p>{specialty.days ?? "Consultar disponibilidad"}</p>
          {specialty.hours && <p>{specialty.hours}</p>}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">Elegís profesional, día y horario en el momento.</p>
      )}

      <div className="mt-4 flex-1" />

      {specialty.bookingMode === "ONLINE" ? (
        <Link
          href={`/turnos?especialidad=${specialty.slug}`}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          <CalendarCheck className="h-4 w-4" /> Reservar turno online
        </Link>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            <Phone className="h-3.5 w-3.5" />
            {phone}
            {specialty.contactExtension ? ` int. ${specialty.contactExtension}` : ""}
          </a>
          {specialty.contactWhatsapp && (
            <a
              href={buildWhatsAppContactLink(specialty.contactWhatsapp, specialty.name)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:border-success hover:text-success"
            >
              WhatsApp
            </a>
          )}
          {specialty.contactEmail && (
            <a
              href={`mailto:${specialty.contactEmail}?subject=${encodeURIComponent(
                `Turno de ${specialty.name}`,
              )}`}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          )}
        </div>
      )}

      {specialty.howToBook && (
        <p className="mt-3 text-xs leading-relaxed text-muted">{specialty.howToBook}</p>
      )}
    </div>
  );
}
