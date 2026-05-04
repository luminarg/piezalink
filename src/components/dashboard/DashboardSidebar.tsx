"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FileUp, MessageSquare, Settings, Wrench, LogOut, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <Wrench className="text-blue-600" size={18} />
          <span className="font-bold text-slate-900">
            Pieza<span className="text-blue-600">Link</span>
          </span>
        </Link>
      </div>

      {/* Vendor name */}
      <div className="px-5 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-400 mb-0.5">Vendedor</p>
        <p className="text-sm font-semibold text-slate-800 truncate">
          {vendor?.company_name || "Mi negocio"}
        </p>
      </div>

      {/* Nav */}
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

      {/* Logout */}
      <div className="px-3 py-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
