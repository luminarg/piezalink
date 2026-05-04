import Link from "next/link";
import { Wrench } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Wrench className="text-blue-600" size={22} />
            <span className="font-bold text-xl text-slate-900">
              Pieza<span className="text-blue-600">Link</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Ingresar</h1>
          <p className="text-slate-500 text-sm mt-1">
            Accedé a tu panel de vendedor
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-slate-500 mt-6">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
