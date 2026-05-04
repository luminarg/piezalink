"use client";

import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  href: string;
  partId: string;
}

export default function WhatsAppButton({ href, partId }: WhatsAppButtonProps) {
  const handleClick = async () => {
    try {
      await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part_id: partId, event_type: "whatsapp_click" }),
      });
    } catch {
      // silencioso
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
    >
      <MessageCircle size={18} />
      Contactar por WhatsApp
    </a>
  );
}
