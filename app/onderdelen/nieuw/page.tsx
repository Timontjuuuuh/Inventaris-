"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, CheckCircle, HelpCircle } from "lucide-react";
import OnderdeelForm from "@/components/OnderdeelForm";

interface LookupResultaat {
  gevonden: boolean;
  naam?: string;
  omschrijving?: string;
  categorie?: string;
  merk?: string;
}

function NieuwFormulier() {
  const searchParams = useSearchParams();
  const barcode = searchParams.get("barcode") || "";

  const [lookupStatus, setLookupStatus] = useState<"idle" | "laden" | "gevonden" | "niet-gevonden">("idle");
  const [extraData, setExtraData] = useState<{ naam?: string; omschrijving?: string; categorie?: string }>({});
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!barcode) return;
    setLookupStatus("laden");

    fetch(`/api/barcode-lookup/${encodeURIComponent(barcode)}`)
      .then((r) => r.json())
      .then((data: LookupResultaat) => {
        if (data.gevonden && data.naam) {
          const naam = data.merk ? `${data.merk} - ${data.naam}` : data.naam;
          setExtraData({ naam, omschrijving: data.omschrijving || "", categorie: data.categorie || "" });
          setFormKey((k) => k + 1);
          setLookupStatus("gevonden");
        } else {
          setLookupStatus("niet-gevonden");
        }
      })
      .catch(() => setLookupStatus("niet-gevonden"));
  }, [barcode]);

  return (
    <div>
      {barcode && lookupStatus !== "idle" && (
        <div className={`mb-4 rounded-2xl px-4 py-3 flex items-center gap-3 text-sm ${
          lookupStatus === "laden" ? "bg-blue-50 text-blue-700" :
          lookupStatus === "gevonden" ? "bg-green-50 text-green-700" :
          "bg-slate-100 text-slate-500"
        }`}>
          {lookupStatus === "laden" && <><Loader2 size={18} className="animate-spin shrink-0" /><span>Product opzoeken...</span></>}
          {lookupStatus === "gevonden" && <><CheckCircle size={18} className="shrink-0" /><span>Product gevonden en vooringevuld</span></>}
          {lookupStatus === "niet-gevonden" && <><HelpCircle size={18} className="shrink-0" /><span>Niet gevonden — vul zelf in</span></>}
        </div>
      )}

      <OnderdeelForm
        key={formKey}
        modus="nieuw"
        initieleData={{ barcode, ...extraData }}
      />
    </div>
  );
}

export default function NieuwOnderdeelPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-200 px-4 pt-12 pb-4 flex items-center gap-3">
        <Link href="/onderdelen" className="p-2 -ml-2 text-slate-600">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Nieuw onderdeel</h1>
      </header>

      <main className="flex-1 px-4 py-4">
        <Suspense fallback={
          <div className="flex justify-center mt-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        }>
          <NieuwFormulier />
        </Suspense>
      </main>
    </div>
  );
}
