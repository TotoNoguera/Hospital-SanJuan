"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Calendar, Plus, Trash2, UserRound } from "lucide-react";
import AvailabilityEditor, { type Slot } from "./AvailabilityEditor";

type OnlineSpecialtyOption = { id: string; name: string };
type Doctor = {
  id: string;
  name: string;
  bio: string | null;
  active: boolean;
  specialtyId: string;
  specialtyName: string;
};

export default function DoctorManager({
  doctors: initial,
  specialties,
}: {
  doctors: Doctor[];
  specialties: OnlineSpecialtyOption[];
}) {
  const [doctors, setDoctors] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newSpecialtyId, setNewSpecialtyId] = useState(specialties[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createDoctor(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, bio: newBio, specialtyId: newSpecialtyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos crear el profesional.");
        return;
      }
      const specialty = specialties.find((s) => s.id === newSpecialtyId);
      setDoctors((prev) => [...prev, { ...data.doctor, specialtyName: specialty?.name ?? "" }]);
      setNewName("");
      setNewBio("");
      setCreating(false);
    } finally {
      setSaving(false);
    }
  }

  async function removeDoctor(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos eliminar al profesional.");
        return;
      }
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (specialties.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
        Primero creá una especialidad con reserva online.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{doctors.length} profesionales cargados</p>
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Nuevo profesional
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {creating && (
        <form onSubmit={createDoctor} className="mt-4 space-y-3 rounded-2xl border border-border bg-surface p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Nombre</label>
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted">Especialidad</label>
              <select
                value={newSpecialtyId}
                onChange={(e) => setNewSpecialtyId(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm"
              >
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Descripción breve</label>
            <input
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              disabled={saving}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Guardar
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

      <div className="mt-4 space-y-3">
        {doctors.map((d) => (
          <div key={d.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{d.name}</p>
                  <p className="text-xs text-muted">
                    {d.specialtyName}
                    {d.bio ? ` · ${d.bio}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingAvailabilityId(editingAvailabilityId === d.id ? null : d.id)}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-primary hover:text-primary"
                >
                  <Calendar className="h-3.5 w-3.5" /> Horarios
                </button>
                <button
                  onClick={() => removeDoctor(d.id)}
                  disabled={deletingId === d.id}
                  className="rounded-full border border-border p-2 text-muted transition hover:border-danger hover:text-danger disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {editingAvailabilityId === d.id && (
              <DoctorAvailability doctorId={d.id} onClose={() => setEditingAvailabilityId(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DoctorAvailability({ doctorId, onClose }: { doctorId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<Slot[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/doctors/${doctorId}/availability`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setInitial(data.availability ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  if (loading) return <p className="mt-3 text-sm text-muted">Cargando horarios…</p>;
  return <AvailabilityEditor doctorId={doctorId} initial={initial} onClose={onClose} />;
}
