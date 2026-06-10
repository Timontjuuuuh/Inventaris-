"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import OnderdeelForm from "@/components/OnderdeelForm";

function NieuwFormulier() {
  const searchParams = useSearchParams();
  const barcode = searchParams.get("barcode") || "";

  return <OnderdeelForm modus="nieuw" initieleData={{ barcode }} />;
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
        <Suspense fallback={<div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mt-12" />}>
          <NieuwFormulier />
        </Suspense>
      </main>
    </div>
  );
}
