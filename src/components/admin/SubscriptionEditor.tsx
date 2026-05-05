"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, ChevronDown } from "lucide-react";

interface Props {
  vendorId: string;
  isActive: boolean;
  subscriptionId?: string;
  currentPlan: string;
  currentExpiry?: string;
}

const PLANS = ["trial", "basic", "pro", "premium"];

const planColors: Record<string, string> = {
  trial: "bg-amber-100 text-amber-700",
  basic: "bg-slate-100 text-slate-600",
  pro: "bg-blue-100 text-blue-700",
  premium: "bg-purple-100 text-purple-700",
};

export default function SubscriptionEditor({
  vendorId,
  isActive,
  subscriptionId,
  currentPlan,
  currentExpiry,
}: Props) {
  const [active, setActive] = useState(isActive);
  const [plan, setPlan] = useState(currentPlan);
  const [expiry, setExpiry] = useState(
    currentExpiry ? currentExpiry.split("T")[0] : ""
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const toggleActive = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("vendors").update({ is_active: !active }).eq("id", vendorId);
    setActive(!active);
    setSaving(false);
    router.refresh();
  };

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    const expiresAt = expiry ? new Date(expiry).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    if (subscriptionId) {
      await supabase
        .from("subscriptions")
        .update({ plan, status: "active", expires_at: expiresAt })
        .eq("id", subscriptionId);
    } else {
      await supabase.from("subscriptions").insert({
        vendor_id: vendorId,
        plan,
        status: "active",
        expires_at: expiresAt,
      });
    }

    setSaving(false);
    setSaved(true);
    setOpen(false);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  };

  return (
    <div className="relative">
      {/* Toggle activo */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleActive}
          disabled={saving}
          title={active ? "Desactivar usuario" : "Activar usuario"}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
            active ? "bg-emerald-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              active ? "translate-x-4" : "translate-x-1"
            }`}
          />
        </button>

        {/* Badge plan + botón editar */}
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
            planColors[plan] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {saved ? <Check size={10} /> : null}
          {plan}
          <ChevronDown size={10} />
        </button>
      </div>

      {/* Dropdown editor */}
      {open && (
        <div className="absolute right-0 top-8 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-4 w-64">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Editar suscripción</p>

          {/* Plan */}
          <div className="mb-3">
            <label className="text-xs text-slate-500 mb-1 block">Plan</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PLANS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`text-xs py-1.5 rounded-lg border font-medium capitalize transition-colors ${
                    plan === p
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha de vencimiento */}
          <div className="mb-4">
            <label className="text-xs text-slate-500 mb-1 block">Vence el</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
