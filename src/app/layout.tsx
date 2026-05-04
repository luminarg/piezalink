import type { Metadata } from "next";
import "./globals.css";
import AuthListener from "@/components/auth/AuthListener";

export const metadata: Metadata = {
  title: {
    default: "PiezaLink — Marketplace de Repuestos Automotrices",
    template: "%s | PiezaLink",
  },
  description:
    "Encontrá repuestos automotrices originales y genuinos. Conectamos compradores con vendedores especializados en toda Argentina.",
  keywords: ["repuestos", "autopartes", "piezas automotrices", "marketplace", "repuestos originales"],
  openGraph: {
    type: "website",
    siteName: "PiezaLink",
    title: "PiezaLink — Marketplace de Repuestos Automotrices",
    description: "Encontrá repuestos automotrices originales y genuinos en Argentina.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
