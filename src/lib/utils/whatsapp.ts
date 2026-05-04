/**
 * Genera un link de WhatsApp con mensaje pre-cargado para consulta de pieza
 */
export function buildWhatsAppLink(whatsappNumber: string, partNumber: string): string {
  const cleaned = whatsappNumber.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Hola, vengo de PiezaLink y consulto por la pieza nro "${partNumber}"`
  );
  return `https://wa.me/${cleaned}?text=${message}`;
}
