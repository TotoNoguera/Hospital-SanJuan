"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Option = { id: string; name: string };

export default function AppointmentFilters({
  specialties,
  doctors,
}: {
  specialties: Option[];
  doctors: Option[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [date, setDate] = useState(searchParams.get("date") ?? "");
  const [specialtyId, setSpecialtyId] = useState(searchParams.get("specialtyId") ?? "");
  const [doctorId, setDoctorId] = useState(searchParams.get("doctorId") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (specialtyId) params.set("specialtyId", specialtyId);
    if (doctorId) params.set("doctorId", doctorId);
    if (status) params.set("status", status);
    router.push(`/admin/turnos?${params.toString()}`);
  }

  function clear() {
    setDate("");
    setSpecialtyId("");
    setDoctorId("");
    setStatus("");
    router.push("/admin/turnos");
  }

  const selectClass =
    "rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Fecha</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={selectClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Especialidad</label>
        <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} className={selectClass}>
          <option value="">Todas</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Profesional</label>
        <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={selectClass}>
          <option value="">Todos</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">Estado</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="">Todos</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="COMPLETED">Atendido</option>
          <option value="NO_SHOW">No asistió</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={apply} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
          Filtrar
        </button>
        <button
          onClick={clear}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
