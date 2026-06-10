"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, Scan, Plus, AlertTriangle, LayoutDashboard } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Stats {
  totaalOnderdelen: number;
  totaalAantal: number;
  laagOp: number;
  categorieen: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totaalOnderdelen: 0,
    totaalAantal: 0,
    laagOp: 0,
    categorieen: 0,
  });

  useEffect(() => {
    fetch("/api/onderdelen")
      .then((r) => r.json())
      .then((data) => {
        const uniekeCats = new Set(
          data.map((o: { categorie: string | null }) => o.categorie).filter(Boolean)
        );
        setStats({
          totaalOnderdelen: data.length,
          totaalAantal: data.reduce(
            (sum: number, o: { aantal: number }) => sum + o.aantal,
            0
          ),
          laagOp: data.filter(
            (o: { aantal: number; minimumAantal: number }) =>
              o.aantal <= o.minimumAantal && o.minimumAantal > 0
          ).length,
          categorieen: uniekeCats.size,
        });
      });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-700 text-white px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Garage Inventaris</h1>
        <p className="text-blue-200 text-sm mt-1">Onderdelen beheer</p>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 pb-24">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-blue-700">{stats.totaalOnderdelen}</div>
            <div className="text-sm text-slate-500 mt-1">Onderdelen</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-green-600">{stats.totaalAantal}</div>
            <div className="text-sm text-slate-500 mt-1">Stuks totaal</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className={`text-3xl font-bold ${stats.laagOp > 0 ? "text-red-500" : "text-slate-700"}`}>
              {stats.laagOp}
            </div>
            <div className="text-sm text-slate-500 mt-1">Laag op voorraad</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{stats.categorieen}</div>
            <div className="text-sm text-slate-500 mt-1">Categorieën</div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Snelle acties
          </h2>
          <div className="space-y-3">
            <Link
              href="/scan"
              className="flex items-center gap-4 bg-blue-600 text-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
            >
              <div className="bg-blue-500 rounded-xl p-3">
                <Scan size={24} />
              </div>
              <div>
                <div className="font-semibold text-lg">Barcode Scannen</div>
                <div className="text-blue-200 text-sm">Scan met de camera</div>
              </div>
            </Link>

            <Link
              href="/onderdelen/nieuw"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
            >
              <div className="bg-green-100 rounded-xl p-3">
                <Plus size={24} className="text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-lg text-slate-800">Nieuw onderdeel</div>
                <div className="text-slate-500 text-sm">Voeg handmatig toe</div>
              </div>
            </Link>

            <Link
              href="/onderdelen"
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm active:scale-95 transition-transform"
            >
              <div className="bg-blue-100 rounded-xl p-3">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-lg text-slate-800">Alle onderdelen</div>
                <div className="text-slate-500 text-sm">Bekijk en zoek in voorraad</div>
              </div>
            </Link>

            {stats.laagOp > 0 && (
              <Link
                href="/onderdelen?filter=laag"
                className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl p-4 active:scale-95 transition-transform"
              >
                <div className="bg-red-100 rounded-xl p-3">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <div className="font-semibold text-lg text-red-700">Laag op voorraad</div>
                  <div className="text-red-500 text-sm">{stats.laagOp} onderdelen bijna op</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
