"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Megaphone, MessageSquare, Wrench, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/admin", label: "Resumen global", icon: LayoutDashboard, exact: true },
  { href: "/admin/vendors", label: "Vendedores", icon: Users },
  { href: "/admin/ads", label: "Publicidad", icon: Megaphone },
  { href: "/admin/contacts", label: "Consultas", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Wrench className="text-blue-400" size={18} />
          <span className="font-bold text-white">
            Pieza<span className="text-blue-400">Link</span>
          </span>
        </Link>
        <div className="flex items-center gap-1.5 mt-2">
          <Shield size={11} className="text-slate-400" />
          <span className="text-xs text-slate-400">Panel Admin</span>
        </div>
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
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-3 border-t border-slate-800">
        <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
          ← Ir al dashboard de vendedor
        </Link>
      </div>
    </aside>
  );
}
