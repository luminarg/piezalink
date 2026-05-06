import Link from "next/link";
import { Search, Zap, Package, BarChart2, MessageCircleQuestion } from "lucide-react";
import AdBanner from "@/components/ui/AdBanner";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/JsonLd";

export default function HomePage() {
  return (
    <div>
      <OrganizationSchema />
      <WebSiteSchema />

      {/* Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Encontra el repuesto que necesitas
          </h1>
          <p className="text-lg text-slate-500 mb-8">
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
                placeholder="Numero de pieza, marca, modelo..."
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

          {/* CTA secundario — No encontras */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="text-sm text-slate-400">O si no lo encontras:</span>
            <Link
              href="/busco-pieza"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-4 py-2 rounded-xl transition-colors"
            >
              <MessageCircleQuestion size={15} />
              Publicar solicitud de busqueda
            </Link>
          </div>
        </div>
      </section>

      {/* Banner "No encontras tu repuesto" destacado */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-xl font-bold mb-1">No encontras tu repuesto?</h2>
            <p className="text-orange-100 text-sm">
              Publica lo que necesitas y los vendedores especializados te contactan por WhatsApp. Es gratis.
            </p>
          </div>
          <Link
            href="/busco-pieza"
            className="shrink-0 inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 font-bold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
          >
            <MessageCircleQuestion size={17} />
            Publicar mi busqueda
          </Link>
        </div>
      </section>

      {/* Banner home_top */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <AdBanner position="home_top" />
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
              <Zap className="text-blue-600" size={22} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Contacto instantaneo</h3>
            <p className="text-sm text-slate-500">
              Un click y estas hablando con el vendedor por WhatsApp. Sin formularios, sin demoras.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
              <Package className="text-blue-600" size={22} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Stock verificado</h3>
            <p className="text-sm text-slate-500">
              Los vendedores actualizan su inventario en tiempo real. Solo ves lo que esta disponible.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-4">
              <BarChart2 className="text-blue-600" size={22} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Para vendedores</h3>
            <p className="text-sm text-slate-500">
              Publica tu stock, medi tus resultados y conectate con compradores de todo el pais.
            </p>
          </div>
        </div>
      </section>

      {/* CTA vendedor */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Tenes un negocio de repuestos?</h2>
          <p className="text-blue-100 mb-8">
            Publica tu catalogo, importa tu stock desde Excel y llega a miles de compradores.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Empezar gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
