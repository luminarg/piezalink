"use client";

import Link from "next/link";
import { Wrench, MessageCircleQuestion } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Wrench className="text-blue-600" size={22} />
            <span className="font-bold text-xl text-slate-900">
              Pieza<span className="text-blue-600">Link</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/search"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
            >
              Buscar piezas
            </Link>
            <Link
              href="/planes"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden md:block"
            >
              Planes
            </Link>
            <Link
              href="/nosotros"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden md:block"
            >
              Nosotros
            </Link>
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
            >
              Ingresar
            </Link>

            {/* CTA principal: No encuentro mi repuesto */}
            <Link
              href="/busco-pieza"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
            >
              <MessageCircleQuestion size={15} />
              <span className="hidden sm:inline">No encuentro mi repuesto</span>
              <span className="sm:hidden">Busco pieza</span>
            </Link>

            <Link
              href="/register"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium hidden md:block"
            >
              Publicar stock
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
