import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import AdToggle from "@/components/admin/AdToggle";

const POSITION_LABELS: Record<string, string> = {
  home_top: "Home — Banner superior",
  search_top: "Búsqueda — Banner superior",
  search_sidebar: "Búsqueda — Lateral",
};

export default async function AdminAdsPage() {
  const supabase = await createClient();

  const { data: ads } = await supabase
    .from("ad_spaces")
    .select("*, vendor:vendors(company_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Espacios publicitarios</h1>
          <p className="text-slate-500 text-sm mt-1">{ads?.length ?? 0} anuncios creados</p>
        </div>
        <Link
          href="/admin/ads/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          Nuevo anuncio
        </Link>
      </div>

      {!ads?.length && (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
          <p className="font-medium text-slate-600 mb-1">No hay anuncios todavía</p>
          <p className="text-sm mb-4">Creá espacios publicitarios para vendedores</p>
          <Link
            href="/admin/ads/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Crear primer anuncio
          </Link>
        </div>
      )}

      {ads && ads.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Posición</th>
                <th className="px-4 py-3 text-left">Vendedor</th>
                <th className="px-4 py-3 text-left">Vence</th>
                <th className="px-4 py-3 text-center">Activo</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ads.map((ad) => (
                <tr key={ad.id} className={`hover:bg-slate-50 ${!ad.is_active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">{ad.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      {POSITION_LABELS[ad.position] ?? ad.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {ad.vendor?.company_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(ad.expires_at).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AdToggle adId={ad.id} isActive={ad.is_active} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/admin/ads/${ad.id}/edit`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
