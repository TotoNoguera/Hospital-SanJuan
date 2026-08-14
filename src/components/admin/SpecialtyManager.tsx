"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { SpecialtyIcon } from "@/lib/icons";
import SpecialtyForm, { type SpecialtyFormValue } from "./SpecialtyForm";

export default function SpecialtyManager({
  specialties: initial,
}: {
  specialties: SpecialtyFormValue[];
}) {
  const [specialties, setSpecialties] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/specialties/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? "No pudimos eliminar la especialidad.");
        return;
      }
      setSpecialties((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{specialties.length} especialidades cargadas</p>
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Nueva especialidad
        </button>
      </div>

      {creating && (
        <div className="mt-4">
          <SpecialtyForm
            initial={null}
            onSaved={(s) => {
              setSpecialties((prev) => [...prev, s]);
              setCreating(false);
            }}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {deleteError && (
        <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{deleteError}</p>
      )}

      <div className="mt-4 space-y-3">
        {specialties.map((s) => {
          if (editingId === s.id) {
            return (
              <SpecialtyForm
                key={s.id}
                initial={s}
                onSaved={(updated) => {
                  setSpecialties((prev) =>
                    prev.map((sp) => (sp.id === s.id ? { ...sp, ...updated } : sp)),
                  );
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            );
          }
          return (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <SpecialtyIcon name={s.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted">
                    {s.bookingMode === "ONLINE" ? "Reserva online" : s.days || "Presencial / a coordinar"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingId(s.id ?? null)}
                  className="rounded-full border border-border p-2 text-muted transition hover:border-primary hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => s.id && handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="rounded-full border border-border p-2 text-muted transition hover:border-danger hover:text-danger disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
