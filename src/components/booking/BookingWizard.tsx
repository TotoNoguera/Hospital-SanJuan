"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  ChevronLeft,
  Loader2,
  Mail,
  MessageCircle,
  User,
} from "lucide-react";
import { SpecialtyIcon } from "@/lib/icons";
import { buildWhatsAppAppointmentLink, formatAppointmentDate, formatAppointmentTime } from "@/lib/whatsapp";
import InlineAuthPanel from "./InlineAuthPanel";

type Doctor = { id: string; name: string; bio: string | null };
type OnlineSpecialty = { id: string; name: string; slug: string; icon: string; doctors: Doctor[] };
type Patient = { id: string; name: string };

type AppointmentResult = {
  id: string;
  date: string;
  patient: { name: string; email: string };
  doctor: { name: string };
  specialty: { name: string };
};

const STEPS = ["Especialidad", "Profesional", "Fecha y horario", "Confirmar"];

function nextDays(count: number) {
  const days: { dateStr: string; label: string; dayNumber: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(d);
    days.push({ dateStr, label: label.replace(".", ""), dayNumber: String(d.getDate()) });
  }
  return days;
}

export default function BookingWizard({
  specialties,
  initialSpecialtySlug,
  initialPatient,
}: {
  specialties: OnlineSpecialty[];
  initialSpecialtySlug?: string;
  initialPatient: Patient | null;
}) {
  const router = useRouter();
  const preselected = specialties.find((s) => s.slug === initialSpecialtySlug) ?? null;

  const [step, setStep] = useState(preselected ? 2 : 1);
  const [specialtyId, setSpecialtyId] = useState<string | null>(preselected?.id ?? null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [patient, setPatient] = useState<Patient | null>(initialPatient);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [result, setResult] = useState<AppointmentResult | null>(null);

  const days = useMemo(() => nextDays(21), []);

  const specialty = specialties.find((s) => s.id === specialtyId) ?? null;
  const doctor = specialty?.doctors.find((d) => d.id === doctorId) ?? null;

  const slotsRequestRef = useRef(0);

  async function loadSlots(forDoctorId: string, forDate: string) {
    const requestId = ++slotsRequestRef.current;
    setSlotsLoading(true);
    setTime(null);
    try {
      const res = await fetch(`/api/doctors/${forDoctorId}/slots?date=${forDate}`);
      const data = await res.json();
      if (slotsRequestRef.current === requestId) setSlots(data.slots ?? []);
    } finally {
      if (slotsRequestRef.current === requestId) setSlotsLoading(false);
    }
  }

  async function confirmAppointment() {
    if (!doctorId || !date || !time) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, date, time }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfirmError(data.error ?? "No pudimos confirmar el turno. Probá de nuevo.");
        return;
      }
      setResult(data.appointment as AppointmentResult);
    } catch {
      setConfirmError("No pudimos conectar con el servidor. Probá de nuevo.");
    } finally {
      setConfirming(false);
    }
  }

  if (result) {
    const appointmentDate = new Date(result.date);
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-2xl font-bold text-foreground">¡Turno confirmado!</h2>
        <p className="mt-1 text-muted">Te esperamos en Hospital San Juan.</p>

        <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-primary-light p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {result.specialty.name}
          </p>
          <p className="mt-1 font-semibold text-foreground">{result.doctor.name}</p>
          <p className="mt-2 text-lg font-bold text-primary">
            {formatAppointmentDate(appointmentDate)} · {formatAppointmentTime(appointmentDate)} hs
          </p>
          <p className="mt-2 text-sm text-muted">Turno #{result.id.slice(-6).toUpperCase()}</p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={buildWhatsAppAppointmentLink({
              appointmentId: result.id,
              patientName: result.patient.name,
              specialtyName: result.specialty.name,
              doctorName: result.doctor.name,
              date: appointmentDate,
            })}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-success px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" /> Confirmar por WhatsApp
          </a>
          <a
            href="/paciente/mis-turnos"
            className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            Ver mis turnos
          </a>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Mail className="h-3.5 w-3.5" /> También te enviamos un resumen a {result.patient.email}{" "}
          si el hospital tiene el email configurado.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ol className="flex items-center gap-2 text-xs font-semibold text-muted sm:text-sm">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  done
                    ? "bg-primary text-white"
                    : active
                      ? "bg-primary-light text-primary ring-2 ring-primary"
                      : "bg-primary-light/60 text-muted"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </span>
              <span className={`hidden sm:inline ${active ? "text-foreground" : ""}`}>{label}</span>
              {n < STEPS.length && <span className="h-px flex-1 bg-border" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {specialties.map((s) => {
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setSpecialtyId(s.id);
                    setDoctorId(null);
                    setDate(null);
                    setTime(null);
                    setStep(2);
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-primary hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <SpecialtyIcon name={s.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted">{s.doctors.length} profesional(es)</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && specialty && (
          <div>
            <BackButton onClick={() => setStep(1)} label="Cambiar especialidad" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {specialty.doctors.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDoctorId(d.id);
                    setDate(null);
                    setTime(null);
                    setStep(3);
                  }}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition hover:border-primary hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <User className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{d.name}</p>
                    {d.bio && <p className="mt-0.5 text-xs text-muted">{d.bio}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && doctor && (
          <div>
            <BackButton onClick={() => setStep(2)} label="Cambiar profesional" />

            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Calendar className="h-4 w-4 text-primary" /> Elegí un día
            </p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {days.map((d) => (
                <button
                  key={d.dateStr}
                  onClick={() => {
                    setDate(d.dateStr);
                    if (doctorId) loadSlots(doctorId, d.dateStr);
                  }}
                  className={`flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2.5 text-sm transition ${
                    date === d.dateStr
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-foreground hover:border-primary"
                  }`}
                >
                  <span className="text-[11px] uppercase opacity-80">{d.label}</span>
                  <span className="font-semibold">{d.dayNumber}</span>
                </button>
              ))}
            </div>

            {date && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-foreground">Horarios disponibles</p>
                {slotsLoading ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" /> Buscando horarios…
                  </div>
                ) : slots.length === 0 ? (
                  <p className="mt-3 text-sm text-muted">
                    No hay horarios disponibles ese día. Probá con otra fecha.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {slots.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTime(t);
                          setStep(4);
                        }}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          time === t
                            ? "border-primary bg-primary text-white"
                            : "border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 4 && specialty && doctor && date && time && (
          <div>
            <BackButton onClick={() => setStep(3)} label="Cambiar día u horario" />

            <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {specialty.name}
              </p>
              <p className="mt-1 font-semibold text-foreground">{doctor.name}</p>
              <p className="mt-2 text-lg font-bold text-foreground">
                {formatAppointmentDate(new Date(`${date}T${time}:00`))} · {time} hs
              </p>
            </div>

            {confirmError && (
              <p className="mt-4 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
                {confirmError}
              </p>
            )}

            {patient ? (
              <button
                onClick={confirmAppointment}
                disabled={confirming}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60 sm:w-auto"
              >
                {confirming && <Loader2 className="h-4 w-4 animate-spin" />} Confirmar turno
              </button>
            ) : (
              <div className="mt-6">
                <InlineAuthPanel
                  onAuthenticated={(p) => {
                    setPatient(p);
                    router.refresh();
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-primary"
    >
      <ChevronLeft className="h-4 w-4" /> {label}
    </button>
  );
}
