import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffRole } from "@/lib/auth-staff";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaffRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  if (id === session.staffId) {
    return NextResponse.json({ error: "No podés eliminar tu propia cuenta" }, { status: 400 });
  }
  await prisma.staffUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
