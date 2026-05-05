import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { Users, CheckCircle, Package, Crown } from "lucide-react";
import UserFilters from "@/components/admin/UserFilters";
import SubscriptionEditor from "@/components/admin/SubscriptionEditor";
import Link from "next/link";

interface SearchParams {
  q?: string;
  plan?: string;
}

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, plan } = await searchParams;
  const supabase = await createClient();

  // Fetch vendors con suscripciones y conteo de piezas
  let query = supabase
    .from("vendors")
    .select("id, company_name, email, whatsapp, city, is_active, created_at, subscriptions(id, plan, status, expires_at), parts(count)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`company_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: allVendors } = await query;

  // Filtrar por plan client-side (post-fetch)
  const vendors = plan && plan !== "all"
    ? allVendors?.filter((v) => {
        const sub = Array.isArray(v.subscriptions) ? v.subscriptions[0] : v.subscriptions;
        return sub?.plan === plan;
      })
    : allVendors;

  // Stats
  const total = allVendors?.length ?? 0;
  const activos = allVendors?.filter((v) => v.is_active).length ?? 0;
  const premium = allVendors?.filter((v) => {
    const sub = Array.isArray(v.subscriptions) ? v.subscriptions[0] : v.subscriptions;
    return sub?.plan === "premium";
  }).length ?? 0;
  const totalParts = allVendors?.reduce((acc, v) => {
    const count = Array.isArray(v.parts) ? (v.parts[0] as { count: number } | undefined)?.count ?? 0 : 0;
    return acc + count;
  }, 0) ?? 0;

  const planColors: Record<string, string> = {
    trial: "bg-amber-100 text-amber-700",
    basic: "bg-slate-100 text-slate-600",
    pro: "bg-blue-100 text-blue-700",
    premium: "bg-purple-100 text-purple-700",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Control de usuarios</h1>
        <p className="text-slate-500 text-sm mt-1">Gestión de vendedores y suscripciones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-blue-600" />
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-emerald-600" />
            <span className="text-xs text-slate-500">Activos</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{activos}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={14} className="text-purple-600" />
            <span className="text-xs text-slate-500">Premium</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{premium}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package size={14} className="text-orange-600" />
            <span className="text-xs text-slate-500">Piezas publicadas</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalParts}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4">
        <Suspense>
          <UserFilters />
        </Suspense>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {!vendors?.length ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            No se encontraron usuarios
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Negocio</th>
                <th className="px-4 py-3 text-left">Contacto</th>
                <th className="px-4 py-3 text-left">Piezas</th>
                <th className="px-4 py-3 text-left">Registro</th>
                <th className="px-4 py-3 text-left">Vencimiento</th>
                <th className="px-4 py-3 text-center">Estado / Plan</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors?.map((v) => {
                const sub = Array.isArray(v.subscriptions) ? v.subscriptions[0] : v.subscriptions;
                const partsCount = Array.isArray(v.parts)
                  ? (v.parts[0] as { count: number } | undefined)?.count ?? 0
                  : 0;
                const isExpired = sub?.expires_at && new Date(sub.expires_at) < new Date();

                return (
                  <tr
                    key={v.id}
                    className={`hover:bg-slate-50 transition-colors ${!v.is_active ? "opacity-50" : ""}`}
                  >
                    {/* Negocio */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{v.company_name}</p>
                      <p className="text-xs text-slate-400">{v.city}</p>
                    </td>

                    {/* Contacto */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600">{v.email}</p>
                      <p className="text-xs text-slate-400">{v.whatsapp}</p>
                    </td>

                    {/* Piezas */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-slate-700">{partsCount}</span>
                    </td>

                    {/* Registro */}
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(v.created_at).toLocaleDateString("es-AR")}
                    </td>

                    {/* Vencimiento */}
                    <td className="px-4 py-3">
                      {sub?.expires_at ? (
                        <span className={`text-xs ${isExpired ? "text-red-500 font-semibold" : "text-slate-400"}`}>
                          {isExpired ? "⚠ " : ""}
                          {new Date(sub.expires_at).toLocaleDateString("es-AR")}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>

                    {/* Estado / Plan */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <SubscriptionEditor
                          vendorId={v.id}
                          isActive={v.is_active}
                          subscriptionId={sub?.id}
                          currentPlan={sub?.plan ?? "trial"}
                          currentExpiry={sub?.expires_at}
                        />
                      </div>
                    </td>

                    {/* Acción rápida */}
                    <td className="px-4 py-3 text-center">
                      <a
                        href={`mailto:${v.email}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Email
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-3 text-right">
        {vendors?.length ?? 0} usuario{vendors?.length !== 1 ? "s" : ""} encontrado{vendors?.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
