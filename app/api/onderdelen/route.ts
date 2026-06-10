import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zoek = searchParams.get("zoek") || "";
  const categorie = searchParams.get("categorie") || "";

  const onderdelen = await prisma.onderdeel.findMany({
    where: {
      AND: [
        zoek
          ? {
              OR: [
                { naam: { contains: zoek } },
                { barcode: { contains: zoek } },
                { locatie: { contains: zoek } },
                { categorie: { contains: zoek } },
              ],
            }
          : {},
        categorie ? { categorie } : {},
      ],
    },
    orderBy: { bijgewerkt: "desc" },
  });

  return NextResponse.json(onderdelen);
}

export async function POST(request: NextRequest) {
  const data = await request.json();

  const onderdeel = await prisma.onderdeel.create({
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

  return NextResponse.json(onderdeel, { status: 201 });
}
