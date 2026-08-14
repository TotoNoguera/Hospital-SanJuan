"use client";

import { type FormEvent, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { StaffRole } from "@/lib/auth-staff";

type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  doctorName: string | null;
};
type DoctorOption = { id: string; name: string; specialtyName: string };

const ROLE_LABEL: Record<StaffRole, string> = {
  ADMIN: "Administración",
  SECRETARY: "Secretaría",
  DOCTOR: "Profesional",
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2";
const labelClass = "mb-1 block text-xs font-semibold text-muted";

export default function StaffManager({
  currentStaffId,
  staff: initial,
  doctors,
}: {
  currentStaffId: string;
  staff: StaffRow[];
  doctors: DoctorOption[];
}) {
  const [staff, setStaff] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("SECRETARY");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createStaff(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/staff-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          doctorId: role === "DOCTOR" ? doctorId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos crear la cuenta.");
        return;
      }
      const doctor = doctors.find((d) => d.id === doctorId);
      setStaff((prev) => [
        ...prev,
        { ...data.staff, doctorName: role === "DOCTOR" ? (doctor?.name ?? null) : null },
      ]);
      setName("");
      setEmail("");
      setPassword("");
      setCreating(false);
    } finally {
      setSaving(false);
    }
  }

  async function removeStaff(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/staff-users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos eliminar la cuenta.");
        return;
      }
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{staff.length} cuentas de staff</p>
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Nueva cuenta
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {creating && (
        <form onSubmit={createStaff} className="mt-4 space-y-3 rounded-2xl border border-border bg-surface p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nombre</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className={inputClass}
              >
                <option value="SECRETARY">Secretaría</option>
                <option value="ADMIN">Administración</option>
                <option value="DOCTOR">Profesional</option>
              </select>
            </div>
          </div>
          {role === "DOCTOR" && (
            <div>
              <label className={labelClass}>Profesional vinculado</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className={inputClass}>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialtyName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <button
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Crear cuenta
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">
                  {s.name}
                  {s.doctorName ? ` (${s.doctorName})` : ""}
                </td>
                <td className="px-4 py-3 text-muted">{s.email}</td>
                <td className="px-4 py-3 text-foreground">{ROLE_LABEL[s.role]}</td>
                <td className="px-4 py-3 text-right">
                  {s.id !== currentStaffId && (
                    <button
                      onClick={() => removeStaff(s.id)}
                      disabled={deletingId === s.id}
                      className="rounded-full border border-border p-2 text-muted transition hover:border-danger hover:text-danger disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
