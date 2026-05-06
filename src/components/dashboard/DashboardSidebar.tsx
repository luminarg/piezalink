"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileUp,
  MessageSquare,
  Settings,
  Wrench,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/parts", label: "Mis piezas", icon: Package },
  { href: "/dashboard/parts/import", label: "Importar Excel", icon: FileUp },
  { href: "/dashboard/solicitudes", label: "Solicitudes", icon: Bell },
  { href: "/dashboard/contacts", label: "Consultas WA", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Mi perfil", icon: Settings },
];

interface DashboardSidebarProps {
  vendor: { id: string; company_name: string; logo_url?: string } | null;
}

export default function DashboardSidebar({ vendor }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navContent = (
    <>
      <div className="px-5 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-400 mb-0.5">Vendedor</p>
        <p className="text-sm font-semibold text-slate-800 truncate">
          {vendor?.company_name || "Mi negocio"}
        </p>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </>
  );

  const logoBlock = (
    <Link href="/" className="flex items-center gap-2">
      <Wrench className="text-blue-600" size={18} />
      <span className="font-bold text-slate-900">
        Pieza<span className="text-blue-600">Link</span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Topbar mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
        {logoBlock}
        <div className="w-10" />
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          {logoBlock}
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {navContent}
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-200 flex-col min-h-screen sticky top-0">
        <div className="px-5 py-4 border-b border-slate-100">
          {logoBlock}
        </div>
        {navContent}
      </aside>
    </>
  );
}
