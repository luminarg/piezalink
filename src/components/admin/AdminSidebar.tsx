"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Wrench,
  Shield,
  UserCog,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/admin", label: "Resumen global", icon: LayoutDashboard, exact: true },
  { href: "/admin/usuarios", label: "Usuarios", icon: UserCog },
  { href: "/admin/planes", label: "Planes", icon: CreditCard },
  { href: "/admin/ads", label: "Publicidad", icon: Megaphone },
  { href: "/admin/contacts", label: "Consultas", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navContent = (
    <>
      <div className="px-5 py-2.5 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Shield size={11} className="text-slate-400" />
          <span className="text-xs text-slate-400">Panel Admin</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active ? "bg-blue-600 text-white font-medium" : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
    </>
  );

  const logoBlock = (
    <Link href="/" className="flex items-center gap-2">
      <Wrench className="text-blue-400" size={18} />
      <span className="font-bold text-white">
        Pieza<span className="text-blue-400">Link</span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Topbar mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        {logoBlock}
        <div className="w-10" />
      </div>

      {/* Backdrop */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      {/* Drawer mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-xl lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          {logoBlock}
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {navContent}
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 bg-slate-900 text-white flex-col min-h-screen sticky top-0">
        <div className="px-5 py-4 border-b border-slate-800">{logoBlock}</div>
        {navContent}
      </aside>
    </>
  );
}
