"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "abdikadirmohamed682@gmail.com";

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    async function verify() {
      try {
        // Set a timeout to prevent indefinite hanging
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.error("Admin auth check timeout");
            setError("Authentication check timed out");
            router.replace("/admin/login");
          }
        }, 5000);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        clearTimeout(timeoutId);

        if (sessionError) {
          console.error("getSession error:", sessionError);
          if (mounted) {
            setError("Session error");
            router.replace("/admin/login");
          }
          return;
        }

        const session = sessionData?.session ?? null;

        if (!session) {
          if (mounted) {
            router.replace("/admin/login");
          }
          return;
        }

        const email = session.user.email ?? "";
        if (email !== ADMIN_EMAIL) {
          // Immediately sign out and redirect
          await supabase.auth.signOut();
          if (mounted) {
            router.replace("/admin/login");
          }
          return;
        }

        // Auth check passed
        if (mounted) setChecking(false);
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("Admin auth check error:", err);
        if (mounted) {
          setError("Authentication error");
          router.replace("/admin/login");
        }
      }
    }

    verify();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [router]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    router.replace("/admin/login");
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Checking admin authentication…</p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </main>
    );
  }

  const isDashboard = pathname === "/admin";

  return (
    <div>
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            {!isDashboard && (
              <button aria-label="Back"
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/admin");
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <span aria-hidden="true">←</span>
              </button>
            )}
            <Link href="/admin" className="text-lg font-bold text-gray-900">
              Admin Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button aria-label="Home"
              type="button"
              onClick={() => router.push("/admin")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#D94680] transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94680]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></svg>
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div>{children}</div>
    </div>
  );
}
