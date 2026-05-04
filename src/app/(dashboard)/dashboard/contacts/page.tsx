import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageSquare, Phone, Mail, Calendar } from "lucide-react";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/register");

  const { data: contacts } = await supabase
    .from("contact_requests")
    .select("*, part:parts(part_number, description)")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Consultas recibidas</h1>
        <p className="text-slate-500 text-sm mt-1">
          {contacts?.length ?? 0} consulta{contacts?.length !== 1 ? "s" : ""} en total
        </p>
      </div>

      {!contacts?.length && (
        <div className="text-center py-16 text-slate-400">
          <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600">Todavía no recibiste consultas</p>
          <p className="text-sm mt-1">Cuando alguien complete el formulario de contacto, aparecerá acá</p>
        </div>
      )}

      {contacts && contacts.length > 0 && (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{c.buyer_name}</p>
                  {c.part && (
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block">
                      {c.part.part_number} — {c.part.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar size={12} />
                  {new Date(c.created_at).toLocaleDateString("es-AR")}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <a href={`mailto:${c.buyer_email}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Mail size={13} />
                  {c.buyer_email}
                </a>
                <a href={`tel:${c.buyer_phone}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Phone size={13} />
                  {c.buyer_phone}
                </a>
              </div>
              {c.message && (
                <p className="mt-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                  {c.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
