"use client";

import { type FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { SPECIALTY_ICON_NAMES } from "@/lib/icons";

export type SpecialtyFormValue = {
  id?: string;
  name: string;
  slug?: string;
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

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2";
const labelClass = "mb-1 block text-xs font-semibold text-muted";

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function SpecialtyForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: Partial<SpecialtyFormValue> | null;
  onSaved: (specialty: SpecialtyFormValue) => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initial?.id);
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? SPECIALTY_ICON_NAMES[0]);
  const [bookingMode, setBookingMode] = useState<"ONLINE" | "ASSISTED">(
    initial?.bookingMode ?? "ASSISTED",
  );
  const [howToBook, setHowToBook] = useState(initial?.howToBook ?? "");
  const [days, setDays] = useState(initial?.days ?? "");
  const [hours, setHours] = useState(initial?.hours ?? "");
  const [requiresMedicalOrder, setRequiresMedicalOrder] = useState(
    initial?.requiresMedicalOrder ?? false,
  );
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? "");
  const [contactExtension, setContactExtension] = useState(initial?.contactExtension ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? "");
  const [contactWhatsapp, setContactWhatsapp] = useState(initial?.contactWhatsapp ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      name,
      icon,
      bookingMode,
      howToBook: howToBook || null,
      days: days || null,
      hours: hours || null,
      requiresMedicalOrder,
      contactPhone: contactPhone || null,
      contactExtension: contactExtension || null,
      contactEmail: contactEmail || null,
      contactWhatsapp: contactWhatsapp || null,
      ...(!isEdit && { slug: slugify(name) }),
    };
    try {
      const res = await fetch(isEdit ? `/api/specialties/${initial!.id}` : "/api/specialties", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos guardar los cambios.");
        return;
      }
      onSaved(data.specialty);
    } catch {
      setError("No pudimos conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre</label>
          <input required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Ícono</label>
          <select className={inputClass} value={icon} onChange={(e) => setIcon(e.target.value)}>
            {SPECIALTY_ICON_NAMES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Modo de reserva</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBookingMode("ASSISTED")}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              bookingMode === "ASSISTED"
                ? "border-primary bg-primary-light text-primary"
                : "border-border text-muted"
            }`}
          >
            Presencial / orden médica
          </button>
          <button
            type="button"
            onClick={() => setBookingMode("ONLINE")}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              bookingMode === "ONLINE"
                ? "border-primary bg-primary-light text-primary"
                : "border-border text-muted"
            }`}
          >
            Reserva online
          </button>
        </div>
        {bookingMode === "ONLINE" && (
          <p className="mt-2 text-xs text-muted">
            Los profesionales y horarios se cargan en la sección &ldquo;Profesionales&rdquo;.
          </p>
        )}
      </div>

      {bookingMode === "ASSISTED" && (
        <>
          <div>
            <label className={labelClass}>Cómo se saca el turno</label>
            <textarea
              className={inputClass}
              rows={2}
              value={howToBook}
              onChange={(e) => setHowToBook(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Días</label>
              <input
                className={inputClass}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="Lunes a viernes"
              />
            </div>
            <div>
              <label className={labelClass}>Horario</label>
              <input
                className={inputClass}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="8:00 a 12:00 hs"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Teléfono de contacto</label>
              <input
                className={inputClass}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Interno</label>
              <input
                className={inputClass}
                value={contactExtension}
                onChange={(e) => setContactExtension(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                className={inputClass}
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp (con código de país, sin +)</label>
              <input
                className={inputClass}
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="5492211234567"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={requiresMedicalOrder}
              onChange={(e) => setRequiresMedicalOrder(e.target.checked)}
            />
            Requiere orden médica
          </label>
        </>
      )}

      <div className="flex gap-2">
        <button
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
