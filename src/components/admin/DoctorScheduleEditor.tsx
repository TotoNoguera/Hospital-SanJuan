"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import AvailabilityEditor, { type Slot } from "./AvailabilityEditor";

export default function DoctorScheduleEditor({
  doctorId,
  doctorName,
  specialtyName,
  initial,
}: {
  doctorId: string;
  doctorName: string;
  specialtyName: string;
  initial: Slot[];
}) {
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{specialtyName}</p>
        <p className="font-semibold text-foreground">{doctorName}</p>
      </div>

      {saved && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> Horarios actualizados.
        </p>
      )}

      <AvailabilityEditor
        doctorId={doctorId}
        initial={initial}
        onSaved={() => setSaved(true)}
      />
    </div>
  );
}
