import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Parámetro date inválido (usar YYYY-MM-DD)" }, { status: 400 });
  }

  const slots = await getAvailableSlots(id, date);
  return NextResponse.json({ date, slots });
}
