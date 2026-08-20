"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  created_at: string;
  stores: {
    store_name: string;
    logo: string | null;
  } | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: productsError } = await supabase
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
          created_at,
          stores (
            store_name,
            logo
          )
        `)
        .order("created_at", { ascending: false });

      if (productsError) {
        setError(productsError.message);
        setProducts([]);
        return;
      }

      setProducts((data || []) as unknown as Product[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY PRODUCT
  // =========================
  const verifyProduct = async (productId: string) => {
    try {
      setActionLoading(productId);
      setError(null);
      setSuccess(null);

      const { data, error: updateError } = await supabase
        .from("products")
        .update({
          status: "active",
        })
        .eq("id", productId)
        .select("id, status")
        .single();

      if (updateError) {
        setError(`Verification failed: ${updateError.message}`);
        return;
      }

      if (!data || data.status !== "active") {
        setError("Verification failed: product status was not changed.");
        return;
      }

      // تحديث القائمة بعد نجاح UPDATE الحقيقي في Supabase
      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? {
                ...product,
                status: "active",
              }
            : product
        )
      );

      setSuccess("Product verified successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const deleteProduct = async (productId: string) => {
    const confirmed = window.confirm(
      "Delete this product permanently? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setActionLoading(productId);
      setError(null);
      setSuccess(null);

      const { data, error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
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

      // حذف المنتج من الواجهة بعد الحذف الحقيقي من قاعدة البيانات
      setProducts((current) =>
        current.filter((product) => product.id !== productId)
      );

      setSuccess("Product deleted permanently.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // SEARCH
  // =========================
  const filteredProducts = products.filter((product) => {
    if (!search.trim()) return true;

    const q = search.toLowerCase();

    return (
      product.product_name.toLowerCase().includes(q) ||
      product.id.toLowerCase().includes(q) ||
      (product.stores?.store_name || "").toLowerCase().includes(q)
    );
  });

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">Loading products...</p>
        </div>
      </main>
    );
  }

  // =========================
  // PAGE
  // =========================
  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>

            <p className="mt-2 text-gray-500">
              View and manage all marketplace products.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">

        {/* HEADER CARD */}
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Admin
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              All products
            </h2>
          </div>

          <div className="mt-4 rounded-3xl bg-[#FCE7F3] px-5 py-4 text-sm font-semibold text-[#B91C7A] sm:mt-0">
            {products.length} products
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, store name, or product ID..."
            className="w-full rounded-2xl border border-gray-300 bg-white p-4 outline-none transition focus:border-[#D94680]"
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 font-semibold text-green-700">
            {success}
          </div>
        )}

        {/* EMPTY */}
        {!error && filteredProducts.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <h2 className="text-2xl font-bold">
              {search
                ? "No products match your search"
                : "No products found"}
            </h2>

            <p className="mt-3 text-gray-500">
              {search
                ? "Try a different search term."
                : "There are no products yet."}
            </p>
          </div>
        )}

        {/* PRODUCTS TABLE */}
        {filteredProducts.length > 0 && (
          <div className="overflow-hidden rounded-3xl bg-white shadow">
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px] border-collapse text-left">

                <thead className="bg-gray-100">
                  <tr>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Product Image
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Product Name
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Store Name
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Category
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Price
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Stock
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Status
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Created
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map((product) => {

                    const busy = actionLoading === product.id;

                    // IMPORTANT:
                    // In your database:
                    // active = verified
                    const verified = product.status === "active";

                    return (
                      <tr
                        key={product.id}
                        className="border-t hover:bg-gray-50"
                      >

                        {/* IMAGE */}
                        <td className="p-5">
                          {product.main_image_url ? (
                            <img
                              src={product.main_image_url}
                              alt={product.product_name}
                              className="h-14 w-14 rounded-2xl border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                              <span className="text-xs">
                                No image
                              </span>
                            </div>
                          )}
                        </td>

                        {/* NAME */}
                        <td className="p-5 font-semibold text-gray-900">
                          {product.product_name}
                        </td>

                        {/* STORE */}
                        <td className="p-5 text-gray-600">
                          {product.stores?.store_name || "—"}
                        </td>

                        {/* CATEGORY */}
                        <td className="p-5 text-gray-600">
                          {product.category || "—"}
                        </td>

                        {/* PRICE */}
                        <td className="p-5 font-bold text-[#D94680]">
                          ${Number(product.price).toFixed(2)}
                        </td>

                        {/* STOCK */}
                        <td className="p-5 text-gray-700">
                          {product.quantity}
                        </td>

                        {/* STATUS */}
                        <td className="p-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                              verified
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {verified
                              ? "Verified"
                              : "Not verified"}
                          </span>

                        </td>

                        {/* DATE */}
                        <td className="p-5 text-gray-600">

                          {product.created_at
                            ? new Date(
                                product.created_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}

                        </td>

                        {/* ACTIONS */}
                        <td className="p-5">

                          <div className="flex flex-wrap gap-2">

                            {/* VIEW */}
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="inline-flex rounded-xl bg-[#D94680] px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                            >
                              View
                            </Link>

                            {/* VERIFY */}
                            {!verified && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  verifyProduct(product.id)
                                }
                                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {busy ? "..." : "Verify"}
                              </button>
                            )}

                            {/* DELETE */}
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                deleteProduct(product.id)
                              }
                              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {busy ? "..." : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}