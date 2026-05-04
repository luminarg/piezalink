import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
