import type { Metadata } from "next";
import PartRequestForm from "@/components/parts/PartRequestForm";
import { MessageCircleQuestion, Zap, Shield, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "No encuentro mi repuesto — PiezaLink",
  description: "Publica lo que necesitas y los vendedores especializados te contactan por WhatsApp. Gratis para compradores, sin registro.",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscoPiezaPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialQuery = params.q?.trim() || "";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-2xl mb-4">
          <MessageCircleQuestion size={28} className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          No encuentras tu repuesto?
        </h1>
        <p className="text-slate-500 text-base leading-relaxed">
          Publica tu solicitud con los datos del vehiculo y los vendedores especializados te contactan directamente por WhatsApp.
        </p>
      </div>

      {/* Beneficios */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: Zap, label: "Gratis para compradores", color: "bg-blue-50", iconColor: "text-blue-600" },
          { icon: Users, label: "Vendedores te contactan", color: "bg-emerald-50", iconColor: "text-emerald-600" },
          { icon: Shield, label: "Sin registro requerido", color: "bg-purple-50", iconColor: "text-purple-600" },
        ].map(({ icon: Icon, label, color, iconColor }) => (
          <div key={label} className="text-center p-3">
            <div className={"inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2 " + color}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="text-xs text-slate-600 font-medium leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Si viene con query pre-llenado, mostrar aviso */}
      {initialQuery && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-800">
          Completamos el formulario con tu busqueda: <strong>"{initialQuery}"</strong>. Revisa y agrega los datos del vehiculo.
        </div>
      )}

      <PartRequestForm initialDescription={initialQuery} />
    </div>
  );
}
