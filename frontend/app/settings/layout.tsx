"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setAuthChecked(true);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (!authChecked) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-white px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D94680]" />

          <p className="text-sm font-medium text-gray-500">
            Checking authentication…
          </p>
        </div>
      </main>
    );
  }

  const isDashboard = pathname === "/dashboard";

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      {!isDashboard && (
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button aria-label="Home"
                type="button"
                onClick={() => router.push("/dashboard")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#D94680] transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94680]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></svg>
              </button>
              <button aria-label="Back"
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/dashboard");
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <span aria-hidden="true">←</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
