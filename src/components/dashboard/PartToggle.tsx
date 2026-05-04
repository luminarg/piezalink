"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  partId: string;
  isActive: boolean;
}

export default function PartToggle({ partId, isActive }: Props) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("parts")
      .update({ is_active: !active })
      .eq("id", partId);

    if (!error) {
      setActive(!active);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? "Desactivar pieza" : "Activar pieza"}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        active ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}
