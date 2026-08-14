"use client";

import { useState } from "react";
import { CalendarX2, Loader2 } from "lucide-react";
import { formatAppointmentDate, formatAppointmentTime } from "@/lib/whatsapp";

type Status = "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

type Appointment = {
  id: string;
  date: string;
  status: Status;
  doctorName: string;
  specialtyName: string;
};

const STATUS_LABEL: Record<Status, string> = {
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Atendido",
  NO_SHOW: "No asistió",
};

const STATUS_CLASS: Record<Status, string> = {
  CONFIRMED: "bg-primary-light text-primary",
  CANCELLED: "bg-danger/10 text-danger",
  COMPLETED: "bg-success/10 text-success",
  NO_SHOW: "bg-warning/10 text-warning",
};

export default function AppointmentList({
  appointments: initial,
  now,
}: {
  appointments: Appointment[];
  /** ISO timestamp calculado en el servidor, para no llamar a Date.now() durante el render. */
  now: string;
}) {
  const [appointments, setAppointments] = useState(initial);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const nowMs = new Date(now).getTime();
  const upcoming = appointments.filter(
    (a) => new Date(a.date).getTime() >= nowMs && a.status === "CONFIRMED",
  );
  const rest = appointments.filter((a) => !upcoming.includes(a));

  async function cancel(id: string) {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" as Status } : a)),
        );
      }
    } finally {
      setCancellingId(null);
    }
  }

  if (appointments.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
        Todavía no reservaste ningún turno online.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <Section title="Próximos" items={upcoming} onCancel={cancel} cancellingId={cancellingId} nowMs={nowMs} />
      <Section title="Historial" items={rest} onCancel={cancel} cancellingId={cancellingId} nowMs={nowMs} />
    </div>
  );
}

function Section({
  title,
  items,
  onCancel,
  cancellingId,
  nowMs,
}: {
  title: string;
  items: Appointment[];
  onCancel: (id: string) => void;
  cancellingId: string | null;
  nowMs: number;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-muted">{title}</p>
      <div className="mt-3 space-y-3">
        {items.map((a) => {
          const date = new Date(a.date);
          const canCancel = a.status === "CONFIRMED" && date.getTime() >= nowMs;
          return (
            <div
              key={a.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-foreground">{a.specialtyName}</p>
                <p className="text-sm text-muted">{a.doctorName}</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatAppointmentDate(date)} · {formatAppointmentTime(date)} hs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>
                {canCancel && (
                  <button
                    onClick={() => onCancel(a.id)}
                    disabled={cancellingId === a.id}
                    className="flex items-center gap-1.5 rounded-full border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-60"
                  >
                    {cancellingId === a.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CalendarX2 className="h-3.5 w-3.5" />
                    )}
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
