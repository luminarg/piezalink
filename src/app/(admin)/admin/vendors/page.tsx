import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle, Calendar } from "lucide-react";

export default async function AdminVendorsPage() {
  const supabase = await createClient();

  const { data: vendors } = await supabase
    .from("vendors")
    .select("*, subscriptions(plan, status, expires_at)")
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
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vendors?.map((v) => {
              const sub = Array.isArray(v.subscriptions) ? v.subscriptions[0] : v.subscriptions;
              return (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{v.company_name}</p>
                    <p className="text-xs text-slate-400">{v.city}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{v.email}</p>
                    <p className="text-xs text-slate-400">{v.whatsapp}</p>
                  </td>
                  <td className="px-4 py-3">
                    {sub && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        sub.plan === "pro" ? "bg-blue-100 text-blue-700" :
                        sub.plan === "basic" ? "bg-slate-100 text-slate-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {sub.plan}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {v.is_active ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs">
                        <CheckCircle size={12} /> Activo
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs">
                        <XCircle size={12} /> Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(v.created_at).toLocaleDateString("es-AR")}
                    </div>
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
