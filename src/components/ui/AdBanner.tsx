import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

interface AdBannerProps {
  position: "home_top" | "search_top" | "search_sidebar";
}

export default async function AdBanner({ position }: AdBannerProps) {
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

  if (!ad) return null;

  const isSidebar = position === "search_sidebar";

  return (
    <a
      href={ad.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`block overflow-hidden rounded-xl border border-slate-200 hover:opacity-95 transition-opacity ${
        isSidebar ? "w-full" : "w-full"
      }`}
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
