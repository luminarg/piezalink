/**
 * Genera un slug SEO-friendly a partir del número de pieza y el UUID.
 * Ejemplo: "ABC-1234" + "f3a2b1c4-..." → "abc-1234-f3a2b1"
 */
export function generatePartSlug(partNumber: string, id: string): string {
  const base = partNumber
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${id.slice(0, 6)}`;
}
