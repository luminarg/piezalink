import { createClient } from "@/lib/supabase/server";
import { Search, Sparkles } from "lucide-react";
import PartCard from "@/components/parts/PartCard";
import { parseSearchQuery } from "@/lib/gemini";
import type { Part } from "@/types";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; brand?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const page = parseInt(params.page || "1");
  const perPage = 20;
  const offset = (page - 1) * perPage;

  const supabase = await createClient();

  let parts: Part[] = [];
  let count = 0;
  let aiParsed: Awaited<ReturnType<typeof parseSearchQuery>> | null = null;
  let aiEnhanced = false;

  if (query) {
    // Parsear la búsqueda con IA
    aiParsed = await parseSearchQuery(query);

    // Vendedores activos con suscripción vigente
    const now = new Date().toISOString();
    const { data: activeVendorIds } = await supabase
      .from("subscriptions")
      .select("vendor_id")
      .eq("status", "active")
      .gt("expires_at", now);

    let vendorIds = (activeVendorIds ?? []).map((s) => s.vendor_id);

    // Fallback: si no hay suscripciones activas, mostrar todos los vendedores activos
    if (vendorIds.length === 0) {
      const { data: allActiveVendors } = await supabase
        .from("vendors")
        .select("id")
        .eq("is_active", true);
      vendorIds = (allActiveVendors ?? []).map((v) => v.id);
    }

    if (vendorIds.length > 0) {
      // Construir filtros enriquecidos con IA
      const allKeywords = [
        query,
        ...(aiParsed?.keywords ?? []),
        aiParsed?.part_type,
      ].filter(Boolean) as string[];

      // Buscar con términos originales + keywords IA
      const orFilters = allKeywords
        .flatMap((kw) => [
          `part_number.ilike.%${kw}%`,
          `description.ilike.%${kw}%`,
          `compatibility.ilike.%${kw}%`,
        ])
        .join(",");

      let dbQuery = supabase
        .from("parts")
        .select("*, vendor:vendors(id, company_name, whatsapp, city)", { count: "exact" })
        .eq("is_active", true)
        .gt("stock_quantity", 0)
        .in("vendor_id", vendorIds)
        .or(orFilters)
        .order("created_at", { ascending: false })
        .range(offset, offset + perPage - 1);

      // Si IA detectó marca, filtrar también por brand
      if (aiParsed?.brand) {
        aiEnhanced = true;
        const { data: brandData, count: brandCount } = await supabase
          .from("parts")
          .select("*, vendor:vendors(id, company_name, whatsapp, city)", { count: "exact" })
          .eq("is_active", true)
          .gt("stock_quantity", 0)
          .in("vendor_id", vendorIds)
          .or(`${orFilters},brand.ilike.%${aiParsed.brand}%,compatibility.ilike.%${aiParsed.model ?? aiParsed.brand}%`)
          .order("created_at", { ascending: false })
          .range(offset, offset + perPage - 1);

        if ((brandCount ?? 0) > 0) {
          parts = (brandData as Part[]) || [];
          count = brandCount || 0;
        } else {
          // Fallback a búsqueda general
          const { data, count: total } = await dbQuery;
          parts = (data as Part[]) || [];
          count = total || 0;
        }
      } else {
        const { data, count: total } = await dbQuery;
        parts = (data as Part[]) || [];
        count = total || 0;
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Buscador */}
      <form method="GET" className="flex gap-2 max-w-2xl mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Número de pieza, marca, modelo, descripción..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Badge IA */}
      {query && aiParsed && (aiParsed.brand || aiParsed.part_type) && (
        <div className="flex items-center gap-2 mb-4 text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 max-w-2xl">
          <Sparkles size={14} className="shrink-0" />
          <span>
            Búsqueda inteligente:{" "}
            {[aiParsed.brand, aiParsed.model, aiParsed.year, aiParsed.part_type]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
      )}

      {/* Resultado count */}
      {query && (
        <div className="mb-4 text-sm text-slate-500">
          {count > 0
            ? `${count} resultado${count !== 1 ? "s" : ""} para "${query}"`
            : `Sin resultados para "${query}"`}
        </div>
      )}

      {/* Empty states */}
      {!query && (
        <div className="text-center py-20 text-slate-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600 mb-1">Buscá cualquier repuesto</p>
          <p className="text-sm">Podés escribir el número de pieza, la descripción o el vehículo</p>
          <p className="text-xs mt-2 text-purple-500 flex items-center justify-center gap-1">
            <Sparkles size={11} /> Búsqueda con inteligencia artificial
          </p>
        </div>
      )}

      {query && parts.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <PackageIcon size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600 mb-1">Sin resultados</p>
          <p className="text-sm mb-4">No encontramos piezas para "{query}"</p>
          <a
            href="/busco-pieza"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Publicar solicitud de búsqueda →
          </a>
        </div>
      )}

      {parts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {count > perPage && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a
              href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              ← Anterior
            </a>
          )}
          {offset + perPage < count && (
            <a
              href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Siguiente →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function PackageIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}
