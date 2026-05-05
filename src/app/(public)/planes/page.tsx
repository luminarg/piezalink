import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes y precios — PiezaLink",
  description: "Publicá tu catálogo de repuestos en PiezaLink. 6 meses gratis, sin tarjeta de crédito.",
};

export default async function PlanesPage() {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          <Zap size={14} />
          6 meses gratis al registrarte
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Planes simples y transparentes
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Probá PiezaLink durante 6 meses sin costo. Después elegís el plan que mejor se adapta a tu negocio.
        </p>
      </div>

      {/* Trial banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center mb-10">
        <p className="text-xl font-bold mb-1">🎉 Registrate hoy — 6 meses completamente gratis</p>
        <p className="text-blue-100 text-sm mb-4">Sin tarjeta de crédito. Sin compromisos. Cancelá cuando quieras.</p>
        <Link
          href="/register"
          className="inline-block bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Empezar gratis
        </Link>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(plans ?? []).map((plan) => {
          const features = Array.isArray(plan.features) ? plan.features : [];
          const borderColor =
            plan.slug === "pro"
              ? "border-blue-500"
              : plan.slug === "premium"
              ? "border-purple-400"
              : "border-slate-200";

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${borderColor} ${
                plan.is_highlighted ? "shadow-lg shadow-blue-100" : ""
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-slate-500 mb-3">{plan.description}</p>
                <p className="text-2xl font-bold text-slate-700">{plan.price}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`w-full text-center py-3 rounded-xl font-semibold transition-colors ${
                  plan.is_highlighted
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-14 text-center">
        <p className="text-slate-500 text-sm">
          ¿Preguntas?{" "}
          <a href="mailto:contacto@piezalink.com" className="text-blue-600 hover:underline">
            Contactanos
          </a>
        </p>
      </div>
    </div>
  );
}
