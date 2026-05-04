import type { Metadata } from "next";
import "./globals.css";
import AuthListener from "@/components/auth/AuthListener";

export const metadata: Metadata = {
  title: "PiezaLink — Marketplace de Repuestos Automotrices",
  description:
    "Encontrá repuestos automotrices originales y genuinos. Conectamos compradores con vendedores especializados.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50">
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
