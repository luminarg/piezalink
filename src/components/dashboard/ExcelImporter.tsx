"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, XCircle, FileSpreadsheet, Download, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";

interface ParsedRow {
  part_number: string;
  description: string;
  compatibility: string;
  stock_quantity: number;
  brand?: string;
  category?: string;
}

interface RowError {
  row: number;
  fields: string[];
}

interface ImportResult {
  success: number;
  errors: string[];
}

export default function ExcelImporter() {
  const [validRows, setValidRows] = useState<ParsedRow[]>([]);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Descargar plantilla ──────────────────────────────────────────────────
  const downloadTemplate = () => {
    const templateData = [
      {
        part_number: "ABC-1234",
        description: "Filtro de aceite original Toyota",
        compatibility: "Toyota Corolla 2010-2020, Toyota RAV4 2012-2018",
        stock_quantity: 15,
        brand: "Toyota",
        category: "Filtros",
      },
      {
        part_number: "XYZ-5678",
        description: "Pastillas de freno delanteras",
        compatibility: "Honda Civic 2015-2022",
        stock_quantity: 8,
        brand: "Honda",
        category: "Frenos",
      },
      {
        part_number: "DEF-9012",
        description: "Correa de distribución",
        compatibility: "Volkswagen Golf 2010-2018, VW Polo 2012-2020",
        stock_quantity: 3,
        brand: "VW",
        category: "Motor",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Ancho de columnas
    ws["!cols"] = [
      { wch: 15 },
      { wch: 35 },
      { wch: 45 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock");
    XLSX.writeFile(wb, "piezalink_plantilla.xlsx");
  };

  // ── Parsear archivo ──────────────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setValidRows([]);
    setRowErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        const valid: ParsedRow[] = [];
        const errors: RowError[] = [];

        json.forEach((row, i) => {
          const rowNum = i + 2;
          const missing: string[] = [];

          const pn = String(
            row["part_number"] ?? row["Part Number"] ?? row["PART_NUMBER"] ?? ""
          ).trim();
          const desc = String(
            row["description"] ?? row["Description"] ?? row["DESCRIPTION"] ?? ""
          ).trim();
          const compat = String(
            row["compatibility"] ?? row["Compatibility"] ?? row["COMPATIBILITY"] ?? ""
          ).trim();
          const qty = parseInt(
            String(row["stock_quantity"] ?? row["Stock"] ?? row["qty"] ?? row["Qty"] ?? "0")
          );

          if (!pn) missing.push("part_number");
          if (!desc) missing.push("description");
          if (!compat) missing.push("compatibility");

          if (missing.length > 0) {
            errors.push({ row: rowNum, fields: missing });
            return;
          }

          valid.push({
            part_number: pn,
            description: desc,
            compatibility: compat,
            stock_quantity: isNaN(qty) ? 0 : qty,
            brand: String(row["brand"] ?? row["Brand"] ?? "").trim() || undefined,
            category: String(row["category"] ?? row["Category"] ?? "").trim() || undefined,
          });
        });

        setValidRows(valid);
        setRowErrors(errors);
      } catch {
        setResult({
          success: 0,
          errors: ["Error al leer el archivo. Verificá que sea un .xlsx o .csv válido."],
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Importar ─────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success > 0) {
        setValidRows([]);
        setFileName("");
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch {
      setResult({ success: 0, errors: ["Error de red. Intentá nuevamente."] });
    } finally {
      setImporting(false);
    }
  };

  const totalRows = validRows.length + rowErrors.length;

  return (
    <div className="space-y-6">
      {/* Descargar plantilla */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-700">¿No tenés el formato correcto?</p>
          <p className="text-xs text-slate-400 mt-0.5">Descargá la plantilla con columnas y ejemplos listos para completar</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={15} />
          Descargar plantilla
        </button>
      </div>

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

      {/* Advertencias de filas con errores */}
      {rowErrors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
            <AlertTriangle size={16} />
            {rowErrors.length} fila{rowErrors.length !== 1 ? "s" : ""} con datos incompletos
            {validRows.length > 0 && " — serán omitidas, el resto se importará igual"}
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {rowErrors.map((err) => (
              <p key={err.row} className="text-xs text-amber-600">
                • Fila {err.row}: falta <span className="font-mono font-semibold">{err.fields.join(", ")}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Preview de filas válidas */}
      {validRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="font-medium text-slate-800">
                {validRows.length} pieza{validRows.length !== 1 ? "s" : ""} listas para importar
              </span>
              {rowErrors.length > 0 && (
                <span className="ml-2 text-xs text-amber-600">
                  ({rowErrors.length} de {totalRows} filas omitidas por datos faltantes)
                </span>
              )}
            </div>
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Upload size={15} />
              {importing ? "Importando..." : `Importar ${validRows.length} piezas`}
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
                {validRows.slice(0, 10).map((row, i) => (
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
            {validRows.length > 10 && (
              <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
                Mostrando 10 de {validRows.length} filas válidas
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sin filas válidas pero con errores */}
      {validRows.length === 0 && rowErrors.length > 0 && (
        <div className="text-center py-8 text-slate-500">
          <XCircle size={32} className="mx-auto mb-2 text-red-400" />
          <p className="font-medium">Ninguna fila tiene los datos completos</p>
          <p className="text-sm text-slate-400 mt-1">Revisá el archivo y corregí los campos obligatorios marcados arriba</p>
        </div>
      )}

      {/* Resultado de importación */}
      {result && (
        <div className={`rounded-xl border p-4 ${result.success > 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          {result.success > 0 && (
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <CheckCircle size={16} />
              {result.success} pieza{result.success !== 1 ? "s" : ""} importada{result.success !== 1 ? "s" : ""} correctamente
            </div>
          )}
          {result.errors?.length > 0 && (
            <div className={result.success > 0 ? "mt-2" : ""}>
              <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
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
