"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, Barcode } from "lucide-react";

interface FormData {
  naam: string;
  barcode: string;
  omschrijving: string;
  categorie: string;
  aantal: string;
  minimumAantal: string;
  locatie: string;
  inkoopprijs: string;
  verkoopprijs: string;
  leverancier: string;
  notities: string;
}

interface OnderdeelFormProps {
  initieleData?: Partial<FormData> & { id?: number };
  modus: "nieuw" | "bewerken";
}

const leegFormulier: FormData = {
  naam: "",
  barcode: "",
  omschrijving: "",
  categorie: "",
  aantal: "0",
  minimumAantal: "0",
  locatie: "",
  inkoopprijs: "",
  verkoopprijs: "",
  leverancier: "",
  notities: "",
};

export default function OnderdeelForm({ initieleData, modus }: OnderdeelFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    ...leegFormulier,
    ...initieleData,
    aantal: initieleData?.aantal?.toString() ?? "0",
    minimumAantal: initieleData?.minimumAantal?.toString() ?? "0",
    inkoopprijs: initieleData?.inkoopprijs?.toString() ?? "",
    verkoopprijs: initieleData?.verkoopprijs?.toString() ?? "",
  });
  const [opslaan, setOpslaan] = useState(false);
  const [verwijderen, setVerwijderen] = useState(false);
  const [categorieen, setCategorieen] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categorieen")
      .then((r) => r.json())
      .then(setCategorieen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.naam.trim()) return;
    setOpslaan(true);

    const url =
      modus === "nieuw"
        ? "/api/onderdelen"
        : `/api/onderdelen/${initieleData?.id}`;
    const method = modus === "nieuw" ? "POST" : "PUT";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    router.push("/onderdelen");
    router.refresh();
  };

  const handleVerwijderen = async () => {
    if (!confirm("Weet je zeker dat je dit onderdeel wilt verwijderen?")) return;
    setVerwijderen(true);
    await fetch(`/api/onderdelen/${initieleData?.id}`, { method: "DELETE" });
    router.push("/onderdelen");
    router.refresh();
  };

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24">
      {/* Naam - verplicht */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Basis informatie
        </h2>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Naam <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.naam}
            onChange={set("naam")}
            placeholder="Bijv. Remblok voor"
            className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Barcode
          </label>
          <div className="relative">
            <Barcode
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={form.barcode}
              onChange={set("barcode")}
              placeholder="Scan of typ barcode"
              className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Categorie
          </label>
          <input
            type="text"
            list="categorieen-list"
            value={form.categorie}
            onChange={set("categorie")}
            placeholder="Bijv. Remmen, Filters, Olie..."
            className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="categorieen-list">
            {categorieen.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Omschrijving
          </label>
          <textarea
            value={form.omschrijving}
            onChange={set("omschrijving")}
            placeholder="Extra informatie..."
            rows={2}
            className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Voorraad */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Voorraad
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Aantal
            </label>
            <input
              type="number"
              min="0"
              value={form.aantal}
              onChange={set("aantal")}
              className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-bold"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Min. aantal
            </label>
            <input
              type="number"
              min="0"
              value={form.minimumAantal}
              onChange={set("minimumAantal")}
              className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-bold"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Locatie in garage
          </label>
          <input
            type="text"
            value={form.locatie}
            onChange={set("locatie")}
            placeholder="Bijv. Rek A - Plank 2"
            className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Prijs & Leverancier */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Prijs & Leverancier
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Inkoopprijs
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                €
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.inkoopprijs}
                onChange={set("inkoopprijs")}
                placeholder="0.00"
                className="w-full bg-slate-100 rounded-xl pl-7 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Verkoopprijs
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                €
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.verkoopprijs}
                onChange={set("verkoopprijs")}
                placeholder="0.00"
                className="w-full bg-slate-100 rounded-xl pl-7 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">
            Leverancier
          </label>
          <input
            type="text"
            value={form.leverancier}
            onChange={set("leverancier")}
            placeholder="Bijv. Autodoc, Europarts..."
            className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notities */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Notities
        </h2>
        <textarea
          value={form.notities}
          onChange={set("notities")}
          placeholder="Extra notities..."
          rows={3}
          className="w-full bg-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-8 flex gap-3">
        {modus === "bewerken" && (
          <button
            type="button"
            onClick={handleVerwijderen}
            disabled={verwijderen}
            className="bg-red-100 text-red-600 rounded-xl px-4 py-3 font-medium active:bg-red-200 disabled:opacity-50"
          >
            <Trash2 size={20} />
          </button>
        )}
        <button
          type="submit"
          disabled={opslaan || !form.naam.trim()}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 font-semibold active:bg-blue-700 disabled:opacity-50"
        >
          <Save size={20} />
          {opslaan ? "Opslaan..." : "Opslaan"}
        </button>
      </div>
    </form>
  );
}
