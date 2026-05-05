import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import AuthListener from "@/components/auth/AuthListener";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://piezalink.com";
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PiezaLink — Marketplace de Repuestos Automotrices en Argentina",
    template: "%s | PiezaLink",
  },
  description:
    "Encontrá repuestos automotrices originales y genuinos en Argentina. Conectamos compradores con vendedores especializados. Buscá por número de pieza, marca o modelo.",
  keywords: [
    "repuestos automotrices Argentina",
    "autopartes",
    "piezas automotrices",
    "repuestos originales",
    "marketplace repuestos",
    "buscar repuestos",
    "repuestos Toyota",
    "repuestos Volkswagen",
    "repuestos Peugeot",
    "repuestos Ford",
    "repuestos Chevrolet",
    "repuestos Renault",
  ],
  authors: [{ name: "PiezaLink" }],
  creator: "PiezaLink",
  publisher: "PiezaLink",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "PiezaLink",
    title: "PiezaLink — Marketplace de Repuestos Automotrices en Argentina",
    description:
      "Encontrá repuestos automotrices originales y genuinos. Conectamos compradores con vendedores en toda Argentina.",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "PiezaLink — Repuestos Automotrices",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PiezaLink — Marketplace de Repuestos Automotrices",
    description: "Encontrá repuestos automotrices en Argentina. Contacto directo con vendedores por WhatsApp.",
    images: [`${BASE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        {/* Google AdSense */}
        {ADSENSE_ID && (
          <meta name="google-adsense-account" content={ADSENSE_ID} />
        )}
      </head>
      <body className="min-h-screen bg-slate-50">
        <AuthListener />
        {children}

        {/* Google AdSense script */}
        {ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
