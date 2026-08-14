import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffRole } from "@/lib/auth-staff";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffRole(["ADMIN", "SECRETARY"]);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const { name, bio, photoUrl, active } = body ?? {};

  const doctor = await prisma.doctor.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio: bio || null }),
      ...(photoUrl !== undefined && { photoUrl: photoUrl || null }),
      ...(active !== undefined && { active: Boolean(active) }),
    },
  });
  return NextResponse.json({ doctor });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffRole(["ADMIN", "SECRETARY"]);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const appointmentCount = await prisma.appointment.count({ where: { doctorId: id } });
  if (appointmentCount > 0) {
    return NextResponse.json(
      { error: "Este profesional tiene turnos asociados. Desactivalo en vez de eliminarlo." },
      { status: 409 },
    );
  }
  await prisma.doctor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
