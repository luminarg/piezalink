import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Props {
  plan: string;
  status: string;
  expiresAt: string;
}

export default function SubscriptionBanner({ plan, status, expiresAt }: Props) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = status !== "active" || expiry <= now;
  const isExpiringSoon = !isExpired && daysLeft <= 30;

  if (!isExpired && !isExpiringSoon) return null;

  if (isExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <XCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
        <div className="flex-1">
          <p className="font-semibold text-red-800">Tu suscripción venció</p>
          <p className="text-sm text-red-600 mt-0.5">
            Tus piezas están ocultas en las búsquedas. Renová tu plan para que vuelvan a aparecer.
          </p>
        </div>
        <Link
          href="/planes"
          className="shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Ver planes
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
      <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={18} />
      <div className="flex-1">
        <p className="font-semibold text-amber-800">
          Tu plan {plan} vence en {daysLeft} día{daysLeft !== 1 ? "s" : ""}
        </p>
        <p className="text-sm text-amber-600 mt-0.5">
          El {expiry.toLocaleDateString("es-AR")} tus piezas dejarán de aparecer en las búsquedas.
        </p>
      </div>
      <Link
        href="/planes"
        className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        Renovar
      </Link>
    </div>
  );
}
