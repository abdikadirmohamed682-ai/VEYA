"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  product_name: string;
  description: string | null;
  price: number;
  category: string | null;
  quantity: number;
  main_image_url: string | null;
  status: string | null;
  reviewed: boolean;
  created_at: string;
  stores: {
    store_name: string;
    logo: string | null;
  } | null;
}

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get product
        const { data, error: productError } = await supabase
          .from("products")
          .select(`
            id,
            product_name,
            description,
            price,
            category,
            quantity,
            main_image_url,
            status,
            reviewed,
            created_at,
            stores (
              store_name,
              logo
            )
          `)
          .eq("id", productId)
          .single();

        if (productError || !data) {
          setError(productError?.message || "Product not found");
          return;
        }

        const productData = data as unknown as Product;

        setProduct(productData);

        // ---------------------------------
        // MARK PRODUCT AS REVIEWED
        // ---------------------------------
        if (!productData.reviewed) {
          const { error: reviewError } = await supabase
            .from("products")
            .update({
              reviewed: true,
            })
            .eq("id", productId);

          if (reviewError) {
            console.error(
              "Failed to mark product as reviewed:",
              reviewError.message
            );
          } else {
            setProduct((current) =>
              current
                ? {
                    ...current,
                    reviewed: true,
                  }
                : current
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // ---------------------------------
  // DELETE PRODUCT
  // ---------------------------------
  const deleteProduct = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      "Delete this product permanently? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);

      const { data, error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .select("id");

      if (deleteError) {
        setError(`Delete failed: ${deleteError.message}`);
        return;
      }

      if (!data || data.length === 0) {
        setError(
          "Product was not deleted. Check the Supabase DELETE RLS policy."
        );
        return;
      }

      // Product was really deleted.
      window.location.href = "/admin/products";
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  };

  // ---------------------------------
  // LOADING
  // ---------------------------------
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">Loading product...</p>
        </div>
      </main>
    );
  }

  // ---------------------------------
  // ERROR
  // ---------------------------------
  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="mx-auto max-w-7xl px-8 py-10">

          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/admin/products");
              }
            }}
            className="text-pink-500 hover:underline"
          >
            <span aria-hidden="true">←</span>
          </button>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error || "Product not found"}
          </div>

        </div>
      </main>
    );
  }

  const verified = product.reviewed;

  // ---------------------------------
  // PAGE
  // ---------------------------------
  return (
    <main className="min-h-screen bg-[#FAFAFC]">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">

          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/admin/products");
              }
            }}
            className="text-pink-500 hover:underline"
          >
            <span aria-hidden="true">←</span>
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-8 py-10">

        {/* PRODUCT CARD */}
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">

          {/* TOP */}
          <div className="flex flex-col gap-8 md:flex-row">

            {/* IMAGE */}
            <div className="shrink-0">

              {product.main_image_url ? (
                <img
                  src={product.main_image_url}
                  alt={product.product_name}
                  className="h-64 w-64 rounded-3xl border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-3xl bg-gray-100 text-gray-400">
                  <span>No image</span>
                </div>
              )}

            </div>

            {/* PRODUCT INFO */}
            <div className="flex-1">

              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {product.product_name}
                  </h1>

                  <p className="mt-2 text-gray-500">
                    {product.category || "No category"}
                  </p>
                </div>

                {/* REVIEW STATUS */}
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                    verified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {verified
                    ? "✓ Product Verified"
                    : "Waiting for Review"}
                </span>

              </div>

              {/* PRICE */}
              <p className="mt-6 text-4xl font-bold text-[#D94680]">
                ${Number(product.price).toFixed(2)}
              </p>

              {/* DESCRIPTION */}
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-500">
                  Description
                </p>

                <p className="mt-2 leading-7 text-gray-700">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* STOCK */}
              <div className="mt-6">

                <p className="text-sm font-semibold text-gray-500">
                  Stock
                </p>

                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {product.quantity}
                </p>

              </div>

            </div>

          </div>

          {/* DETAILS */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">

            {/* STORE */}
            <div className="rounded-2xl border border-gray-200 p-5">

              <p className="text-sm text-gray-500">
                Store
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {product.stores?.store_name || "—"}
              </p>

            </div>

            {/* CREATED */}
            <div className="rounded-2xl border border-gray-200 p-5">

              <p className="text-sm text-gray-500">
                Created
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {product.created_at
                  ? new Date(product.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "—"}
              </p>

            </div>

            {/* PRODUCT ID */}
            <div className="rounded-2xl border border-gray-200 p-5">

              <p className="text-sm text-gray-500">
                Product ID
              </p>

              <p className="mt-1 break-all font-mono text-sm font-semibold text-gray-900">
                {product.id}
              </p>

            </div>

            {/* DATABASE STATUS */}
            <div className="rounded-2xl border border-gray-200 p-5">

              <p className="text-sm text-gray-500">
                Product Status
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {product.status || "—"}
              </p>

            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-10 flex flex-wrap gap-4 border-t pt-8">

            <button aria-label="Back"
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/admin/products");
                }
              }}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <span aria-hidden="true">←</span>
            </button>

            {/* DELETE */}
            <button
              type="button"
              onClick={deleteProduct}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}