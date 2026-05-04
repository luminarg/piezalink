import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import PartForm from "@/components/dashboard/PartForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPartPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/register");

  const { data: part } = await supabase
    .from("parts")
    .select("*")
    .eq("id", id)
    .eq("vendor_id", vendor.id)
    .single();

  if (!part) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Editar pieza</h1>
        <p className="text-slate-500 text-sm mt-1 font-mono">{part.part_number}</p>
      </div>
      <PartForm initialData={part} />
    </div>
  );
}
