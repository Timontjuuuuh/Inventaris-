import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(code)}`,
      {
        headers: { "Accept": "application/json" },
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ gevonden: false });
    }

    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ gevonden: false });
    }

    const item = data.items[0];

    return NextResponse.json({
      gevonden: true,
      naam: item.title || "",
      omschrijving: item.description || "",
      categorie: item.category || "",
      merk: item.brand || "",
    });
  } catch {
    return NextResponse.json({ gevonden: false });
  }
}
