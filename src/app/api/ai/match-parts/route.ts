import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { matchPartsToRequest } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { requestId, vendorId } = await req.json();

    if (!requestId || !vendorId) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    const supabase = await createClient();

    // Obtener la solicitud del comprador
    const { data: partRequest, error: reqError } = await supabase
      .from("part_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (reqError || !partRequest) {
      return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    }

    // Obtener el inventario del vendedor (filtrar por marca si aplica)
    let partsQuery = supabase
      .from("parts")
      .select("id, part_number, description, compatibility, brand")
      .eq("vendor_id", vendorId)
      .eq("is_active", true)
      .gt("stock_quantity", 0);

    // Pre-filtrar por marca para reducir tokens enviados a Gemini
    if (partRequest.brand) {
      partsQuery = partsQuery.or(
        `brand.ilike.%${partRequest.brand}%,compatibility.ilike.%${partRequest.brand}%,compatibility.ilike.%${partRequest.model}%`
      );
    }

    const { data: parts } = await partsQuery.limit(40);

    if (!parts || parts.length === 0) {
      return NextResponse.json({ matches: [], partsChecked: 0 });
    }

    // Matching con Gemini
    const matches = await matchPartsToRequest(
      {
        brand: partRequest.brand,
        model: partRequest.model,
        year: partRequest.year,
        description: partRequest.description,
        part_number: partRequest.part_number,
      },
      parts
    );

    // Enriquecer con datos completos de las piezas
    const matchedPartIds = matches.map((m) => m.part_id);
    const { data: matchedParts } = matchedPartIds.length > 0
      ? await supabase
          .from("parts")
          .select("id, part_number, description, compatibility, stock_quantity")
          .in("id", matchedPartIds)
      : { data: [] };

    const enriched = matches.map((m) => ({
      ...m,
      part: matchedParts?.find((p) => p.id === m.part_id),
    }));

    return NextResponse.json({
      matches: enriched,
      partsChecked: parts.length,
    });
  } catch (error) {
    console.error("AI match error:", error);
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}
