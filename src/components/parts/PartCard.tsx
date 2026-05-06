"use client";

import Link from "next/link";
import { MessageCircle, Package, MapPin } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils/whatsapp";
import type { Part } from "@/types";

interface PartCardProps {
  part: Part;
}

export default function PartCard({ part }: PartCardProps) {
  const whatsappUrl =
    part.vendor?.whatsapp
      ? buildWhatsAppLink(part.vendor.whatsapp, part.part_number)
      : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {part.part_number}
          </span>
          {part.brand && (
            <span className="ml-2 text-xs text-slate-400">{part.brand}</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <Package size={12} />
          {part.stock_quantity} en stock
        </div>
      </div>

      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 text-sm">
        {part.description}
      </h3>
      <p className="text-xs text-slate-500 mb-4 line-clamp-2">
        Compatibilidad: {part.compatibility}
      </p>

      {part.vendor && (
        <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
          <MapPin size={11} />
          <span className="font-medium text-slate-600">{part.vendor.company_name}</span>
          {part.vendor.city && <span>{"· " + part.vendor.city}</span>}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={"/parts/" + (part.slug || part.id)}
          className="flex-1 text-center text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 rounded-lg transition-colors"
        >
          Ver detalle
        </Link>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
            onClick={() => trackWhatsAppClick(part.id)}
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

async function trackWhatsAppClick(partId: string) {
  try {
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ part_id: partId, event_type: "whatsapp_click" }),
    });
  } catch {
    // silencioso
  }
}
