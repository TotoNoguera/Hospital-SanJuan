"use client";

import InlineAuthPanel from "@/components/booking/InlineAuthPanel";
import { useRouter } from "next/navigation";

export default function TurnosAuthPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Reservá tu turno
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted">
            Iniciá sesión o registrate para continuar
          </p>
        </div>

        {/* Auth Panel */}
        <InlineAuthPanel
          onAuthenticated={() => {
            // Después de autenticarse, redirigir al wizard y refrescar para que el servidor valide la sesión
            router.refresh();
            router.push("/turnos");
          }}
          title="Continuá tu reserva"
          subtitle="Iniciá sesión con tu cuenta o crea una nueva."
        />

        {/* Info adicional en mobile */}
        <div className="mt-6 rounded-xl bg-primary-light/40 p-4 text-center sm:hidden">
          <p className="text-xs text-muted">
            ¿Primera vez? Te guiaremos paso a paso para elegir tu turno.
          </p>
        </div>
      </div>
    </div>
  );
}
