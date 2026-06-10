"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Scan, Package, Plus, Keyboard } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Onderdeel {
  id: number;
  naam: string;
  aantal: number;
  minimumAantal: number;
  categorie: string | null;
  locatie: string | null;
}

type Status = "scannen" | "gevonden" | "niet-gevonden";
type Modus = "camera" | "typen";

export default function ScanPage() {
  const [status, setStatus] = useState<Status>("scannen");
  const [barcode, setBarcode] = useState("");
  const [gevonden, setGevonden] = useState<Onderdeel | null>(null);
  const [camerafout, setCamerafout] = useState("");
  const [actief, setActief] = useState(false);
  const [modus, setModus] = useState<Modus>("camera");
  const [handmatigBarcode, setHandmatigBarcode] = useState("");
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);

  const zoekBarcode = async (code: string) => {
    setBarcode(code);
    const res = await fetch(`/api/onderdelen/barcode/${encodeURIComponent(code)}`);
    if (res.ok) {
      setGevonden(await res.json());
      setStatus("gevonden");
    } else {
      setStatus("niet-gevonden");
    }
  };

  const startCamera = async () => {
    setCamerafout("");
    setActief(false);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 280, height: 110 }, aspectRatio: 1.7777778 },
        async (tekst: string) => {
          await scanner.stop().catch(() => {});
          setActief(false);
          await zoekBarcode(tekst);
        },
        () => {}
      );
      setActief(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCamerafout(
        msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("notallowed")
          ? "Cameratoestemming geweigerd. Geef toegang in de instellingen."
          : "Camera kon niet worden gestart."
      );
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setActief(false);
  };

  useEffect(() => {
    if (modus === "camera") startCamera();
    return stopCamera;
  }, [modus]);

  const reset = () => {
    setStatus("scannen");
    setBarcode("");
    setGevonden(null);
    setHandmatigBarcode("");
  };

  const opnieuScannen = async () => {
    reset();
    if (modus === "camera") await startCamera();
  };

  const wisselModus = (nieuweModus: Modus) => {
    if (nieuweModus === modus) return;
    stopCamera();
    reset();
    setModus(nieuweModus);
  };

  const handleTypen = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = handmatigBarcode.trim();
    if (!code) return;
    await zoekBarcode(code);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <header className="px-4 pt-12 pb-4 flex items-center gap-3 text-white">
        <Link href="/" className="p-2 -ml-2 text-slate-300">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold flex-1">Barcode Zoeken</h1>
      </header>

      {/* Modus toggle */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => wisselModus("camera")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium ${
            modus === "camera" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          <Scan size={16} />
          Camera scannen
        </button>
        <button
          onClick={() => wisselModus("typen")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium ${
            modus === "typen" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          <Keyboard size={16} />
          Typ barcode
        </button>
      </div>

      <main className="flex-1 flex flex-col pb-24">
        {/* Camera */}
        {modus === "camera" && status === "scannen" && (
          <div className="relative bg-black">
            <div id="reader" className="w-full" style={{ minHeight: "260px" }} />

            {actief && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-72 h-28">
                  <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-blue-400 opacity-60 animate-pulse" />
                </div>
              </div>
            )}

            {camerafout && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 gap-4">
                <Scan size={40} className="text-slate-600" />
                <p className="text-white font-medium text-center">{camerafout}</p>
                <button
                  onClick={() => wisselModus("typen")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Typ barcode in
                </button>
              </div>
            )}
          </div>
        )}

        {/* Typen */}
        {modus === "typen" && status === "scannen" && (
          <div className="px-4 pt-4">
            <form onSubmit={handleTypen} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                value={handmatigBarcode}
                onChange={(e) => setHandmatigBarcode(e.target.value)}
                placeholder="Voer barcode in..."
                autoFocus
                className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-2xl px-4 py-4 text-lg font-mono outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!handmatigBarcode.trim()}
                className="w-full bg-blue-600 text-white rounded-2xl py-4 font-semibold disabled:opacity-40"
              >
                Zoeken
              </button>
            </form>
          </div>
        )}

        {/* Instructie */}
        {status === "scannen" && modus === "camera" && !camerafout && !actief && (
          <p className="text-center text-slate-500 text-sm mt-6 px-4">Camera wordt gestart...</p>
        )}
        {status === "scannen" && modus === "camera" && actief && (
          <p className="text-center text-slate-400 text-sm mt-4 px-4">
            Richt de camera op een barcode • Tik op het scherm om scherp te stellen
          </p>
        )}

        {/* Resultaten */}
        <div className="px-4 py-4">
          {status === "gevonden" && gevonden && (
            <div className="space-y-3">
              <div className="bg-green-800 rounded-2xl p-4">
                <div className="text-green-300 text-xs font-semibold uppercase mb-2">Gevonden</div>
                <div className="font-bold text-xl text-white">{gevonden.naam}</div>
                {gevonden.categorie && (
                  <div className="text-green-300 text-sm mt-1">{gevonden.categorie}</div>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <div className="text-3xl font-bold text-white">{gevonden.aantal}</div>
                    <div className="text-green-300 text-xs">op voorraad</div>
                  </div>
                  {gevonden.locatie && (
                    <div className="text-sm text-green-200">📍 {gevonden.locatie}</div>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">{barcode}</div>
              </div>
              <Link
                href={`/onderdelen/${gevonden.id}`}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-2xl py-4 font-semibold"
              >
                <Package size={20} />
                Bekijk onderdeel
              </Link>
              <button
                onClick={opnieuScannen}
                className="w-full bg-slate-700 text-white rounded-2xl py-4 font-medium"
              >
                Opnieuw zoeken
              </button>
            </div>
          )}

          {status === "niet-gevonden" && (
            <div className="space-y-3">
              <div className="bg-slate-700 rounded-2xl p-4">
                <div className="text-slate-400 text-xs font-semibold uppercase mb-2">Niet gevonden</div>
                <div className="font-mono text-white break-all">{barcode}</div>
                <p className="text-slate-400 text-sm mt-2">Nog niet in je inventaris</p>
              </div>
              <Link
                href={`/onderdelen/nieuw?barcode=${encodeURIComponent(barcode)}`}
                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white rounded-2xl py-4 font-semibold"
              >
                <Plus size={20} />
                Toevoegen aan inventaris
              </Link>
              <button
                onClick={opnieuScannen}
                className="w-full bg-slate-700 text-white rounded-2xl py-4 font-medium"
              >
                Opnieuw zoeken
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNav active="scan" />
    </div>
  );
}
