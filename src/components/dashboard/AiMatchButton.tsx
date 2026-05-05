"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Package, Loader2 } from "lucide-react";

interface Match {
  part_id: string;
  confidence: "alta" | "media" | "baja";
  reason: string;
  part?: {
    id: string;
    part_number: string;
    description: string;
    compatibility: string;
    stock_quantity: number;
  };
}

interface Props {
  requestId: string;
  vendorId: string;
}

const confidenceColors = {
  alta: "bg-emerald-100 text-emerald-700",
  media: "bg-amber-100 text-amber-700",
  baja: "bg-slate-100 text-slate-500",
};

export default function AiMatchButton({ requestId, vendorId }: Props) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [partsChecked, setPartsChecked] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const findMatches = async () => {
    if (matches !== null) {
      setOpen(!open);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/match-parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, vendorId }),
      });

      const data = await res.json();
      setMatches(data.matches ?? []);
      setPartsChecked(data.partsChecked ?? 0);
      setOpen(true);
    } catch {
      setError("Error al buscar coincidencias");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={findMatches}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 size={12} className="animate-spin" /> Analizando stock...</>
        ) : (
          <>
            <Sparkles size={12} />
            Buscar en mi stock con IA
            {matches !== null && (open ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
          </>
        )}
      </button>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {open && matches !== null && (
        <div className="mt-3 border border-purple-100 rounded-xl overflow-hidden">
          {matches.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500 bg-slate-50">
              No encontramos coincidencias en tu stock
              {partsChecked > 0 && ` (revisamos ${partsChecked} piezas)`}.
            </div>
          ) : (
            <>
              <div className="px-4 py-2 bg-purple-50 text-xs text-purple-700 font-semibold border-b border-purple-100">
                <Sparkles size={11} className="inline mr-1" />
                {matches.length} coincidencia{matches.length !== 1 ? "s" : ""} encontrada{matches.length !== 1 ? "s" : ""} en tu inventario
              </div>
              <div className="divide-y divide-slate-100">
                {matches.map((m) => (
                  <div key={m.part_id} className="px-4 py-3 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Package size={13} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-mono font-semibold text-slate-800">
                            {m.part?.part_number}
                          </p>
                          <p className="text-xs text-slate-600">{m.part?.description}</p>
                          {m.part?.compatibility && (
                            <p className="text-xs text-slate-400 mt-0.5">{m.part.compatibility}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidenceColors[m.confidence]}`}>
                          {m.confidence}
                        </span>
                        {m.part?.stock_quantity !== undefined && (
                          <p className="text-xs text-slate-400 mt-1">{m.part.stock_quantity} u.</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 italic">{m.reason}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
