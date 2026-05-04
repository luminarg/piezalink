import { createClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";
import PartCard from "@/components/parts/PartCard";
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

  if (query) {
    const { data, count: total } = await supabase
      .from("parts")
      .select("*, vendor:vendors(id, company_name, whatsapp, city)", { count: "exact" })
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .or(
        `part_number.ilike.%${query}%,description.ilike.%${query}%,compatibility.ilike.%${query}%,brand.ilike.%${query}%`
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + perPage - 1);

    parts = (data as Part[]) || [];
    count = total || 0;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Buscador */}
      <form method="GET" className="flex gap-2 max-w-2xl mb-8">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Número de pieza, marca, modelo..."
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

      {/* Resultados */}
      {query && (
        <div className="mb-4 text-sm text-slate-500">
          {count > 0
            ? `${count} resultado${count !== 1 ? "s" : ""} para "${query}"`
            : `Sin resultados para "${query}"`}
        </div>
      )}

      {!query && (
        <div className="text-center py-20 text-slate-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>Ingresá un número de pieza, marca o modelo para buscar</p>
        </div>
      )}

      {query && parts.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600 mb-1">Sin resultados</p>
          <p className="text-sm">Probá con otro número de pieza o descripción</p>
        </div>
      )}

      {parts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parts.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      )}
    </div>
  );
}

function Package({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}
