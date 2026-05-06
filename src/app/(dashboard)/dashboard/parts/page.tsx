import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileUp, Package, Eye, Pencil } from "lucide-react";
import PartToggle from "@/components/dashboard/PartToggle";

export default async function PartsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/register");

  const { data: parts } = await supabase
    .from("parts")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis piezas</h1>
          <p className="text-slate-500 text-sm mt-1">
            {parts?.length ?? 0} pieza{parts?.length !== 1 ? "s" : ""} publicada{parts?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/parts/import"
            className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <FileUp size={15} />
            <span className="hidden sm:inline">Importar Excel</span>
            <span className="sm:hidden">Excel</span>
          </Link>
          <Link
            href="/dashboard/parts/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Agregar pieza</span>
            <span className="sm:hidden">Agregar</span>
          </Link>
        </div>
      </div>

      {(!parts || parts.length === 0) && (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
          <Package size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="font-medium text-slate-600 mb-1">Todavia no tenes piezas publicadas</p>
          <p className="text-sm text-slate-400 mb-6 px-4">Podes agregar piezas una por una o importar tu catalogo desde Excel</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/dashboard/parts/import"
              className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <FileUp size={15} />
              Importar Excel
            </Link>
            <Link
              href="/dashboard/parts/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Agregar pieza
            </Link>
          </div>
        </div>
      )}

      {parts && parts.length > 0 && (
        <>
          <div className="space-y-3 sm:hidden">
            {parts.map((part) => (
              <div
                key={part.id}
                className={"bg-white rounded-xl border border-slate-200 p-4" + (!part.is_active ? " opacity-50" : "")}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-blue-700 mb-1">
                      {part.part_number}
                    </p>
                    <p className="text-sm font-medium text-slate-800 leading-snug">
                      {part.description}
                    </p>
                    {part.category && (
                      <p className="text-xs text-slate-400 mt-0.5">{part.category}</p>
                    )}
                  </div>
                  <PartToggle partId={part.id} isActive={part.is_active} />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                  {part.brand && (
                    <span><span className="text-slate-400">Marca:</span> {part.brand}</span>
                  )}
                  <span>
                    <span className="text-slate-400">Stock:</span>{" "}
                    <span className={part.stock_quantity === 0 ? "text-red-500 font-semibold" : "font-semibold text-slate-700"}>
                      {part.stock_quantity}
                    </span>
                  </span>
                </div>

                {part.compatibility && (
                  <p className="text-xs text-slate-400 mt-1.5 truncate">{part.compatibility}</p>
                )}

                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <Link
                    href={"/parts/" + (part.slug || part.id)}
                    target="_blank"
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors"
                  >
                    <Eye size={13} />
                    Ver
                  </Link>
                  <Link
                    href={"/dashboard/parts/" + part.id + "/edit"}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <Pencil size={13} />
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Nro. Pieza</th>
                    <th className="px-4 py-3 text-left">Descripcion</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Compatibilidad</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Marca</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parts.map((part) => (
                    <tr key={part.id} className={"hover:bg-slate-50" + (!part.is_active ? " opacity-50" : "")}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                        {part.part_number}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs">
                        <p className="truncate">{part.description}</p>
                        {part.category && (
                          <span className="text-xs text-slate-400">{part.category}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate text-xs hidden lg:table-cell">
                        {part.compatibility}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={part.stock_quantity === 0 ? "font-semibold text-red-500" : "font-semibold text-slate-800"}>
                          {part.stock_quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{part.brand || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <PartToggle partId={part.id} isActive={part.is_active} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={"/parts/" + (part.slug || part.id)}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Ver en el sitio"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            href={"/dashboard/parts/" + part.id + "/edit"}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
