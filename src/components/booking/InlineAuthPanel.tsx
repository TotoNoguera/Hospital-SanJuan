"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type Patient = { id: string; name: string };

const inputClass =
  "w-full rounded-lg sm:rounded-xl border border-border bg-surface px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm outline-none ring-primary/30 focus:ring-2";
const labelClass = "mb-0.5 sm:mb-1 block text-xs font-semibold text-muted";

export default function InlineAuthPanel({
  onAuthenticated,
  title = "Necesitás iniciar sesión para confirmar",
  subtitle = "Tu selección se guarda, no perdés nada.",
}: {
  onAuthenticated: (patient: Patient) => void;
  title?: string;
  subtitle?: string;
}) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [name, setName] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  async function submit(url: string, body: Record<string, string>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ocurrió un error, probá de nuevo.");
        return;
      }
      onAuthenticated(data.patient as Patient);
    } catch {
      setError("No pudimos conectar con el servidor. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl sm:rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <p className="font-semibold text-sm sm:text-base text-foreground">{title}</p>
      <p className="mt-1 text-xs sm:text-sm text-muted">{subtitle}</p>

      <div className="mt-4 flex gap-1.5 sm:gap-2 rounded-full bg-primary-light p-1">
        <button
          onClick={() => setTab("login")}
          className={`flex-1 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition ${
            tab === "login" ? "bg-white text-primary shadow-sm" : "text-primary/70"
          }`}
        >
          Ingresar
        </button>
        <button
          onClick={() => setTab("register")}
          className={`flex-1 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition ${
            tab === "register" ? "bg-white text-primary shadow-sm" : "text-primary/70"
          }`}
        >
          Registrarme
        </button>
      </div>

      {error && (
        <p className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl bg-danger/10 px-3 py-2 text-xs sm:text-sm text-danger">{error}</p>
      )}

      {tab === "login" ? (
        <form
          className="mt-3 sm:mt-4 space-y-2 sm:space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit("/api/auth/patient/login", { email: loginEmail, password: loginPassword });
          }}
        >
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              className={inputClass}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Contraseña</label>
            <input
              type="password"
              required
              className={inputClass}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 sm:py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60 active:scale-95"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />} Ingresar
          </button>
        </form>
      ) : (
        <form
          className="mt-3 sm:mt-4 space-y-2 sm:space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit("/api/auth/patient/register", { name, dni, email, phone, password });
          }}
        >
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nombre y apellido</label>
              <input required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>DNI</label>
              <input required className={inputClass} value={dni} onChange={(e) => setDni(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input required className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 sm:py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60 active:scale-95"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />} Crear cuenta y continuar
          </button>
        </form>
      )}
    </div>
  );
}
