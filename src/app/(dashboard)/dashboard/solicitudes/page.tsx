import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MessageCircle, Lock, Phone, Mail, Car } from "lucide-react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/utils/whatsapp";
import AiMatchButton from "@/components/dashboard/AiMatchButton";

export default async function SolicitudesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/register");

  // Verificar plan Premium
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, expires_at")
    .eq("vendor_id", vendor.id)
    .eq("status", "active")
    .single();

  const isPremium = subscription?.plan === "premium";

  if (!isPremium) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Solicitudes de compradores</h1>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-10 text-center">
          <Lock size={36} className="mx-auto text-purple-400 mb-4" />
          <h2 className="text-xl font-bold text-purple-800 mb-2">
            Función exclusiva del plan Premium
          </h2>
          <p className="text-purple-600 text-sm max-w-md mx-auto mb-6">
            Con Premium ves en tiempo real las solicitudes de compradores que buscan piezas de las marcas que trabajás. Contacto directo, sin intermediarios.
          </p>
          <Link
            href="/planes"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Conocer plan Premium
          </Link>
        </div>
      </div>
    );
  }

  // Obtener marcas del vendedor
  const { data: vendorBrands } = await supabase
    .from("vendor_brands")
    .select("brand")
    .eq("vendor_id", vendor.id);

  const brands = (vendorBrands ?? []).map((b) => b.brand);
  const isMultibrand = brands.includes("ALL");

  // Buscar solicitudes que coincidan
  let query = supabase
    .from("part_requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!isMultibrand && brands.length > 0) {
    query = query.in("brand", brands);
  } else if (!isMultibrand && brands.length === 0) {
    // Sin marcas configuradas
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Solicitudes de compradores</h1>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <p className="font-semibold text-amber-800 mb-2">Configurá tus marcas primero</p>
          <p className="text-sm text-amber-600 mb-4">
            Para ver solicitudes relevantes, indicá las marcas que trabajás en tu perfil.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
          >
            Configurar marcas
          </Link>
        </div>
      </div>
    );
  }

  const { data: requests } = await query;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Solicitudes de compradores</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isMultibrand
            ? "Todas las marcas"
            : `Filtrando por: ${brands.join(", ")}`}
          {" — "}{requests?.length ?? 0} solicitud{requests?.length !== 1 ? "es" : ""} activa{requests?.length !== 1 ? "s" : ""}
        </p>
      </div>

      {!requests?.length && (
        <div className="text-center py-16 text-slate-400">
          <MessageCircle size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600">No hay solicitudes activas por ahora</p>
          <p className="text-sm mt-1">Cuando un comprador busque una pieza de tus marcas, aparecerá acá</p>
        </div>
      )}

      <div className="space-y-3">
        {requests?.map((req) => {
          const waUrl = buildWhatsAppLink(
            req.buyer_phone,
            req.part_number || req.description
          );
          return (
            <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 rounded-lg p-2">
                    <Car size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {req.brand} {req.model} {req.year && `(${req.year})`}
                    </p>
                    {req.chassis && (
                      <p className="text-xs text-slate-400 font-mono">VIN: {req.chassis}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(req.created_at).toLocaleDateString("es-AR")}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4">
                {req.part_number && (
                  <p className="text-xs font-mono text-slate-500 mb-1">
                    Nro. parte: <span className="font-semibold text-slate-700">{req.part_number}</span>
                  </p>
                )}
                <p className="text-sm text-slate-700">{req.description}</p>
              </div>

              {/* Botón IA matching */}
              <div className="mb-4">
                <AiMatchButton requestId={req.id} vendorId={vendor.id} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">{req.buyer_name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <a href={`mailto:${req.buyer_email}`} className="flex items-center gap-1 hover:text-blue-600">
                      <Mail size={11} />{req.buyer_email}
                    </a>
                    <a href={`tel:${req.buyer_phone}`} className="flex items-center gap-1 hover:text-blue-600">
                      <Phone size={11} />{req.buyer_phone}
                    </a>
                  </div>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle size={14} />
                  Responder
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
