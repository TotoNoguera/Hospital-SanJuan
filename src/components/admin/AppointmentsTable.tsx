"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formatAppointmentDate, formatAppointmentTime } from "@/lib/whatsapp";

type Status = "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export type AdminAppointmentRow = {
  id: string;
  date: string;
  status: Status;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  specialtyName: string;
};

const STATUS_OPTIONS: Status[] = ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"];
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

export default function AppointmentsTable({
  appointments: initial,
}: {
  appointments: AdminAppointmentRow[];
}) {
  const [appointments, setAppointments] = useState(initial);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: Status) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (appointments.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
        No hay turnos para mostrar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <th className="px-4 py-3">Fecha y hora</th>
            <th className="px-4 py-3">Paciente</th>
            <th className="px-4 py-3">Especialidad</th>
            <th className="px-4 py-3">Profesional</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => {
            const date = new Date(a.date);
            return (
              <tr key={a.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{formatAppointmentDate(date)}</p>
                  <p className="text-muted">{formatAppointmentTime(date)} hs</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{a.patientName}</p>
                  <p className="text-muted">{a.patientPhone}</p>
                </td>
                <td className="px-4 py-3 text-foreground">{a.specialtyName}</td>
                <td className="px-4 py-3 text-foreground">{a.doctorName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={a.status}
                      disabled={updatingId === a.id}
                      onChange={(e) => updateStatus(a.id, e.target.value as Status)}
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${STATUS_CLASS[a.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                    {updatingId === a.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
