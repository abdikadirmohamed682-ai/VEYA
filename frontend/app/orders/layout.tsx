"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFC]">
        <p className="text-gray-500">Checking authentication…</p>
      </div>
    );
  }

  return (
    <div className="flex bg-[#FAFAFC]">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
