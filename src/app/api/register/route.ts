import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, company_name, whatsapp, phone, city } = await req.json();

  if (!email || !password || !company_name || !whatsapp) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  // Cliente admin con service role (bypasea RLS)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Crear usuario
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // confirmar email automáticamente
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message || "Error al crear el usuario" },
      { status: 400 }
    );
  }

  // 2. Crear perfil de vendedor (sin RLS porque usamos service role)
  const { error: vendorError } = await supabaseAdmin.from("vendors").insert({
    user_id: authData.user.id,
    company_name,
    whatsapp: whatsapp.replace(/\D/g, ""),
    phone: phone || null,
    email,
    city: city || null,
  });

  if (vendorError) {
    // Rollback: eliminar el usuario si falla la creación del vendor
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: "Error al crear el perfil del vendedor" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
