"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Package,
  Tag,
  Barcode,
  Pencil,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Onderdeel {
  id: number;
  naam: string;
  barcode: string | null;
  omschrijving: string | null;
  categorie: string | null;
  aantal: number;
  minimumAantal: number;
  locatie: string | null;
  inkoopprijs: number | null;
  verkoopprijs: number | null;
  leverancier: string | null;
  notities: string | null;
  aangemaakt: string;
  bijgewerkt: string;
}

export default function OnderdeelDetailPage() {
  const params = useParams();
  const [onderdeel, setOnderdeel] = useState<Onderdeel | null>(null);
  const [aantalInput, setAantalInput] = useState("");
  const [opslaan, setOpslaan] = useState(false);

  useEffect(() => {
    fetch(`/api/onderdelen/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setOnderdeel(data);
        setAantalInput(data.aantal.toString());
      });
  }, [params.id]);

  const updateAantal = async (nieuwAantal: number) => {
    if (!onderdeel || nieuwAantal < 0) return;
    setOpslaan(true);
    const res = await fetch(`/api/onderdelen/${onderdeel.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...onderdeel, aantal: nieuwAantal }),
    });
    const updated = await res.json();
    setOnderdeel(updated);
    setAantalInput(updated.aantal.toString());
    setOpslaan(false);
  };

  if (!onderdeel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isLaag = onderdeel.aantal <= onderdeel.minimumAantal && onderdeel.minimumAantal > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-200 px-4 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/onderdelen" className="p-2 -ml-2 text-slate-600">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              {onderdeel.naam}
            </h1>
            {onderdeel.categorie && (
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {onderdeel.categorie}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/onderdelen/${onderdeel.id}/bewerken`}
          className="bg-blue-100 text-blue-600 rounded-xl p-2"
        >
          <Pencil size={20} />
        </Link>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 space-y-4">
        {/* Aantal beheer */}
        <div className={`rounded-2xl p-5 shadow-sm ${isLaag ? "bg-red-50 border border-red-200" : "bg-white"}`}>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-1 ${isLaag ? "text-red-500" : "text-slate-800"}`}>
              {onderdeel.aantal}
            </div>
            <div className="text-slate-400 text-sm mb-4">stuks op voorraad</div>
            {isLaag && (
              <div className="text-red-500 text-sm font-medium mb-3">
                ⚠ Minimum ({onderdeel.minimumAantal}) bereikt
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => updateAantal(onderdeel.aantal - 1)}
                disabled={onderdeel.aantal === 0 || opslaan}
                className="bg-red-100 text-red-600 rounded-2xl w-14 h-14 flex items-center justify-center text-2xl font-bold active:bg-red-200 disabled:opacity-30"
              >
                <TrendingDown size={24} />
              </button>
              <input
                type="number"
                min="0"
                value={aantalInput}
                onChange={(e) => setAantalInput(e.target.value)}
                onBlur={() => {
                  const n = parseInt(aantalInput);
                  if (!isNaN(n) && n >= 0) updateAantal(n);
                  else setAantalInput(onderdeel.aantal.toString());
                }}
                className="w-20 text-center bg-slate-100 rounded-xl py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => updateAantal(onderdeel.aantal + 1)}
                disabled={opslaan}
                className="bg-green-100 text-green-600 rounded-2xl w-14 h-14 flex items-center justify-center text-2xl font-bold active:bg-green-200 disabled:opacity-30"
              >
                <TrendingUp size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          {onderdeel.barcode && (
            <div className="flex items-center gap-3">
              <Barcode size={18} className="text-slate-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Barcode</div>
                <div className="font-mono font-medium text-slate-700">{onderdeel.barcode}</div>
              </div>
            </div>
          )}

          {onderdeel.locatie && (
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-slate-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Locatie</div>
                <div className="font-medium text-slate-700">{onderdeel.locatie}</div>
              </div>
            </div>
          )}

          {onderdeel.leverancier && (
            <div className="flex items-center gap-3">
              <Package size={18} className="text-slate-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Leverancier</div>
                <div className="font-medium text-slate-700">{onderdeel.leverancier}</div>
              </div>
            </div>
          )}

          {(onderdeel.inkoopprijs !== null || onderdeel.verkoopprijs !== null) && (
            <div className="flex items-center gap-3">
              <Tag size={18} className="text-slate-400 shrink-0" />
              <div className="flex gap-6">
                {onderdeel.inkoopprijs !== null && (
                  <div>
                    <div className="text-xs text-slate-400">Inkoop</div>
                    <div className="font-medium text-slate-700">
                      €{onderdeel.inkoopprijs.toFixed(2)}
                    </div>
                  </div>
                )}
                {onderdeel.verkoopprijs !== null && (
                  <div>
                    <div className="text-xs text-slate-400">Verkoop</div>
                    <div className="font-medium text-slate-700">
                      €{onderdeel.verkoopprijs.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {onderdeel.omschrijving && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-400 mb-1">Omschrijving</div>
            <p className="text-slate-700 text-sm">{onderdeel.omschrijving}</p>
          </div>
        )}

        {onderdeel.notities && (
          <div className="bg-yellow-50 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-yellow-600 mb-1">Notities</div>
            <p className="text-slate-700 text-sm">{onderdeel.notities}</p>
          </div>
        )}

        <div className="text-center text-xs text-slate-400">
          Bijgewerkt: {new Date(onderdeel.bijgewerkt).toLocaleDateString("nl-NL")}
        </div>
      </main>

      <BottomNav active="onderdelen" />
    </div>
  );
}
