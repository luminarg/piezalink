import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Instagram } from "lucide-react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Marca */}
            <div className="text-center sm:text-left">
              <p className="font-bold text-slate-800">
                Pieza<span className="text-blue-600">Link</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Marketplace de repuestos automotrices en Argentina
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/search" className="hover:text-slate-800 transition-colors">
                Buscar piezas
              </Link>
              <Link href="/busco-pieza" className="hover:text-slate-800 transition-colors">
                Busco una pieza
              </Link>
              <Link href="/planes" className="hover:text-slate-800 transition-colors">
                Planes
              </Link>
            </div>

            {/* Redes */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/piezalink"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PiezaLink en Instagram"
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-pink-500 transition-colors"
              >
                <Instagram size={16} />
                @piezalink
              </a>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-8 pt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} PiezaLink — Todos los derechos reservados
          </div>
        </div>
      </footer>
    </>
  );
}
