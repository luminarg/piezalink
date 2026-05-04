import Link from "next/link";
import { Search, Zap, Package, BarChart2 } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Encontrá el repuesto que necesitás
          </h1>
          <p className="text-lg text-slate-500 mb-10">
            Conectamos compradores con vendedores especializados en repuestos
            automotrices originales y genuinos.
          </p>

          {/* Buscador */}
          <form action="/search" method="GET" className="flex gap-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                name="q"
                placeholder="Número de pieza, marca, modelo..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-base"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Buscar
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-400">
            Búsqueda por número de parte, descripción o compatibilidad
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
              <Zap className="text-blue-600" size={22} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Contacto instantáneo</h3>
            <p className="text-sm text-slate-500">
              Un click y estás hablando con el vendedor por WhatsApp. Sin formularios, sin demoras.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
              <Package className="text-blue-600" size={22} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Stock verificado</h3>
            <p className="text-sm text-slate-500">
              Los vendedores actualizan su inventario en tiempo real. Solo ves lo que está disponible.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
              <BarChart2 className="text-blue-600" size={22} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Para vendedores</h3>
            <p className="text-sm text-slate-500">
              Publicá tu stock, medí tus resultados y conectate con compradores de todo el país.
            </p>
          </div>
        </div>
      </section>

      {/* CTA vendedor */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">¿Tenés un negocio de repuestos?</h2>
          <p className="text-blue-100 mb-8">
            Publicá tu catálogo, importá tu stock desde Excel y llegá a miles de compradores.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Empezar gratis — 30 días de prueba
          </Link>
        </div>
      </section>
    </div>
  );
}
