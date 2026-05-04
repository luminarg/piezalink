"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdFormProps {
  initialData?: {
    id: string;
    title: string;
    position: string;
    image_url: string;
    link_url: string;
    expires_at: string;
    vendor_id?: string;
  };
}

const POSITIONS = [
  { value: "home_top", label: "Home — Banner superior" },
  { value: "search_top", label: "Búsqueda — Banner superior" },
  { value: "search_sidebar", label: "Búsqueda — Lateral" },
];

export default function AdForm({ initialData }: AdFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const defaultExpiry = new Date();
  defaultExpiry.setMonth(defaultExpiry.getMonth() + 1);

  const [form, setForm] = useState({
    title: initialData?.title || "",
    position: initialData?.position || "home_top",
    image_url: initialData?.image_url || "",
    link_url: initialData?.link_url || "",
    expires_at: initialData?.expires_at
      ? new Date(initialData.expires_at).toISOString().split("T")[0]
      : defaultExpiry.toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const payload = {
      ...form,
      expires_at: new Date(form.expires_at).toISOString(),
      is_active: true,
    };

    if (isEditing) {
      const { error } = await supabase.from("ad_spaces").update(payload).eq("id", initialData.id);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("ad_spaces").insert(payload);
      if (error) { setError(error.message); setSaving(false); return; }
    }

    router.push("/admin/ads");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Banner Repuestos García — Mayo 2025"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Posición *</label>
        <select
          value={form.position}
          onChange={(e) => set("position", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
        >
          {POSITIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">URL de la imagen *</label>
        <input
          required
          type="url"
          value={form.image_url}
          onChange={(e) => set("image_url", e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
        />
        <p className="text-xs text-slate-400 mt-1">Subí la imagen a Supabase Storage o cualquier CDN y pegá la URL</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">URL de destino *</label>
        <input
          required
          type="url"
          value={form.link_url}
          onChange={(e) => set("link_url", e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de vencimiento *</label>
        <input
          required
          type="date"
          value={form.expires_at}
          onChange={(e) => set("expires_at", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
        />
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
          {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear anuncio"}
        </button>
      </div>
    </form>
  );
}
