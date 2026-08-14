import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffRole } from "@/lib/auth-staff";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffRole(["ADMIN", "SECRETARY"]);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const {
    name,
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

  const specialty = await prisma.specialty.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(icon !== undefined && { icon }),
      ...(bookingMode !== undefined && { bookingMode: bookingMode === "ONLINE" ? "ONLINE" : "ASSISTED" }),
      ...(howToBook !== undefined && { howToBook: howToBook || null }),
      ...(days !== undefined && { days: days || null }),
      ...(hours !== undefined && { hours: hours || null }),
      ...(requiresMedicalOrder !== undefined && { requiresMedicalOrder: Boolean(requiresMedicalOrder) }),
      ...(contactPhone !== undefined && { contactPhone: contactPhone || null }),
      ...(contactExtension !== undefined && { contactExtension: contactExtension || null }),
      ...(contactEmail !== undefined && { contactEmail: contactEmail || null }),
      ...(contactWhatsapp !== undefined && { contactWhatsapp: contactWhatsapp || null }),
      ...(typeof order === "number" && { order }),
    },
  });
  return NextResponse.json({ specialty });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffRole(["ADMIN", "SECRETARY"]);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const doctorCount = await prisma.doctor.count({ where: { specialtyId: id } });
  if (doctorCount > 0) {
    return NextResponse.json(
      { error: "Esta especialidad tiene profesionales asociados. Eliminalos primero." },
      { status: 409 },
    );
  }
  await prisma.specialty.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
