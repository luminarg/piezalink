import type { Metadata } from "next";
import Link from "next/link";
import { Wrench, Target, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Quiénes somos — PiezaLink",
  description:
    "PiezaLink nació del rubro. Somos una plataforma argentina que conecta compradores con vendedores de repuestos automotrices, sin intermediarios.",
};

export default function NosotrosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="text-blue-600" size={20} />
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Quiénes somos</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-5 leading-tight">
          Nacimos del rubro.<br />Construimos para el rubro.
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          PiezaLink surgió de años trabajando en el mercado de repuestos automotrices en Argentina
          y ver siempre el mismo problema: los compradores no encuentran lo que buscan, y los
          vendedores no llegan a quienes los necesitan.
        </p>
      </div>

      {/* Historia */}
      <div className="prose prose-slate max-w-none mb-12">
        <p className="text-slate-600 leading-relaxed mb-4">
          Durante años, la forma de conseguir una pieza fue siempre la misma: llamar a conocidos,
          mandar mensajes a grupos de WhatsApp, recorrer desarmaderos. Funciona, pero es lento,
          desgastante y depende de quién conocés.
        </p>
        <p className="text-slate-600 leading-relaxed mb-4">
          Del otro lado, los negocios de repuestos — desarmaderos, distribuidoras, importadores —
          tienen el stock pero no tienen visibilidad. Sus clientes los encuentran por recomendación
          o por casualidad. No hay una forma simple de mostrar lo que tienen disponible hoy.
        </p>
        <p className="text-slate-600 leading-relaxed">
          <strong className="text-slate-800">PiezaLink resuelve eso.</strong> Una plataforma donde
          el comprador busca la pieza y habla directo con quien la tiene. Sin formularios, sin
          intermediarios, sin comisiones por venta. Solo contacto real entre personas.
        </p>
      </div>

      {/* Valores / propuesta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="bg-blue-50 w-9 h-9 rounded-lg flex items-center justify-center mb-3">
            <Target size={17} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Directo al punto</h3>
          <p className="text-sm text-slate-500">
            Sin pasos innecesarios. El comprador encuentra la pieza y contacta al vendedor en un click.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="bg-blue-50 w-9 h-9 rounded-lg flex items-center justify-center mb-3">
            <Users size={17} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Hecho para el rubro</h3>
          <p className="text-sm text-slate-500">
            No somos una plataforma genérica. Entendemos cómo funciona el mercado de autopartes en Argentina.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="bg-blue-50 w-9 h-9 rounded-lg flex items-center justify-center mb-3">
            <Zap size={17} className="text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Sin comisiones</h3>
          <p className="text-sm text-slate-500">
            No cobramos por cada venta. El negocio es tuyo. Nosotros solo ponemos la vidriera.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">¿Tenés un negocio de repuestos?</h2>
        <p className="text-slate-500 text-sm mb-6">
          Sumarte es gratis. En minutos tenés tu catálogo online y empezás a recibir consultas.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Publicar mi stock gratis
          </Link>
          <a
            href="mailto:contacto@piezalink.com"
            className="border border-slate-200 hover:bg-white text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Contactarnos
          </a>
        </div>
      </div>

    </div>
  );
}
