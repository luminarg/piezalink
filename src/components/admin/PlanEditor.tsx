"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Check, Pencil, X, Plus, Trash2 } from "lucide-react";

interface Plan {
  id: string;
  slug: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  badge: string;
  is_highlighted: boolean;
  cta: string;
  is_active: boolean;
}

export default function PlanEditor({ plan }: { plan: Plan }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState({ ...plan });
  const router = useRouter();

  const set = (field: keyof Plan, value: unknown) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const addFeature = () => set("features", [...data.features, ""]);

  const updateFeature = (i: number, value: string) =>
    set("features", data.features.map((f, idx) => (idx === i ? value : f)));

  const removeFeature = (i: number) =>
    set("features", data.features.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("plans")
      .update({
        name: data.name,
        price: data.price,
        description: data.description,
        features: data.features.filter((f) => f.trim()),
        badge: data.badge,
        is_highlighted: data.is_highlighted,
        cta: data.cta,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", plan.id);

    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  };

  const planColors: Record<string, string> = {
    basic: "border-slate-300",
    pro: "border-blue-400",
    premium: "border-purple-400",
  };

  if (!editing) {
    return (
      <div className={`bg-white rounded-2xl border-2 ${planColors[plan.slug] ?? "border-slate-200"} p-6 relative`}>
        {!data.is_active && (
          <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
            <span className="text-sm text-slate-400 font-semibold">Inactivo</span>
          </div>
        )}
        {data.badge && (
          <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-0.5 rounded-full mb-3">
            {data.badge}
          </span>
        )}
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-900">{data.name}</h3>
          <button
            onClick={() => setEditing(true)}
            className="text-slate-400 hover:text-blue-600 transition-colors"
            title="Editar plan"
          >
            <Pencil size={15} />
          </button>
        </div>
        <p className="text-xl font-bold text-slate-700 mb-1">{data.price}</p>
        <p className="text-sm text-slate-500 mb-4">{data.description}</p>
        <ul className="space-y-1.5 mb-4">
          {data.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-100 pt-3 text-xs text-slate-400">
          CTA: <span className="font-medium text-slate-600">{data.cta}</span>
          {saved && <span className="ml-2 text-emerald-600 font-semibold">✓ Guardado</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border-2 ${planColors[plan.slug] ?? "border-slate-200"} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">Editando: {plan.slug}</h3>
        <button onClick={() => { setEditing(false); setData({ ...plan }); }} className="text-slate-400 hover:text-red-500">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Nombre */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Nombre</label>
          <input
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Precio */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Precio</label>
          <input
            value={data.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="Ej: $15.000/mes, A definir..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Descripción corta</label>
          <input
            value={data.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Badge */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Badge (opcional)</label>
          <input
            value={data.badge}
            onChange={(e) => set("badge", e.target.value)}
            placeholder='Ej: "Más popular"'
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* CTA */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Texto del botón</label>
          <input
            value={data.cta}
            onChange={(e) => set("cta", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Features */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Características</label>
          <div className="space-y-1.5">
            {data.features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={f}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeFeature(i)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={addFeature}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
            >
              <Plus size={12} /> Agregar característica
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={data.is_highlighted}
              onChange={(e) => set("is_highlighted", e.target.checked)}
              className="rounded"
            />
            Destacado
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={data.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="rounded"
            />
            Activo
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}
