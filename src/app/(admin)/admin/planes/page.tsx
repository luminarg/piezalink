import { createClient } from "@/lib/supabase/server";
import PlanEditor from "@/components/admin/PlanEditor";

export default async function AdminPlanesPage() {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Planes y precios</h1>
        <p className="text-slate-500 text-sm mt-1">
          Los cambios se reflejan inmediatamente en la página pública de planes.
        </p>
      </div>

      {!plans?.length ? (
        <p className="text-slate-400 text-sm">No hay planes configurados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanEditor
              key={plan.id}
              plan={{
                ...plan,
                features: Array.isArray(plan.features) ? plan.features : [],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
