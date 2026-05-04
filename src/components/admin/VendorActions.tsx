"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  vendorId: string;
  isActive: boolean;
  subscriptionId?: string;
  currentPlan: string;
}

const PLANS = ["trial", "basic", "pro"];

export default function VendorActions({ vendorId, isActive, subscriptionId, currentPlan }: Props) {
  const [active, setActive] = useState(isActive);
  const [plan, setPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleActive = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("vendors").update({ is_active: !active }).eq("id", vendorId);
    setActive(!active);
    setLoading(false);
    router.refresh();
  };

  const changePlan = async (newPlan: string) => {
    setLoading(true);
    const supabase = createClient();
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);

    if (subscriptionId) {
      await supabase
        .from("subscriptions")
        .update({ plan: newPlan, status: "active", expires_at: expires.toISOString() })
        .eq("id", subscriptionId);
    } else {
      await supabase.from("subscriptions").insert({
        vendor_id: vendorId,
        plan: newPlan,
        status: "active",
        expires_at: expires.toISOString(),
      });
    }

    setPlan(newPlan);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Toggle activo */}
      <button
        onClick={toggleActive}
        disabled={loading}
        title={active ? "Desactivar" : "Activar"}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
          active ? "bg-emerald-500" : "bg-slate-300"
        }`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-4" : "translate-x-1"
        }`} />
      </button>

      {/* Selector de plan */}
      <select
        value={plan}
        onChange={(e) => changePlan(e.target.value)}
        disabled={loading}
        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
      >
        {PLANS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
}
