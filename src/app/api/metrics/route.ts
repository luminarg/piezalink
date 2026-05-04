import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { part_id, event_type } = await req.json();

    if (!part_id || !["view", "whatsapp_click"].includes(event_type)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: part } = await supabase
      .from("parts")
      .select("vendor_id")
      .eq("id", part_id)
      .single();

    if (!part) return NextResponse.json({ ok: false });

    await supabase.from("part_events").insert({
      part_id,
      vendor_id: part.vendor_id,
      event_type,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
