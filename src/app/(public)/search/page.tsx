import { createClient } from "@/lib/supabase/server";
import { Search, Sparkles, MessageCircleQuestion } from "lucide-react";
import Link from "next/link";
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

  if (query) {
    aiParsed = await parseSearchQuery(query);

    const now = new Date().toISOString();
    const { data: activeVendorIds } = await supabase
      .from("subscriptions")
      .select("vendor_id")
      .eq("status", "active")
      .gt("expires_at", now);

    let vendorIds = (activeVendorIds ?? []).map((s) => s.vendor_id);

    if (vendorIds.length === 0) {
      const { data: allActiveVendors } = await supabase
        .from("vendors")
        .select("id")
        .eq("is_active", true);
      vendorIds = (allActiveVendors ?? []).map((v) => v.id);
    }

    if (vendorIds.length > 0) {
      const allKeywords = [
        query,
        ...(aiParsed?.keywords ?? []),
        aiParsed?.part_type,
      ].filter(Boolean) as string[];

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

      if (aiParsed?.brand) {
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
            placeholder="Numero de pieza, marca, modelo, descripcion..."
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
            Busqueda inteligente:{" "}
            {[aiParsed.brand, aiParsed.model, aiParsed.year, aiParsed.part_type]
              .filter(Boolean)
              .join(" - ")}
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

      {/* Empty state sin query */}
      {!query && (
        <div className="text-center py-16 text-slate-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600 mb-1">Busca cualquier repuesto</p>
          <p className="text-sm mb-6">Podes escribir el numero de pieza, la descripcion o el vehiculo</p>
          <p className="text-xs text-purple-500 flex items-center justify-center gap-1 mb-8">
            <Sparkles size={11} /> Busqueda con inteligencia artificial
          </p>

          {/* CTA busco pieza desde empty */}
          <div className="max-w-sm mx-auto bg-orange-50 border border-orange-200 rounded-2xl p-6">
            <MessageCircleQuestion size={28} className="text-orange-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-800 mb-1">No encontras lo que buscas?</p>
            <p className="text-sm text-slate-500 mb-4">
              Publica tu solicitud y los vendedores especializados te contactan.
            </p>
            <Link
              href="/busco-pieza"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <MessageCircleQuestion size={15} />
              Publicar mi busqueda
            </Link>
          </div>
        </div>
      )}

      {/* Empty state con query — sin resultados */}
      {query && parts.length === 0 && (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
            <MessageCircleQuestion size={40} className="text-orange-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              No encontramos "{query}"
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Pero podes publicar tu solicitud y los vendedores especializados te contactan directamente por WhatsApp.
            </p>
            <Link
              href={"/busco-pieza?q=" + encodeURIComponent(query)}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <MessageCircleQuestion size={17} />
              Publicar solicitud de busqueda
            </Link>
            <p className="text-xs text-slate-400 mt-4">Gratis para compradores. Sin registro.</p>
          </div>
        </div>
      )}

      {/* Grid de resultados */}
      {parts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parts.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>

          {/* Banner "No encontraste lo que buscabas" al final */}
          <div className="mt-10 bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="font-semibold text-slate-800 mb-1">No encontraste exactamente lo que buscabas?</p>
              <p className="text-sm text-slate-500">
                Publica tu solicitud y los vendedores te contactan con lo que tienen disponible.
              </p>
            </div>
            <Link
              href={"/busco-pieza?q=" + encodeURIComponent(query)}
              className="shrink-0 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
            >
              <MessageCircleQuestion size={15} />
              Publicar busqueda
            </Link>
          </div>
        </>
      )}

      {/* Paginacion */}
      {count > perPage && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a
              href={"/search?q=" + encodeURIComponent(query) + "&page=" + (page - 1)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Anterior
            </a>
          )}
          {offset + perPage < count && (
            <a
              href={"/search?q=" + encodeURIComponent(query) + "&page=" + (page + 1)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Siguiente
            </a>
          )}
        </div>
      )}
    </div>
  );
}
