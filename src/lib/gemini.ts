import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const geminiFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Parsea una búsqueda libre del comprador en parámetros estructurados.
 * Ej: "filtro de aceite para peugeot 208 2019" →
 * { brand: "PEUGEOT", model: "208", year: "2019", part_type: "filtro de aceite", keywords: ["filtro", "aceite"] }
 */
export async function parseSearchQuery(query: string): Promise<{
  brand?: string;
  model?: string;
  year?: string;
  part_type?: string;
  keywords: string[];
}> {
  try {
    const prompt = `Eres un asistente especializado en repuestos automotrices argentinos.
Analizá esta búsqueda de un comprador y extraé la información estructurada.
Devolvé SOLO un JSON válido sin explicaciones ni formato markdown.

Búsqueda: "${query}"

Responde con este JSON:
{
  "brand": "marca del vehículo en MAYÚSCULAS o null",
  "model": "modelo del vehículo o null",
  "year": "año como string o null",
  "part_type": "tipo de pieza en español o null",
  "keywords": ["palabras clave relevantes para buscar en la base de datos"]
}

Ejemplos de marcas: TOYOTA, VOLKSWAGEN, PEUGEOT, FORD, CHEVROLET, RENAULT, FIAT, HONDA, NISSAN, HYUNDAI
Si no hay info de vehículo, devolvé null en brand/model/year.
Los keywords deben incluir sinónimos y variantes (ej: "filtro aceite" → ["filtro", "aceite", "filter", "oil filter"])`;

    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text().trim();
    // Limpiar posible markdown
    const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(json);
  } catch {
    // Fallback: devolver keywords básicos
    return { keywords: query.split(" ").filter((w) => w.length > 2) };
  }
}

/**
 * Compara una solicitud de comprador con el inventario de un vendedor
 * y devuelve las piezas que coinciden semánticamente.
 */
export async function matchPartsToRequest(
  request: {
    brand: string;
    model: string;
    year?: number | null;
    description: string;
    part_number?: string | null;
  },
  parts: Array<{
    id: string;
    part_number: string;
    description: string;
    compatibility: string;
    brand?: string | null;
  }>
): Promise<Array<{ part_id: string; confidence: "alta" | "media" | "baja"; reason: string }>> {
  if (parts.length === 0) return [];

  try {
    const partsList = parts
      .slice(0, 30) // Límite para no exceder tokens
      .map((p) => `ID:${p.id} | Nro:${p.part_number} | Desc:${p.description} | Compat:${p.compatibility}`)
      .join("\n");

    const prompt = `Eres un experto en repuestos automotrices. Un comprador busca una pieza y tenés un inventario disponible.
Devolvé SOLO un JSON válido sin explicaciones ni markdown.

SOLICITUD DEL COMPRADOR:
- Vehículo: ${request.brand} ${request.model} ${request.year ?? ""}
- Descripción: ${request.description}
${request.part_number ? `- Número de parte: ${request.part_number}` : ""}

INVENTARIO DISPONIBLE:
${partsList}

Encontrá las piezas que podrían satisfacer esta solicitud. Considerá sinónimos, variantes (OEM/aftermarket), y compatibilidad de modelos similares.

Responde con este JSON:
{
  "matches": [
    {
      "part_id": "id exacto de la pieza",
      "confidence": "alta | media | baja",
      "reason": "breve explicación en español de por qué coincide"
    }
  ]
}

Si ninguna coincide, devolvé { "matches": [] }.
Solo incluí coincidencias con confianza alta o media.`;

    const result = await geminiFlash.generateContent(prompt);
    const text = result.response.text().trim();
    const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(json);
    return parsed.matches ?? [];
  } catch {
    return [];
  }
}
