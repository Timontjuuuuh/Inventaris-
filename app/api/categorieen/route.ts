import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const result = await prisma.onderdeel.findMany({
    select: { categorie: true },
    distinct: ["categorie"],
    where: { categorie: { not: null } },
    orderBy: { categorie: "asc" },
  });

  const categorieen = result
    .map((r) => r.categorie)
    .filter(Boolean) as string[];

  return NextResponse.json(categorieen);
}
