"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import ViewStoreButton from "@/components/ViewStoreButton";

interface Product {
  id: string;
  product_name: string;
  price: number;
  category: string;
  main_image_url: string | null;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMessage("Session expired");
        setLoading(false);
        return;
      }

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id, store_type")
        .eq("user_id", session.user.id)
        .single();

      if (storeError || !store) {
        setErrorMessage("Create a store first");
        setLoading(false);
        return;
      }

      setStoreId(store.id);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, product_name, price, category, main_image_url, status"
        )
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => {
      void fetchProducts();
    }, 0);

    return () => clearTimeout(id);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;

    if (!storeId) {
      alert("Unable to verify your store.");
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (error) {
      alert(error.message);
      return;
    }

    setProducts((prev) =>
      prev.filter((product) => product.id !== id)
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F8FA] px-4 py-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Loading...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8F8FA]">
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-12 lg:pt-8">

        {/* HEADER */}
        <div className="mb-6 flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[25px] font-bold tracking-tight text-gray-900 sm:text-[28px]">
              Products
            </h1>

            <p className="mt-1 text-[12px] leading-5 text-gray-500 sm:text-[13px]">
              Manage all your products
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div>
              <ViewStoreButton />
            </div>

            <Link
              href="/products/new"
              className="inline-flex h-10 items-center justify-center rounded-[10px] bg-[#D94680] px-3.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#C93670] sm:h-11 sm:px-4 sm:text-[13px]"
            >
              + Add Product
            </Link>
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-5 rounded-[14px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* EMPTY STATE */}
        {products.length === 0 ? (
          <div className="rounded-[20px] border border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FCE7F0] text-[#D94680]">
              <span className="text-2xl">+</span>
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No products found
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              Add your first product and it will appear here.
            </p>

            <Link
              href="/products/new"
              className="mt-5 inline-flex rounded-[10px] bg-[#D94680] px-5 py-3 text-sm font-semibold text-white"
            >
              Create Product
            </Link>
          </div>
        ) : (
          <>
            {/* PRODUCT COUNT */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[12px] font-medium text-gray-500">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </p>
            </div>

            {/* PRODUCTS GRID */}
            <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">

              {products.map((product) => (
                <article
                  key={product.id}
                  className="min-w-0 overflow-hidden rounded-[16px] border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* IMAGE */}
                  <Link
                    href={`/products/${product.id}`}
                    className="block w-full"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                      <Image
                        src={
                          product.main_image_url ||
                          "https://placehold.co/600x600?text=No+Image"
                        }
                        alt={product.product_name}
                        fill
                        sizes="
                          (max-width: 639px) 50vw,
                          (max-width: 1023px) 33vw,
                          25vw
                        "
                        className="object-cover transition duration-300 hover:scale-105"
                        unoptimized
                      />

                      {/* STATUS */}
                      <div className="absolute left-2 top-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-semibold ${
                            product.status?.toLowerCase() === "active"
                              ? "bg-white/95 text-green-600"
                              : "bg-white/95 text-gray-500"
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* PRODUCT INFO */}
                  <div className="min-w-0 p-3 sm:p-3.5">

                    <Link
                      href={`/products/${product.id}`}
                      className="block min-w-0"
                    >
                      <h2 className="truncate text-[12px] font-bold text-gray-900 sm:text-[13px]">
                        {product.product_name}
                      </h2>

                      <p className="mt-1 truncate text-[10px] text-gray-500 sm:text-[11px]">
                        {product.category || "General"}
                      </p>
                    </Link>

                    {/* PRICE */}
                    <div className="mt-2.5 flex min-w-0 items-center justify-between gap-2">
                      <p className="shrink-0 text-[13px] font-bold text-[#D94680] sm:text-[14px]">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-3 flex min-w-0 gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex min-w-0 flex-1 items-center justify-center rounded-[9px] bg-gray-100 px-2 py-2 text-[10px] font-semibold text-gray-700 transition hover:bg-gray-200 sm:text-[11px]"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="flex min-w-0 flex-1 items-center justify-center rounded-[9px] bg-red-50 px-2 py-2 text-[10px] font-semibold text-red-600 transition hover:bg-red-100 sm:text-[11px]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}

            </div>
          </>
        )}
      </div>
    </main>
  );
}