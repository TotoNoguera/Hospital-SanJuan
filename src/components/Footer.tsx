import Link from "next/link";
import { Clock, MapPin, Phone, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-primary-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-white/70">{siteConfig.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">Ubicación</p>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/80">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {siteConfig.address}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">Contacto</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/80">
            <Phone className="h-4 w-4 shrink-0" /> {siteConfig.generalPhone}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
            <ShieldCheck className="h-4 w-4 shrink-0" /> Guardia: {siteConfig.emergencyPhone}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">Horarios</p>
          {siteConfig.hours.map((h) => (
            <p key={h.label} className="mt-3 flex items-start gap-2 text-sm text-white/80">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {h.label}: {h.value}
              </span>
            </p>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        <Link href="/admin/login" className="hover:text-white/80">
          Acceso para personal del hospital
        </Link>
      </div>
    </footer>
  );
}
