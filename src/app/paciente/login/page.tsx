"use client";

import { useRouter, useSearchParams } from "next/navigation";
import InlineAuthPanel from "@/components/booking/InlineAuthPanel";

export default function PacienteLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/paciente/mis-turnos";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16">
      <h1 className="text-2xl font-bold text-foreground">Ingresá a tu cuenta</h1>
      <p className="mt-1 text-center text-sm text-muted">
        Iniciá sesión o registrate para gestionar tus turnos.
      </p>
      <div className="mt-8 w-full">
        <InlineAuthPanel
          title="Bienvenido/a"
          subtitle="Ingresá con tu cuenta o creá una nueva."
          onAuthenticated={() => {
            router.push(next);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
