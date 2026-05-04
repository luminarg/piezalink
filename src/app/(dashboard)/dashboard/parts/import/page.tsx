import ExcelImporter from "@/components/dashboard/ExcelImporter";

export default function ImportPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Importar desde Excel</h1>
        <p className="text-slate-500 text-sm mt-1">
          Subí tu catálogo de piezas en formato .xlsx o .csv
        </p>
      </div>

      {/* Formato esperado */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-blue-800 mb-2">Formato del archivo</p>
        <p className="text-xs text-blue-700 mb-2">
          El archivo debe tener estas columnas (en cualquier orden):
        </p>
        <div className="flex flex-wrap gap-2">
          {["part_number", "description", "compatibility", "stock_quantity", "brand (opcional)", "category (opcional)"].map((col) => (
            <span key={col} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
              {col}
            </span>
          ))}
        </div>
      </div>

      <ExcelImporter />
    </div>
  );
}
