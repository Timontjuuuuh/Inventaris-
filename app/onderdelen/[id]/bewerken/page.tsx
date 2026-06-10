"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import OnderdeelForm from "@/components/OnderdeelForm";

export default function BewerkOnderdeelPage() {
  const params = useParams();
  const [onderdeel, setOnderdeel] = useState(null);

  useEffect(() => {
    fetch(`/api/onderdelen/${params.id}`)
      .then((r) => r.json())
      .then(setOnderdeel);
  }, [params.id]);

  if (!onderdeel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-200 px-4 pt-12 pb-4 flex items-center gap-3">
        <Link href={`/onderdelen/${params.id}`} className="p-2 -ml-2 text-slate-600">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Bewerken</h1>
      </header>

      <main className="flex-1 px-4 py-4">
        <OnderdeelForm modus="bewerken" initieleData={onderdeel} />
      </main>
    </div>
  );
}
