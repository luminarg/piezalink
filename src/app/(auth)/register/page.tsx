import Link from "next/link";
import { Wrench } from "lucide-react";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Wrench className="text-blue-600" size={22} />
            <span className="font-bold text-xl text-slate-900">
              Pieza<span className="text-blue-600">Link</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="text-slate-500 text-sm mt-1">
            30 días de prueba gratis, sin tarjeta de crédito
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
