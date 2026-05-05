/**
 * Componente genérico para inyectar JSON-LD en el head.
 * Usar dentro de generateMetadata o directamente en el JSX de un Server Component.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://piezalink.com";

/** Schema de Organización para el homepage */
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PiezaLink",
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
        description:
          "Marketplace de repuestos automotrices en Argentina. Conectamos compradores con vendedores especializados.",
        address: {
          "@type": "PostalAddress",
          addressCountry: "AR",
        },
        sameAs: ["https://instagram.com/piezalink"],
      }}
    />
  );
}

/** Schema de WebSite con Sitelinks Searchbox */
export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "PiezaLink",
        url: BASE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/** Schema de Producto para una pieza específica */
export function ProductSchema({
  partNumber,
  description,
  compatibility,
  vendorName,
  partId,
}: {
  partNumber: string;
  description: string;
  compatibility?: string;
  vendorName?: string;
  partId: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${partNumber} — ${description}`,
        description: compatibility
          ? `${description}. Compatible con: ${compatibility}`
          : description,
        sku: partNumber,
        mpn: partNumber,
        url: `${BASE_URL}/parts/${partId}`,
        category: "Repuestos Automotrices",
        brand: {
          "@type": "Brand",
          name: "PiezaLink",
        },
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          priceCurrency: "ARS",
          seller: vendorName
            ? { "@type": "Organization", name: vendorName }
            : undefined,
          url: `${BASE_URL}/parts/${partId}`,
        },
      }}
    />
  );
}

/** Schema de BreadcrumbList */
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
