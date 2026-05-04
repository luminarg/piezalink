import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Eye, MessageCircle, Package, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/register");

  const vendorId = vendor.id;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Métricas en paralelo
  const [
    { count: totalParts },
    { count: totalViews },
    { count: totalClicks },
    { count: totalContacts },
    { count: viewsWeek },
    { count: clicksWeek },
  ] = await Promise.all([
    supabase.from("parts").select("*", { count: "exact", head: true }).eq("vendor_id", vendorId).eq("is_active", true),
    supabase.from("part_events").select("*", { count: "exact", head: true }).eq("vendor_id", vendorId).eq("event_type", "view"),
    supabase.from("part_events").select("*", { count: "exact", head: true }).eq("vendor_id", vendorId).eq("event_type", "whatsapp_click"),
    supabase.from("contact_requests").select("*", { count: "exact", head: true }).eq("vendor_id", vendorId),
    supabase.from("part_events").select("*", { count: "exact", head: true }).eq("vendor_id", vendorId).eq("event_type", "view").gte("created_at", sevenDaysAgo),
    supabase.from("part_events").select("*", { count: "exact", head: true }).eq("vendor_id", vendorId).eq("event_type", "whatsapp_click").gte("created_at", sevenDaysAgo),
  ]);

  const metrics = [
    {
      label: "Piezas publicadas",
      value: totalParts ?? 0,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Vistas totales",
      value: totalViews ?? 0,
      icon: Eye,
      color: "text-purple-600",
      bg: "bg-purple-50",
      sub: `+${viewsWeek ?? 0} esta semana`,
    },
    {
      label: "Clicks WhatsApp",
      value: totalClicks ?? 0,
      icon: MessageCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: `+${clicksWeek ?? 0} esta semana`,
    },
    {
      label: "Consultas recibidas",
      value: totalContacts ?? 0,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Resumen</h1>
        <p className="text-slate-500 text-sm mt-1">
          Así está rindiendo tu catálogo en PiezaLink
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{m.label}</span>
              <div className={`${m.bg} p-2 rounded-lg`}>
                <m.icon size={16} className={m.color} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{m.value}</div>
            {m.sub && (
              <div className="text-xs text-emerald-600 font-medium mt-1">{m.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/dashboard/parts/import"
            className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <div className="bg-blue-50 group-hover:bg-blue-100 p-2 rounded-lg transition-colors">
              <Package size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Importar Excel</p>
              <p className="text-xs text-slate-400">Subir stock masivo</p>
            </div>
          </a>
          <a
            href="/dashboard/parts/new"
            className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <div className="bg-blue-50 group-hover:bg-blue-100 p-2 rounded-lg transition-colors">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Agregar pieza</p>
              <p className="text-xs text-slate-400">Alta manual</p>
            </div>
          </a>
          <a
            href="/dashboard/contacts"
            className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
          >
            <div className="bg-blue-50 group-hover:bg-blue-100 p-2 rounded-lg transition-colors">
              <MessageCircle size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Ver consultas</p>
              <p className="text-xs text-slate-400">{totalContacts ?? 0} recibidas</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
