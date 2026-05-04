import { createClient } from "@/lib/supabase/server";
import { Mail, Phone, Calendar, Building2 } from "lucide-react";

export default async function AdminContactsPage() {
  const supabase = await createClient();

  const { data: contacts } = await supabase
    .from("contact_requests")
    .select("*, part:parts(part_number, description), vendor:vendors(company_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Todas las consultas</h1>
        <p className="text-slate-500 text-sm mt-1">{contacts?.length ?? 0} consultas en la plataforma</p>
      </div>

      {!contacts?.length && (
        <div className="text-center py-16 text-slate-400">
          <p>No hay consultas todavía</p>
        </div>
      )}

      <div className="space-y-3">
        {contacts?.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-slate-900">{c.buyer_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {c.vendor && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Building2 size={11} />
                      {c.vendor.company_name}
                    </span>
                  )}
                  {c.part && (
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {c.part.part_number}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={12} />
                {new Date(c.created_at).toLocaleDateString("es-AR")}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <a href={`mailto:${c.buyer_email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Mail size={13} /> {c.buyer_email}
              </a>
              <a href={`tel:${c.buyer_phone}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <Phone size={13} /> {c.buyer_phone}
              </a>
            </div>
            {c.message && (
              <p className="mt-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{c.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
