"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle } from "lucide-react";
import { CAR_BRANDS } from "@/lib/utils/car-brands";

export default function PartRequestForm() {
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    brand: "",
    model: "",
    year: "",
    chassis: "",
    part_number: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.from("part_requests").insert({
      buyer_name: form.buyer_name,
      buyer_email: form.buyer_email,
      buyer_phone: form.buyer_phone,
      brand: form.brand,
      model: form.model,
      year: form.year ? parseInt(form.year) : null,
      chassis: form.chassis || null,
      part_number: form.part_number || null,
      description: form.description,
      status: "open",
    });

    if (error) {
      setError("Error al enviar la solicitud. Intentá nuevamente.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
        <CheckCircle size={40} className="mx-auto text-emerald-500 mb-4" />
        <h2 className="text-xl font-bold text-emerald-800 mb-2">¡Solicitud publicada!</h2>
        <p className="text-emerald-700 text-sm">
          Los vendedores especializados en <strong>{form.brand}</strong> van a ver tu solicitud y te contactarán al{" "}
          <strong>{form.buyer_phone}</strong> o <strong>{form.buyer_email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      {/* Datos del vehículo */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Datos del vehículo
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Marca *</label>
            <select
              required
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
            >
              <option value="">Seleccioná la marca</option>
              {CAR_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
              <option value="Otra">Otra</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Modelo *</label>
            <input
              required
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="Ej: Corolla, 208, Cronos..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
            <input
              type="number"
              min="1980"
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              placeholder="Ej: 2018"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              N° de chasis <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              value={form.chassis}
              onChange={(e) => set("chassis", e.target.value)}
              placeholder="17 caracteres VIN"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Pieza */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Pieza que buscás
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nro. de parte <span className="text-slate-400 font-normal">(si lo sabés)</span>
            </label>
            <input
              value={form.part_number}
              onChange={(e) => set("part_number", e.target.value)}
              placeholder="Ej: 04152-YZZA6"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción de la pieza *</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ej: Filtro de aceite original, bomba de agua, tensor de distribución..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Tus datos de contacto
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input
              required
              value={form.buyer_name}
              onChange={(e) => set("buyer_name", e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp / Teléfono *</label>
            <input
              required
              value={form.buyer_phone}
              onChange={(e) => set("buyer_phone", e.target.value)}
              placeholder="11 1234-5678"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              required
              type="email"
              value={form.buyer_email}
              onChange={(e) => set("buyer_email", e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
      >
        {loading ? "Publicando solicitud..." : "Publicar solicitud — es gratis"}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Tus datos solo son visibles para vendedores con plan Premium verificados en PiezaLink.
      </p>
    </form>
  );
}
