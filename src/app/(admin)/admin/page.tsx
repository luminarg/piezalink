import { createClient } from "@/lib/supabase/server";
import { Users, Package, Eye, MessageCircle, Crown, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalVendors },
    { count: activeVendors },
    { count: totalParts },
    { count: totalViews },
    { count: totalClicks },
    { count: totalRequests },
    { count: newVendorsMonth },
    { data: subscriptionsByPlan },
    { data: expiringSoon },
    { data: recentVendors },
  ] = await Promise.all([
    supabase.from("vendors").select("*", { count: "exact", head: true }),
    supabase.from("vendors").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("parts").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("part_events").select("*", { count: "exact", head: true }).eq("event_type", "view"),
    supabase.from("part_events").select("*", { count: "exact", head: true }).eq("event_type", "whatsapp_click"),
    supabase.from("part_requests").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("vendors").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("subscriptions").select("plan").eq("status", "active"),
    supabase
      .from("subscriptions")
      .select("vendor_id, plan, expires_at, vendors(company_name, email)")
      .eq("status", "active")
      .lte("expires_at", thirtyDaysFromNow)
      .gte("expires_at", now.toISOString())
      .order("expires_at", { ascending: true })
      .limit(5),
    supabase
      .from("vendors")
      .select("id, company_name, email, created_at, subscriptions(plan)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Agrupar suscripciones por plan
  const planCounts = (subscriptionsByPlan ?? []).reduce(
    (acc, s) => {
      acc[s.plan] = (acc[s.plan] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const planColors: Record<string, string> = {
    trial: "bg-amber-100 text-amber-700",
    basic: "bg-slate-100 text-slate-600",
    pro: "bg-blue-100 text-blue-700",
    premium: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resumen global</h1>
        <p className="text-slate-500 text-sm mt-1">Métricas de toda la plataforma</p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">Vendedores</span>
            <div className="bg-blue-50 p-2 rounded-lg"><Users size={16} className="text-blue-600" /></div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalVendors ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">{activeVendors ?? 0} activos · +{newVendorsMonth ?? 0} este mes</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">Piezas publicadas</span>
            <div className="bg-purple-50 p-2 rounded-lg"><Package size={16} className="text-purple-600" /></div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalParts ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">en stock activo</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">Vistas totales</span>
            <div className="bg-orange-50 p-2 rounded-lg"><Eye size={16} className="text-orange-600" /></div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalViews ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">{totalClicks ?? 0} clicks WhatsApp</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">Busco Pieza</span>
            <div className="bg-emerald-50 p-2 rounded-lg"><MessageCircle size={16} className="text-emerald-600" /></div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalRequests ?? 0}</div>
          <div className="text-xs text-slate-400 mt-1">solicitudes abiertas</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suscripciones por plan */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={15} className="text-purple-600" />
            <h2 className="font-semibold text-slate-900">Suscripciones activas</h2>
          </div>
          <div className="space-y-3">
            {["premium", "pro", "basic", "trial"].map((plan) => {
              const count = planCounts[plan] ?? 0;
              const total = Object.values(planCounts).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${planColors[plan]}`}>
                      {plan}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        plan === "premium" ? "bg-purple-400" :
                        plan === "pro" ? "bg-blue-400" :
                        plan === "basic" ? "bg-slate-400" : "bg-amber-300"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-slate-400 pt-1">
              Total activas: {Object.values(planCounts).reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>

        {/* Vencimientos próximos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-amber-500" />
            <h2 className="font-semibold text-slate-900">Vencen en 30 días</h2>
          </div>
          {!expiringSoon?.length ? (
            <p className="text-sm text-slate-400 py-4 text-center">Ninguna suscripción por vencer</p>
          ) : (
            <div className="space-y-3">
              {expiringSoon.map((s, i) => {
                const vendorData = Array.isArray(s.vendors) ? s.vendors[0] : s.vendors;
                const daysLeft = Math.ceil(
                  (new Date(s.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{vendorData?.company_name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize ${planColors[s.plan] ?? ""}`}>
                        {s.plan}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold ${daysLeft <= 7 ? "text-red-500" : "text-amber-500"}`}>
                      {daysLeft}d
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/admin/usuarios" className="text-xs text-blue-600 hover:underline mt-3 block">
            Ver todos los usuarios →
          </Link>
        </div>

        {/* Registros recientes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">Últimos registros</h2>
          </div>
          {!recentVendors?.length ? (
            <p className="text-sm text-slate-400 py-4 text-center">Sin registros aún</p>
          ) : (
            <div className="space-y-3">
              {recentVendors.map((v) => {
                const sub = Array.isArray(v.subscriptions) ? v.subscriptions[0] : v.subscriptions;
                return (
                  <div key={v.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{v.company_name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(v.created_at).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    {sub?.plan && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${planColors[sub.plan] ?? ""}`}>
                        {sub.plan}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/admin/usuarios" className="text-xs text-blue-600 hover:underline mt-3 block">
            Ver todos →
          </Link>
        </div>
      </div>
    </div>
  );
}
