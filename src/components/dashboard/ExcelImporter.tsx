"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, XCircle, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface ParsedRow {
  part_number: string;
  description: string;
  compatibility: string;
  stock_quantity: number;
  brand?: string;
  category?: string;
}

interface ImportResult {
  success: number;
  errors: string[];
}

export default function ExcelImporter() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        const parsed: ParsedRow[] = [];
        const errors: string[] = [];

        json.forEach((row, i) => {
          const rowNum = i + 2;
          const pn = String(row["part_number"] || row["Part Number"] || row["PART_NUMBER"] || "").trim();
          const desc = String(row["description"] || row["Description"] || row["DESCRIPTION"] || "").trim();
          const compat = String(row["compatibility"] || row["Compatibility"] || row["COMPATIBILITY"] || "").trim();
          const qty = parseInt(String(row["stock_quantity"] || row["Stock"] || row["qty"] || "0"));

          if (!pn) { errors.push(`Fila ${rowNum}: falta part_number`); return; }
          if (!desc) { errors.push(`Fila ${rowNum}: falta description`); return; }
          if (!compat) { errors.push(`Fila ${rowNum}: falta compatibility`); return; }

          parsed.push({
            part_number: pn,
            description: desc,
            compatibility: compat,
            stock_quantity: isNaN(qty) ? 0 : qty,
            brand: String(row["brand"] || row["Brand"] || "").trim() || undefined,
            category: String(row["category"] || row["Category"] || "").trim() || undefined,
          });
        });

        setRows(parsed);
        if (errors.length > 0) {
          setResult({ success: 0, errors });
        }
      } catch {
        setResult({ success: 0, errors: ["Error al leer el archivo. Verificá que sea un .xlsx o .csv válido."] });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success > 0) setRows([]);
    } catch {
      setResult({ success: 0, errors: ["Error de red. Intentá nuevamente."] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <FileSpreadsheet size={36} className="mx-auto text-slate-300 mb-3" />
        <p className="font-medium text-slate-700 mb-1">
          {fileName || "Hacé click para seleccionar el archivo"}
        </p>
        <p className="text-sm text-slate-400">.xlsx, .xls o .csv</p>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Preview */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-medium text-slate-800">
              {rows.length} piezas listas para importar
            </span>
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload size={15} />
              {importing ? "Importando..." : "Importar todo"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nro. Pieza</th>
                  <th className="px-4 py-3 text-left">Descripción</th>
                  <th className="px-4 py-3 text-left">Compatibilidad</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-left">Marca</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{row.part_number}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{row.description}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{row.compatibility}</td>
                    <td className="px-4 py-3 text-right font-medium">{row.stock_quantity}</td>
                    <td className="px-4 py-3 text-slate-500">{row.brand || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
                Mostrando 10 de {rows.length} filas
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-xl border p-4 ${result.success > 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          {result.success > 0 && (
            <div className="flex items-center gap-2 text-emerald-700 font-medium mb-1">
              <CheckCircle size={16} />
              {result.success} piezas importadas correctamente
            </div>
          )}
          {result.errors?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <XCircle size={16} />
                {result.errors.length} error{result.errors.length !== 1 ? "es" : ""}
              </div>
              <ul className="text-xs text-red-600 space-y-1">
                {result.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
