import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 404 });

  const { rows } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Sin datos" }, { status: 400 });
  }

  type InputRow = {
    part_number: string;
    description: string;
    compatibility: string;
    stock_quantity: number;
    brand?: string;
    category?: string;
  };

  // Deduplicar por part_number (quedar con la última ocurrencia)
  const deduped = Object.values(
    (rows as InputRow[]).reduce((acc, row) => {
      acc[row.part_number.trim().toLowerCase()] = row;
      return acc;
    }, {} as Record<string, InputRow>)
  );

  const toInsert = deduped.map((row) => ({
    vendor_id: vendor.id,
    part_number: row.part_number,
    description: row.description,
    compatibility: row.compatibility,
    stock_quantity: row.stock_quantity ?? 0,
    brand: row.brand || null,
    category: row.category || null,
    is_active: true,
  }));

  // Upsert por part_number + vendor_id
  const { data, error } = await supabase
    .from("parts")
    .upsert(toInsert, { onConflict: "vendor_id,part_number", ignoreDuplicates: false })
    .select();

  if (error) {
    return NextResponse.json({ success: 0, errors: [error.message] }, { status: 500 });
  }

  return NextResponse.json({ success: data?.length ?? 0, errors: [] });
}
