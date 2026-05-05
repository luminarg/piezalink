import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import GoogleAd from "./GoogleAd";

interface AdBannerProps {
  position: "home_top" | "search_top" | "search_sidebar";
  /** Ad slot de Google AdSense para usar como fallback */
  adSlot?: string;
}

export default async function AdBanner({ position, adSlot }: AdBannerProps) {
  const supabase = await createClient();

  const { data: ad } = await supabase
    .from("ad_spaces")
    .select("*")
    .eq("position", position)
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const isSidebar = position === "search_sidebar";

  // Si hay publicidad propia, mostrarla
  if (ad) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block overflow-hidden rounded-xl border border-slate-200 hover:opacity-95 transition-opacity"
        title={ad.title}
      >
        <div className="relative">
          <Image
            src={ad.image_url}
            alt={ad.title}
            width={isSidebar ? 300 : 1200}
            height={isSidebar ? 250 : 120}
            className="w-full object-cover"
          />
          <span className="absolute bottom-1 right-2 text-xs text-white/60 bg-black/30 px-1.5 py-0.5 rounded">
            Publicidad
          </span>
        </div>
      </a>
    );
  }

  // Fallback a Google AdSense
  if (adSlot) {
    return (
      <div className="w-full">
        <GoogleAd
          adSlot={adSlot}
          adFormat={isSidebar ? "rectangle" : "horizontal"}
          fullWidthResponsive={!isSidebar}
          style={isSidebar ? { width: 300, height: 250 } : { height: 90 }}
        />
      </div>
    );
  }

  return null;
}
