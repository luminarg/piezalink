import PartForm from "@/components/dashboard/PartForm";

export default function NewPartPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Agregar pieza</h1>
        <p className="text-slate-500 text-sm mt-1">Cargá una pieza manualmente</p>
      </div>
      <PartForm />
    </div>
  );
}
