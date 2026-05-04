import type { Metadata } from "next";
import PartRequestForm from "@/components/parts/PartRequestForm";
import { Bell, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Busco una pieza — PiezaLink",
  description: "Publicá lo que necesitás y los vendedores especializados te contactan. Gratis para compradores.",
};

export default function BuscoPiezaPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          ¿No encontrás la pieza?
        </h1>
        <p className="text-slate-500">
          Publicá tu solicitud con los datos del vehículo y los vendedores especializados te contactan directamente.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { icon: Zap, text: "Gratis para compradores" },
          { icon: Bell, text: "Vendedores te contactan" },
          { icon: Shield, text: "Sin registro requerido" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="text-center p-3">
            <div className="inline-flex items-center justify-center w-9 h-9 bg-blue-50 rounded-lg mb-2">
              <Icon size={16} className="text-blue-600" />
            </div>
            <p className="text-xs text-slate-600 font-medium">{text}</p>
          </div>
        ))}
      </div>

      <PartRequestForm />
    </div>
  );
}
