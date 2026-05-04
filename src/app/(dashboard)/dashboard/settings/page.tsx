import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendorSettingsForm from "@/components/dashboard/VendorSettingsForm";
import BrandsSelector from "@/components/dashboard/BrandsSelector";
import Link from "next/link";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/register");

  const [{ data: subscription }, { data: vendorBrands }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("vendor_id", vendor.id)
      .eq("status", "active")
      .single(),
    supabase
      .from("vendor_brands")
      .select("brand")
      .eq("vendor_id", vendor.id),
  ]);

  const initialBrands = (vendorBrands ?? []).map((b) => b.brand);
  const isPremium = subscription?.plan === "premium";

  const planColors: Record<string, string> = {
    trial: "bg-amber-100 text-amber-700",
    basic: "bg-slate-100 text-slate-600",
    pro: "bg-blue-100 text-blue-700",
    premium: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
        <p className="text-slate-500 text-sm mt-1">Actualizá los datos de tu negocio</p>
      </div>

      {/* Plan */}
      {subscription && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Plan actual</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Vence: {new Date(subscription.expires_at).toLocaleDateString("es-AR")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                planColors[subscription.plan] ?? "bg-slate-100 text-slate-600"
              }`}>
                {subscription.plan}
              </span>
              <Link href="/planes" className="text-xs text-blue-600 hover:underline">
                Ver planes
              </Link>
            </div>
          </div>
        </div>
      )}

      <VendorSettingsForm vendor={vendor} />

      {/* Marcas — visible para todos, pero resalta el beneficio Premium */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-slate-900">Especialidad de marcas</h2>
          {!isPremium && (
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </div>
        {isPremium ? (
          <BrandsSelector vendorId={vendor.id} initialBrands={initialBrands} />
        ) : (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <p className="font-semibold text-purple-800 mb-1">
              Recibí solicitudes de compradores en tu especialidad
            </p>
            <p className="text-sm text-purple-600 mb-4">
              Con el plan Premium podés configurar las marcas que trabajás y recibir alertas cuando un comprador busca una pieza de esas marcas.
            </p>
            <Link
              href="/planes"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Conocer plan Premium
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
