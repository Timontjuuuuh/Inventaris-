"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Package, ChevronRight, AlertTriangle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Onderdeel {
  id: number;
  naam: string;
  barcode: string | null;
  categorie: string | null;
  aantal: number;
  minimumAantal: number;
  locatie: string | null;
  inkoopprijs: number | null;
}

function OnderdelenLijst() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");

  const [onderdelen, setOnderdelen] = useState<Onderdeel[]>([]);
  const [zoekterm, setZoekterm] = useState("");
  const [categorie, setCategorie] = useState("");
  const [categorieen, setCategorieen] = useState<string[]>([]);
  const [laden, setLaden] = useState(true);

  const laadOnderdelen = useCallback(async () => {
    setLaden(true);
    const params = new URLSearchParams();
    if (zoekterm) params.set("zoek", zoekterm);
    if (categorie) params.set("categorie", categorie);

    const res = await fetch(`/api/onderdelen?${params}`);
    let data: Onderdeel[] = await res.json();

    if (filterParam === "laag") {
      data = data.filter((o) => o.aantal <= o.minimumAantal && o.minimumAantal > 0);
    }

    setOnderdelen(data);
    setLaden(false);
  }, [zoekterm, categorie, filterParam]);

  useEffect(() => {
    laadOnderdelen();
  }, [laadOnderdelen]);

  useEffect(() => {
    fetch("/api/categorieen")
      .then((r) => r.json())
      .then(setCategorieen);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-200 px-4 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-slate-800">
            {filterParam === "laag" ? "Laag op voorraad" : "Onderdelen"}
          </h1>
          <Link
            href="/onderdelen/nieuw"
            className="bg-blue-600 text-white rounded-xl p-2 active:bg-blue-700"
          >
            <Plus size={20} />
          </Link>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            placeholder="Zoek op naam, barcode of locatie..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {categorieen.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setCategorie("")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !categorie
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              Alle
            </button>
            {categorieen.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategorie(cat === categorie ? "" : cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  categorie === cat
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4 pb-24 space-y-2">
        {laden ? (
          <div className="flex justify-center pt-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : onderdelen.length === 0 ? (
          <div className="text-center pt-16 text-slate-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Geen onderdelen gevonden</p>
            <p className="text-sm mt-1">Voeg je eerste onderdeel toe</p>
            <Link
              href="/onderdelen/nieuw"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium"
            >
              Toevoegen
            </Link>
          </div>
        ) : (
          onderdelen.map((o) => (
            <Link
              key={o.id}
              href={`/onderdelen/${o.id}`}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm active:bg-slate-50"
            >
              <div
                className={`w-2 h-12 rounded-full shrink-0 ${
                  o.aantal <= o.minimumAantal && o.minimumAantal > 0
                    ? "bg-red-400"
                    : o.aantal === 0
                    ? "bg-orange-400"
                    : "bg-green-400"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 truncate">{o.naam}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  {o.categorie && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {o.categorie}
                    </span>
                  )}
                  {o.locatie && (
                    <span className="text-xs text-slate-400 truncate">{o.locatie}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={`text-lg font-bold ${
                    o.aantal <= o.minimumAantal && o.minimumAantal > 0
                      ? "text-red-500"
                      : o.aantal === 0
                      ? "text-orange-500"
                      : "text-slate-700"
                  }`}
                >
                  {o.aantal}
                </div>
                <div className="text-xs text-slate-400">stuks</div>
              </div>
              {o.aantal <= o.minimumAantal && o.minimumAantal > 0 && (
                <AlertTriangle size={16} className="text-red-400 shrink-0" />
              )}
              <ChevronRight size={16} className="text-slate-300 shrink-0" />
            </Link>
          ))
        )}
      </main>

      <BottomNav active="onderdelen" />
    </div>
  );
}

export default function OnderdelenPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <OnderdelenLijst />
    </Suspense>
  );
}
