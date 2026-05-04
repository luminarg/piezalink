"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { CAR_BRANDS } from "@/lib/utils/car-brands";

interface Props {
  vendorId: string;
  initialBrands: string[];
}

export default function BrandsSelector({ vendorId, initialBrands }: Props) {
  const [selected, setSelected] = useState<string[]>(initialBrands);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const isAll = selected.includes("ALL");

  const toggleAll = () => {
    if (isAll) setSelected([]);
    else setSelected(["ALL"]);
  };

  const toggleBrand = (brand: string) => {
    if (isAll) return;
    setSelected((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    // Borrar todas y reinsertar
    await supabase.from("vendor_brands").delete().eq("vendor_id", vendorId);

    if (selected.length > 0) {
      await supabase.from("vendor_brands").insert(
        selected.map((brand) => ({ vendor_id: vendorId, brand }))
      );
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Marcas que trabajás</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Usamos esto para enviarte solicitudes de compradores que coincidan con tu especialidad
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          {saving ? "Guardando..." : saved ? <><Check size={14} /> Guardado</> : "Guardar"}
        </button>
      </div>

      {/* Multimarca */}
      <button
        onClick={toggleAll}
        className={`w-full text-left px-4 py-3 rounded-xl border-2 mb-4 transition-colors font-semibold text-sm ${
          isAll
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-slate-200 text-slate-600 hover:border-slate-300"
        }`}
      >
        {isAll && <Check size={14} className="inline mr-2" />}
        MULTIMARCA — Trabajo todas las marcas
      </button>

      {/* Grid de marcas */}
      {!isAll && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CAR_BRANDS.map((brand) => {
            const active = selected.includes(brand);
            return (
              <button
                key={brand}
                onClick={() => toggleBrand(brand)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors text-left ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {active && <Check size={12} className="inline mr-1.5" />}
                {brand}
              </button>
            );
          })}
        </div>
      )}

      {!isAll && selected.length > 0 && (
        <p className="text-xs text-slate-400 mt-3">
          {selected.length} marca{selected.length !== 1 ? "s" : ""} seleccionada{selected.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
