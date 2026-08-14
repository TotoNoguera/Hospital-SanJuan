import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffRole } from "@/lib/auth-staff";

export async function GET() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { order: "asc" },
    include: {
      doctors: { where: { active: true }, select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ specialties });
}

export async function POST(request: Request) {
  const session = await requireStaffRole(["ADMIN", "SECRETARY"]);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const {
    name,
    slug,
    icon,
    bookingMode,
    howToBook,
    days,
    hours,
    requiresMedicalOrder,
    contactPhone,
    contactExtension,
    contactEmail,
    contactWhatsapp,
    order,
  } = body ?? {};

  if (!name || !slug) {
    return NextResponse.json({ error: "Nombre y slug son obligatorios" }, { status: 400 });
  }

  const specialty = await prisma.specialty.create({
    data: {
      name,
      slug,
      icon: icon || "stethoscope",
      bookingMode: bookingMode === "ONLINE" ? "ONLINE" : "ASSISTED",
      howToBook: howToBook || null,
      days: days || null,
      hours: hours || null,
      requiresMedicalOrder: Boolean(requiresMedicalOrder),
      contactPhone: contactPhone || null,
      contactExtension: contactExtension || null,
      contactEmail: contactEmail || null,
      contactWhatsapp: contactWhatsapp || null,
      order: typeof order === "number" ? order : 0,
    },
  });
  return NextResponse.json({ specialty }, { status: 201 });
}
