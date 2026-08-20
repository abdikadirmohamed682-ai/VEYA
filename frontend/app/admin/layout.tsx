"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface ProductNotification {
  id: string;
  product_name: string;
  main_image_url: string | null;
  created_at: string;
  stores: {
    store_name: string;
  } | null;
}

const ADMIN_EMAIL = "abdikadirmohamed682@gmail.com";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function verify() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData?.session) {
          if (mounted) {
            router.replace("/admin/login");
          }
          return;
        }

        const email = sessionData.session.user.email ?? "";

        if (email !== ADMIN_EMAIL) {
          await supabase.auth.signOut();
          if (mounted) {
            router.replace("/admin/login");
          }
          return;
        }

        if (mounted) {
          setAuthorized(true);
          setChecking(false);
        }
      } catch {
        if (mounted) {
          router.replace("/admin/login");
        }
      }
    }

    verify();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          product_name,
          main_image_url,
          created_at,
          stores (
            store_name
          )
        `)
        .eq("reviewed", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error) {
        setProducts((data || []) as unknown as ProductNotification[]);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [authorized]);

  if (checking || !authorized) {
    return (
      <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Checking admin authentication…</p>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* ADMIN TOP BAR */}
      <div className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/admin"
            className="text-xl font-bold text-gray-900"
          >
            Admin Dashboard
          </Link>

          {/* NOTIFICATION BELL */}
          <div className="relative">

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-xl transition hover:bg-gray-200"
            >
              🔔

              {products.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {products.length}
                </span>
              )}
            </button>

            {/* NOTIFICATION MENU */}
            {open && (
              <div className="absolute right-0 mt-3 w-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                <div className="border-b px-5 py-4">
                  <h3 className="font-bold text-gray-900">
                    Products to review
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {products.length} product
                    {products.length === 1 ? "" : "s"} waiting for review
                  </p>
                </div>

                {products.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-gray-500">
                      No new products to review.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">

                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/admin/products/${product.id}`}
                        onClick={() => setOpen(false)}
                        className="flex gap-3 border-b px-5 py-4 transition hover:bg-gray-50"
                      >

                        {product.main_image_url ? (
                          <img
                            src={product.main_image_url}
                            alt={product.product_name}
                            className="h-12 w-12 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">
                            {product.product_name}
                          </p>

                          <p className="truncate text-sm text-gray-500">
                            {product.stores?.store_name || "Unknown store"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(
                              product.created_at
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                      </Link>
                    ))}

                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      </div>

      {children}
    </>
  );
}