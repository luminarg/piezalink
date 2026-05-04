import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VendorSettingsForm from "@/components/dashboard/VendorSettingsForm";

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

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("vendor_id", vendor.id)
    .eq("status", "active")
    .single();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
        <p className="text-slate-500 text-sm mt-1">
          Actualizá los datos de tu negocio
        </p>
      </div>

      {/* Suscripción */}
      {subscription && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Plan actual</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Vence: {new Date(subscription.expires_at).toLocaleDateString("es-AR")}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              subscription.plan === "pro"
                ? "bg-blue-100 text-blue-700"
                : subscription.plan === "basic"
                ? "bg-slate-100 text-slate-600"
                : "bg-amber-100 text-amber-700"
            }`}>
              {subscription.plan === "trial" ? "Trial" : subscription.plan === "basic" ? "Basic" : "Pro"}
            </span>
          </div>
        </div>
      )}

      <VendorSettingsForm vendor={vendor} />
    </div>
  );
}
