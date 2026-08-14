"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

export type Slot = { weekday: number; startTime: string; endTime: string; slotMinutes: number };

const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function AvailabilityEditor({
  doctorId,
  initial,
  onClose,
  onSaved,
}: {
  doctorId: string;
  initial: Slot[];
  /** Si se pasa, se muestra un botón "Cerrar" (uso típico: colapsar un editor inline). */
  onClose?: () => void;
  /** Se llama tras guardar con éxito, además de onClose. */
  onSaved?: () => void;
}) {
  const [slots, setSlots] = useState<Slot[]>(
    initial.length ? initial : [{ weekday: 1, startTime: "08:00", endTime: "12:00", slotMinutes: 20 }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSlot(index: number, patch: Partial<Slot>) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/doctors/${doctorId}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: slots }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "No pudimos guardar los horarios.");
        return;
      }
      onSaved?.();
      onClose?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 space-y-3 rounded-2xl bg-primary-light/40 p-4">
      {error && <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
      {slots.map((s, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select
            value={s.weekday}
            onChange={(e) => updateSlot(i, { weekday: Number(e.target.value) })}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm"
          >
            {WEEKDAYS.map((w, wi) => (
              <option key={wi} value={wi}>
                {w}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={s.startTime}
            onChange={(e) => updateSlot(i, { startTime: e.target.value })}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm"
          />
          <span className="text-xs text-muted">a</span>
          <input
            type="time"
            value={s.endTime}
            onChange={(e) => updateSlot(i, { endTime: e.target.value })}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            min={5}
            step={5}
            value={s.slotMinutes}
            onChange={(e) => updateSlot(i, { slotMinutes: Number(e.target.value) })}
            className="w-20 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm"
          />
          <span className="text-xs text-muted">min/turno</span>
          <button
            onClick={() => setSlots((prev) => prev.filter((_, idx) => idx !== i))}
            className="ml-auto rounded-full p-1.5 text-muted hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          setSlots((prev) => [...prev, { weekday: 1, startTime: "08:00", endTime: "12:00", slotMinutes: 20 }])
        }
        className="flex items-center gap-1.5 text-sm font-semibold text-primary"
      >
        <Plus className="h-4 w-4" /> Agregar horario
      </button>
      <div className="flex gap-2 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar horarios
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
