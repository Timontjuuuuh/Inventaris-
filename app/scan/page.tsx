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
  const scannerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("scannen");
  const [gescandeBarcodeCode, setGescandeBarcodeCode] = useState("");
  const [gevondenOnderdeel, setGevondenOnderdeel] = useState<Onderdeel | null>(null);
  const [camerafout, setCamerafout] = useState("");
  const [actief, setActief] = useState(false);
  const [modus, setModus] = useState<Modus>("camera");
  const [handmatigBarcode, setHandmatigBarcode] = useState("");
  const scannerInstance = useRef<{ stop: () => Promise<void> } | null>(null);

  const zoekBarcode = async (code: string) => {
    const res = await fetch(`/api/onderdelen/barcode/${encodeURIComponent(code)}`);
    if (res.ok) {
      const onderdeel = await res.json();
      setGevondenOnderdeel(onderdeel);
      setStatus("gevonden");
    } else {
      setStatus("niet-gevonden");
    }
  };

  const startCamera = async () => {
    setCamerafout("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("reader");
      scannerInstance.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 },
        async (decodedText: string) => {
          await html5QrCode.stop();
          setActief(false);
          setGescandeBarcodeCode(decodedText);
          await zoekBarcode(decodedText);
        },
        () => {}
      );
      setActief(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("permission") || msg.includes("NotAllowed")) {
        setCamerafout("Cameratoestemming geweigerd. Geef toegang in de instellingen.");
      } else {
        setCamerafout("Camera kon niet worden gestart. Gebruik de 'Typ barcode' optie.");
      }
    }
  };

  const stopCamera = async () => {
    if (scannerInstance.current) {
      await scannerInstance.current.stop().catch(() => {});
      scannerInstance.current = null;
    }
    setActief(false);
  };

  useEffect(() => {
    if (modus === "camera") {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [modus]);

  const opnieuScannen = async () => {
    setStatus("scannen");
    setGescandeBarcodeCode("");
    setGevondenOnderdeel(null);
    setHandmatigBarcode("");
    if (modus === "camera") {
      await startCamera();
    }
  };

  const wisselModus = async (nieuweModus: Modus) => {
    if (nieuweModus === modus) return;
    await stopCamera();
    setStatus("scannen");
    setGescandeBarcodeCode("");
    setGevondenOnderdeel(null);
    setHandmatigBarcode("");
    setModus(nieuweModus);
  };

  const handleHandmatigZoeken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handmatigBarcode.trim()) return;
    setGescandeBarcodeCode(handmatigBarcode.trim());
    await zoekBarcode(handmatigBarcode.trim());
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
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            modus === "camera"
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          <Scan size={16} />
          Camera scannen
        </button>
        <button
          onClick={() => wisselModus("typen")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            modus === "typen"
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          <Keyboard size={16} />
          Typ barcode
        </button>
      </div>

      <main className="flex-1 flex flex-col pb-24">
        {/* Camera modus */}
        {modus === "camera" && (
          <div className="relative bg-black">
            <div
              id="reader"
              ref={scannerRef}
              className="w-full"
              style={{ minHeight: "300px" }}
            />
            {status === "scannen" && actief && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-40">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400 opacity-70 animate-pulse" />
                </div>
              </div>
            )}
            {camerafout && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center p-6">
                <div className="text-center text-white">
                  <Scan size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-2">Camera niet beschikbaar</p>
                  <p className="text-sm text-slate-400">{camerafout}</p>
                  <button
                    onClick={() => wisselModus("typen")}
                    className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium"
                  >
                    Typ barcode in
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Typ modus */}
        {modus === "typen" && status === "scannen" && (
          <div className="px-4 pt-4">
            <form onSubmit={handleHandmatigZoeken} className="space-y-3">
              <input
                type="text"
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

        {/* Resultaten */}
        <div className="flex-1 px-4 py-6 text-white">
          {status === "scannen" && modus === "camera" && !camerafout && (
            <p className="text-center text-slate-400 text-sm mt-4">
              Richt de camera op een barcode
            </p>
          )}

          {status === "gevonden" && gevondenOnderdeel && (
            <div className="space-y-4">
              <div className="bg-green-800 rounded-2xl p-4">
                <div className="text-green-300 text-xs font-semibold uppercase mb-2">Gevonden</div>
                <div className="font-bold text-xl text-white">{gevondenOnderdeel.naam}</div>
                {gevondenOnderdeel.categorie && (
                  <div className="text-green-300 text-sm mt-1">{gevondenOnderdeel.categorie}</div>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <div className="text-3xl font-bold text-white">{gevondenOnderdeel.aantal}</div>
                    <div className="text-green-300 text-xs">op voorraad</div>
                  </div>
                  {gevondenOnderdeel.locatie && (
                    <div className="text-sm text-green-200">📍 {gevondenOnderdeel.locatie}</div>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">{gescandeBarcodeCode}</div>
              </div>
              <Link
                href={`/onderdelen/${gevondenOnderdeel.id}`}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white rounded-2xl py-4 font-semibold active:bg-blue-700"
              >
                <Package size={20} />
                Bekijk onderdeel
              </Link>
              <button
                onClick={opnieuScannen}
                className="w-full bg-slate-700 text-white rounded-2xl py-4 font-medium active:bg-slate-600"
              >
                Opnieuw zoeken
              </button>
            </div>
          )}

          {status === "niet-gevonden" && (
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-2xl p-4">
                <div className="text-slate-400 text-xs font-semibold uppercase mb-2">Niet gevonden</div>
                <div className="font-mono text-white break-all">{gescandeBarcodeCode}</div>
                <p className="text-slate-400 text-sm mt-2">
                  Dit onderdeel staat nog niet in je inventaris
                </p>
              </div>
              <Link
                href={`/onderdelen/nieuw?barcode=${encodeURIComponent(gescandeBarcodeCode)}`}
                className="flex items-center justify-center gap-2 w-full bg-green-600 text-white rounded-2xl py-4 font-semibold active:bg-green-700"
              >
                <Plus size={20} />
                Toevoegen aan inventaris
              </Link>
              <button
                onClick={opnieuScannen}
                className="w-full bg-slate-700 text-white rounded-2xl py-4 font-medium active:bg-slate-600"
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
