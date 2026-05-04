import AdForm from "@/components/admin/AdForm";

export default function NewAdPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Nuevo anuncio</h1>
        <p className="text-slate-500 text-sm mt-1">Creá un espacio publicitario para un vendedor</p>
      </div>
      <AdForm />
    </div>
  );
}
