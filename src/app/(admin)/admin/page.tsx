import { createClient } from "@/lib/supabase/server";
import { Users, Package, Eye, MessageCircle } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalVendors },
    { count: activeVendors },
    { count: totalParts },
    { count: totalViews },
    { count: totalClicks },
    { count: totalContacts },
  ] = await Promise.all([
    supabase.from("vendors").select("*", { count: "exact", head: true }),
    supabase.from("vendors").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("parts").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("part_events").select("*", { count: "exact", head: true }).eq("event_type", "view"),
    supabase.from("part_events").select("*", { count: "exact", head: true }).eq("event_type", "whatsapp_click"),
    supabase.from("contact_requests").select("*", { count: "exact", head: true }),
  ]);

  const metrics = [
    { label: "Vendedores totales", value: totalVendors ?? 0, sub: `${activeVendors ?? 0} activos`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Piezas publicadas", value: totalParts ?? 0, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Vistas totales", value: totalViews ?? 0, icon: Eye, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Clicks WhatsApp", value: totalClicks ?? 0, sub: `${totalContacts ?? 0} consultas de formulario`, icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Resumen global</h1>
        <p className="text-slate-500 text-sm mt-1">Métricas de toda la plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{m.label}</span>
              <div className={`${m.bg} p-2 rounded-lg`}>
                <m.icon size={16} className={m.color} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">{m.value}</div>
            {m.sub && <div className="text-xs text-slate-400 mt-1">{m.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
