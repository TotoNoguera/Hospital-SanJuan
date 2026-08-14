import nodemailer from "nodemailer";

type AppointmentEmailInput = {
  to: string;
  patientName: string;
  specialtyName: string;
  doctorName: string;
  dateLabel: string;
  timeLabel: string;
};

/**
 * Envío de confirmación por email, solo si hay SMTP configurado en .env.
 * Si no hay configuración, se omite sin romper el flujo de reserva (queda
 * la confirmación por WhatsApp como principal).
 */
export async function sendAppointmentConfirmationEmail(input: AppointmentEmailInput) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log("[mailer] SMTP no configurado, se omite el email de confirmación.");
    return { sent: false as const };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: input.to,
    subject: `Turno confirmado: ${input.specialtyName}`,
    text: [
      `Hola ${input.patientName},`,
      "",
      `Tu turno quedó confirmado:`,
      `Especialidad: ${input.specialtyName}`,
      `Profesional: ${input.doctorName}`,
      `Fecha: ${input.dateLabel}`,
      `Horario: ${input.timeLabel} hs`,
      "",
      "Hospital San Juan",
    ].join("\n"),
  });

  return { sent: true as const };
}
