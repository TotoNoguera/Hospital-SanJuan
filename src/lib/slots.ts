import { prisma } from "./prisma";

export function generateSlotTimes(startTime: string, endTime: string, slotMinutes: number) {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  const slots: string[] = [];
  for (let m = start; m + slotMinutes <= end; m += slotMinutes) {
    const h = Math.floor(m / 60).toString().padStart(2, "0");
    const min = (m % 60).toString().padStart(2, "0");
    slots.push(`${h}:${min}`);
  }
  return slots;
}

function localTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function slotDateTime(dateStr: string, time: string) {
  return new Date(`${dateStr}T${time}:00`);
}

/** dateStr en formato YYYY-MM-DD. Devuelve los horarios "HH:MM" libres para ese profesional. */
export async function getAvailableSlots(doctorId: string, dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];
  const weekday = date.getDay();

  const availability = await prisma.availability.findMany({
    where: { doctorId, weekday },
  });
  if (availability.length === 0) return [];

  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59`);

  const existing = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: { not: "CANCELLED" },
      date: { gte: dayStart, lte: dayEnd },
    },
    select: { date: true },
  });
  const bookedTimes = new Set(existing.map((a) => localTime(a.date)));

  const allSlots = availability.flatMap((a) =>
    generateSlotTimes(a.startTime, a.endTime, a.slotMinutes),
  );
  const now = new Date();
  const isToday = dayStart.toDateString() === now.toDateString();

  return Array.from(new Set(allSlots))
    .filter((time) => !bookedTimes.has(time))
    .filter((time) => !isToday || slotDateTime(dateStr, time) > now)
    .sort();
}
