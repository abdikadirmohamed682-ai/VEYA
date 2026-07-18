"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ViewStoreButton() {
  const [storeUrl, setStoreUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadStoreUrl() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const { data } = await supabase
        .from("stores")
        .select("slug")
        .eq("user_id", session.user.id)
        .single();

      if (data?.slug) {
        setStoreUrl(`/store/${data.slug}`);
      }
    }

    loadStoreUrl();
  }, []);

  if (!storeUrl) return null;

  return (
    <a
      href={storeUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center rounded-2xl border border-[#D94680] bg-white px-5 py-3 text-sm font-semibold text-[#D94680] transition hover:bg-[#FCE7F3]"
    >
      View Store
    </a>
  );
}
