"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Scan, Package, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Onderdeel {
  id: number;
  naam: string;
  aantal: number;
  minimumAantal: number;
  categorie: string | null;
  locatie: string | null;
}

type Status = "scannen" | "gevonden" | "niet-gevonden" | "fout";

export default function ScanPage() {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);
  const [status, setStatus] = useState<Status>("scannen");
  const [gescandeBarcodeCode, setGescandeBarcodeCode] = useState("");
  const [gevondenOnderdeel, setGevondenOnderdeel] = useState<Onderdeel | null>(null);
  const [camerafout, setCamerafout] = useState("");
  const [actief, setActief] = useState(false);

  useEffect(() => {
    let scanner: { stop: () => Promise<void> } | null = null;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;
        scanner = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0,
          },
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
          setCamerafout("Camera kon niet worden gestart. Probeer opnieuw.");
        }
      }
    };

    startScanner();

    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, []);

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

  const opnieuScannen = async () => {
    setStatus("scannen");
    setGescandeBarcodeCode("");
    setGevondenOnderdeel(null);
    setCamerafout("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
        },
        async (decodedText: string) => {
          await html5QrCode.stop();
          setActief(false);
          setGescandeBarcodeCode(decodedText);
          await zoekBarcode(decodedText);
        },
        () => {}
      );
      setActief(true);
    } catch {
      setCamerafout("Camera kon niet worden gestart.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <header className="px-4 pt-12 pb-4 flex items-center gap-3 text-white">
        <Link href="/" className="p-2 -ml-2 text-slate-300">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Barcode Scannen</h1>
      </header>

      <main className="flex-1 flex flex-col pb-24">
        {/* Camera viewfinder */}
        <div className="relative bg-black">
          <div
            id="reader"
            ref={scannerRef}
            className="w-full"
            style={{ minHeight: "300px" }}
          />

          {/* Scan overlay frame */}
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
              </div>
            </div>
          )}
        </div>

        {/* Result area */}
        <div className="flex-1 px-4 py-6 text-white">
          {status === "scannen" && !camerafout && (
            <p className="text-center text-slate-400 text-sm mt-4">
              Richt de camera op een barcode
            </p>
          )}

          {status === "gevonden" && gevondenOnderdeel && (
            <div className="space-y-4">
              <div className="bg-green-800 rounded-2xl p-4">
                <div className="text-green-300 text-xs font-semibold uppercase mb-2">
                  Gevonden
                </div>
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
                    <div className="text-sm text-green-200">
                      📍 {gevondenOnderdeel.locatie}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2 font-mono">
                  {gescandeBarcodeCode}
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/onderdelen/${gevondenOnderdeel.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-2xl py-4 font-semibold active:bg-blue-700"
                >
                  <Package size={20} />
                  Bekijk onderdeel
                </Link>
              </div>

              <button
                onClick={opnieuScannen}
                className="w-full bg-slate-700 text-white rounded-2xl py-4 font-medium active:bg-slate-600"
              >
                Opnieuw scannen
              </button>
            </div>
          )}

          {status === "niet-gevonden" && (
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-2xl p-4">
                <div className="text-slate-400 text-xs font-semibold uppercase mb-2">
                  Niet gevonden
                </div>
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
                Opnieuw scannen
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNav active="scan" />
    </div>
  );
}
