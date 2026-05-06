import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Package, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/utils/whatsapp";
import WhatsAppButton from "@/components/parts/WhatsAppButton";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://piezalink.com";

interface PartPageProps {
  params: Promise<{ id: string }>;
}

// Detectar si el param parece un UUID (links viejos) o un slug (links nuevos)
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PartPageProps): Promise<Metadata> {
  const { id: param } = await params;
  const supabase = await createClient();

  const isUUID = UUID_RE.test(param);
  const query = supabase.from("parts").select("part_number, description, compatibility, brand, slug, vendor:vendors(company_name, city)");
  const { data: part } = await (isUUID ? query.eq("id", param) : query.eq("slug", param)).single();

  if (!part) return { title: "Pieza no encontrada — PiezaLink" };

  const vendorMeta = Array.isArray(part.vendor) ? part.vendor[0] : part.vendor;
  const title = part.part_number + " — " + part.description + " | PiezaLink";
  const description = "Repuesto " + part.part_number + ": " + part.description + ". Compatible con " + part.compatibility + ". " + (vendorMeta?.company_name ? "Vendido por " + vendorMeta.company_name : "") + ". Contacta al vendedor por WhatsApp.";
  const canonical = BASE_URL + "/parts/" + (part.slug || param);

  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: "PiezaLink" },
    alternates: { canonical },
  };
}

export default async function PartPage({ params }: PartPageProps) {
  const { id: param } = await params;
  const supabase = await createClient();

  const isUUID = UUID_RE.test(param);

  const query = supabase
    .from("parts")
    .select("*, vendor:vendors(id, company_name, whatsapp, phone, email, city, state, description, logo_url)")
    .eq("is_active", true);

  const { data: part } = await (isUUID ? query.eq("id", param) : query.eq("slug", param)).single();

  if (!part) notFound();

  // Si llegaron por UUID (link viejo) y tiene slug, redirigir permanentemente
  if (isUUID && part.slug) {
    redirect("/parts/" + part.slug);
  }

  // Registrar vista
  await supabase.from("part_events").insert({
    part_id: part.id,
    vendor_id: part.vendor_id,
    event_type: "view",
  });

  const vendor = Array.isArray(part.vendor) ? part.vendor[0] : part.vendor;
  const whatsappUrl = vendor?.whatsapp
    ? buildWhatsAppLink(vendor.whatsapp, part.part_number)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProductSchema
        partId={part.id}
        partNumber={part.part_number}
        description={part.description}
        compatibility={part.compatibility}
        vendorName={vendor?.company_name}
      />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: BASE_URL },
          { name: "Buscar piezas", url: BASE_URL + "/search" },
          { name: part.part_number, url: BASE_URL + "/parts/" + (part.slug || part.id) },
        ]}
      />
      <Link
        href="/search"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a resultados
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-lg font-semibold">
                {part.part_number}
              </span>
              {part.brand && (
                <span className="text-sm text-slate-500">{part.brand}</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-4">
              {part.description}
            </h1>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-slate-700">Compatibilidad:</span>
                <p className="text-slate-600 mt-1">{part.compatibility}</p>
              </div>
              {part.category && (
                <div>
                  <span className="font-medium text-slate-700">Categoria:</span>
                  <span className="text-slate-600 ml-2">{part.category}</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Package size={16} className="text-emerald-500" />
                <span className="font-semibold text-emerald-600">
                  {part.stock_quantity} unidades disponibles
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {whatsappUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-emerald-800 mb-1">
                Te interesa esta pieza?
              </p>
              <p className="text-xs text-emerald-600 mb-4">
                Contacta directamente al vendedor por WhatsApp
              </p>
              <WhatsAppButton href={whatsappUrl} partId={part.id} />
            </div>
          )}
          {vendor && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">{vendor.company_name}</h3>
              {vendor.description && (
                <p className="text-xs text-slate-500 mb-3">{vendor.description}</p>
              )}
              <div className="space-y-2 text-sm text-slate-500">
                {vendor.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} />
                    {vendor.city}{vendor.state && ", " + vendor.state}
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} />
                    {vendor.phone}
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} />
                    {vendor.email}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
