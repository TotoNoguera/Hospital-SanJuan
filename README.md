# Hospital San Juan — Sistema de turnos

Sitio completo para el Hospital San Juan (La Plata): landing institucional, reserva de turnos
online, cuentas de pacientes y panel de administración con roles para el staff.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma 7 + SQLite (`dev.db`), driver adapter `better-sqlite3`
- Sesiones con JWT firmado (`jose`) en cookies httpOnly — dos identidades independientes
  (paciente / staff)
- `lucide-react` para íconos

## Primeros pasos

```bash
npm install
npx prisma migrate dev   # crea dev.db y aplica el schema
npm run db:seed          # carga especialidades, profesionales y usuarios de ejemplo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Configuración (`.env`)

Copiá `.env.example` a `.env` y completá:

- `SESSION_SECRET`: cadena aleatoria larga (firma las cookies de sesión).
- `NEXT_PUBLIC_HOSPITAL_NAME` / `NEXT_PUBLIC_WHATSAPP_NUMBER`: nombre del hospital y número de
  la Central de Turnos (para el botón de confirmación por WhatsApp).
- `SMTP_*` (opcional): si se completan, además de WhatsApp se envía un email de confirmación al
  reservar un turno online. Si se dejan vacíos, el sistema omite el email sin romper el flujo.

Los datos de dirección/teléfonos/horarios se editan en
[`src/lib/site-config.ts`](src/lib/site-config.ts).

## Credenciales de prueba (creadas por el seed)

| Rol | Email | Contraseña |
| --- | --- | --- |
| Administración | admin@hospitalsanjuan.example | Admin123! |
| Secretaría | secretaria@hospitalsanjuan.example | Secretaria123! |
| Profesional (Dra. Marina Ibáñez) | doctora@hospitalsanjuan.example | Doctora123! |
| Paciente demo | paciente@hospitalsanjuan.example | Paciente123! |

Cambiá estas contraseñas antes de usar el sistema con datos reales.

## Cómo funciona

### Especialidades: dos modos de reserva

- **`ONLINE`**: la especialidad tiene profesionales con horarios cargados; el paciente reserva
  un turno real con calendario en `/turnos`.
- **`ASSISTED`**: refleja cómo se saca el turno hoy en el hospital (la mayoría de las
  especialidades reales del hospital: requieren orden médica, son presenciales, o se coordinan
  por WhatsApp/email). La ficha en `/especialidades` muestra esa info tal cual y ofrece el botón
  de acción que corresponda (llamar, WhatsApp, email) — no se inventa un calendario donde el
  hospital no lo ofrece.

Todo esto se administra desde `/admin/especialidades` sin tocar código.

### Reserva de turnos (paciente)

`/turnos` → especialidad (solo `ONLINE`) → profesional → fecha/horario → confirmación (pide
login/registro si hace falta, sin perder la selección) → resumen + botón de confirmación por
WhatsApp. `/paciente/mis-turnos` permite cancelar turnos futuros.

### Panel de administración (`/admin`)

Login separado del de pacientes, con **roles**:

- **ADMIN**: todo, incluyendo alta de cuentas de staff (`/admin/usuarios`).
- **SECRETARY**: especialidades, profesionales, horarios y turnos — no gestiona usuarios.
- **DOCTOR**: solo ve y gestiona su propia agenda de turnos.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — levanta el build de producción
- `npm run db:seed` — repuebla la base con datos de ejemplo (borra los datos actuales)

## Mejoras futuras sugeridas

- Excepciones puntuales de disponibilidad (feriados, licencias) además del horario semanal fijo.
- Recordatorio automático (email/WhatsApp) el día previo al turno.
- Historial clínico o adjuntos de estudios en el portal del paciente.

## Despliegue

Pensado para correr local o en un servidor propio tal cual (SQLite es un archivo local). Para
desplegar en Vercel u otra plataforma serverless, cambiar `DATABASE_URL` a una base Postgres
(ej. [Neon](https://neon.tech)) — Prisma ya está listo para ese cambio.
