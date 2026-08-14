export function formatAppointmentDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatAppointmentTime(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

type AppointmentSummaryInput = {
  appointmentId: string;
  patientName: string;
  specialtyName: string;
  doctorName: string;
  date: Date;
};

export function buildWhatsAppAppointmentLink(input: AppointmentSummaryInput) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const hospitalName = process.env.NEXT_PUBLIC_HOSPITAL_NAME || "Hospital San Juan";

  const lines = [
    `¡Hola ${hospitalName}! 👋`,
    `Quiero confirmar mi turno #${input.appointmentId.slice(-6).toUpperCase()}`,
    "",
    `Especialidad: ${input.specialtyName}`,
    `Profesional: ${input.doctorName}`,
    `Fecha: ${formatAppointmentDate(input.date)}`,
    `Horario: ${formatAppointmentTime(input.date)} hs`,
    "",
    `Paciente: ${input.patientName}`,
  ];

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number}?text=${text}`;
}

export function buildWhatsAppContactLink(whatsappNumber: string, specialtyName: string) {
  const text = encodeURIComponent(
    `¡Hola! Quisiera consultar por un turno de ${specialtyName} en Hospital San Juan.`,
  );
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}
