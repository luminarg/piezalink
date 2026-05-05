"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

const PLANS = ["all", "trial", "basic", "pro", "premium"];

const planLabels: Record<string, string> = {
  all: "Todos los planes",
  trial: "Trial",
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
};

export default function UserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const plan = searchParams.get("plan") ?? "all";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Buscador */}
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por negocio o email..."
          defaultValue={q}
          onChange={(e) => updateParams("q", e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Filtro por plan */}
      <select
        value={plan}
        onChange={(e) => updateParams("plan", e.target.value)}
        className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {PLANS.map((p) => (
          <option key={p} value={p}>
            {planLabels[p]}
          </option>
        ))}
      </select>
    </div>
  );
}
