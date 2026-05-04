import { Wrench } from "lucide-react";
import Link from "next/link";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
          <p className="text-slate-500 text-sm mt-1">Elegí una contraseña segura</p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
