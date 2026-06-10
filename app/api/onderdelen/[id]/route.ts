import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const onderdeel = await prisma.onderdeel.findUnique({
    where: { id: parseInt(id) },
  });

  if (!onderdeel) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  return NextResponse.json(onderdeel);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();

  const onderdeel = await prisma.onderdeel.update({
    where: { id: parseInt(id) },
    data: {
      naam: data.naam,
      barcode: data.barcode || null,
      omschrijving: data.omschrijving || null,
      categorie: data.categorie || null,
      aantal: parseInt(data.aantal) || 0,
      minimumAantal: parseInt(data.minimumAantal) || 0,
      locatie: data.locatie || null,
      inkoopprijs: data.inkoopprijs ? parseFloat(data.inkoopprijs) : null,
      verkoopprijs: data.verkoopprijs ? parseFloat(data.verkoopprijs) : null,
      leverancier: data.leverancier || null,
      notities: data.notities || null,
    },
  });

  return NextResponse.json(onderdeel);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.onderdeel.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
