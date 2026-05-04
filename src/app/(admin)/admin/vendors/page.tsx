import { createClient } from "@/lib/supabase/server";
import { Calendar } from "lucide-react";
import VendorActions from "@/components/admin/VendorActions";

export default async function AdminVendorsPage() {
  const supabase = await createClient();

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*, subscriptions(id, plan, status, expires_at)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Vendedores</h1>
        <p className="text-slate-500 text-sm mt-1">{vendors?.length ?? 0} registrados</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Negocio</th>
              <th className="px-4 py-3 text-left">Contacto</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Vence</th>
              <th className="px-4 py-3 text-center">Activo</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendors?.map((v) => {
              const sub = Array.isArray(v.subscriptions) ? v.subscriptions[0] : v.subscriptions;
              return (
                <tr key={v.id} className={`hover:bg-slate-50 ${!v.is_active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{v.company_name}</p>
                    <p className="text-xs text-slate-400">{v.city}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p className="text-xs">{v.email}</p>
                    <p className="text-xs text-slate-400">{v.whatsapp}</p>
                  </td>
                  <td className="px-4 py-3">
                    {sub ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        sub.plan === "pro" ? "bg-blue-100 text-blue-700" :
                        sub.plan === "basic" ? "bg-slate-100 text-slate-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {sub.plan}
                      </span>
                    ) : <span className="text-xs text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {sub?.expires_at ? (
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(sub.expires_at).toLocaleDateString("es-AR")}
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <VendorActions
                      vendorId={v.id}
                      isActive={v.is_active}
                      subscriptionId={sub?.id}
                      currentPlan={sub?.plan ?? "trial"}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={`mailto:${v.email}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Contactar
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
