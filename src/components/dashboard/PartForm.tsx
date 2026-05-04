"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface PartFormProps {
  initialData?: {
    id: string;
    part_number: string;
    description: string;
    compatibility: string;
    stock_quantity: number;
    brand?: string;
    category?: string;
  };
}

export default function PartForm({ initialData }: PartFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [form, setForm] = useState({
    part_number: initialData?.part_number || "",
    description: initialData?.description || "",
    compatibility: initialData?.compatibility || "",
    stock_quantity: initialData?.stock_quantity ?? 0,
    brand: initialData?.brand || "",
    category: initialData?.category || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();

    if (isEditing) {
      const { error } = await supabase
        .from("parts")
        .update({ ...form, brand: form.brand || null, category: form.category || null })
        .eq("id", initialData.id);

      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      // Obtener vendor_id del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("No autorizado"); setSaving(false); return; }

      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!vendor) { setError("Perfil de vendedor no encontrado"); setSaving(false); return; }

      const { error } = await supabase.from("parts").insert({
        vendor_id: vendor.id,
        part_number: form.part_number,
        description: form.description,
        compatibility: form.compatibility,
        stock_quantity: Number(form.stock_quantity),
        brand: form.brand || null,
        category: form.category || null,
        is_active: true,
      });

      if (error) { setError(error.message); setSaving(false); return; }
    }

    router.push("/dashboard/parts");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Número de pieza *
          </label>
          <input
            required
            value={form.part_number}
            onChange={(e) => set("part_number", e.target.value)}
            placeholder="ABC-1234"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stock *</label>
          <input
            required
            type="number"
            min="0"
            value={form.stock_quantity}
            onChange={(e) => set("stock_quantity", parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
          <input
            required
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Filtro de aceite original Toyota"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Compatibilidad *</label>
          <textarea
            required
            rows={2}
            value={form.compatibility}
            onChange={(e) => set("compatibility", e.target.value)}
            placeholder="Toyota Corolla 2010-2020, Toyota RAV4 2012-2018"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
          <input
            value={form.brand}
            onChange={(e) => set("brand", e.target.value)}
            placeholder="Toyota"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="Filtros, Frenos, Motor..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar pieza"}
        </button>
      </div>
    </form>
  );
}
