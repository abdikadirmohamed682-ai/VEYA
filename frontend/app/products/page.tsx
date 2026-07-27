"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ViewStoreButton from "@/components/ViewStoreButton";
import Image from "next/image";

interface Product {
  id: string;
  product_name: string;
  price: number;
  category: string;
  views: number;
  main_image_url: string | null;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeType, setStoreType] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setErrorMessage("Session expired"); setLoading(false); return; }
      const { data: store } = await supabase.from("stores").select("id, store_type").eq("user_id", session.user.id).single();
      if (!store) { setErrorMessage("Create a store first"); setLoading(false); return; }
      setStoreId(store.id);
      setStoreType(store.store_type);
      const { data, error } = await supabase.from("products").select("id, product_name, price, category, views, main_image_url, status").eq("store_id", store.id).order("created_at", { ascending: false });
      if (error) { setErrorMessage(error.message); } else { setProducts(data || []); }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to load products.");
    } finally { setLoading(false); }
  }

  useEffect(() => { const id = setTimeout(() => void fetchProducts(), 0); return () => clearTimeout(id); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    if (!storeId) { alert("Unable to verify your store."); return; }
    const { error } = await supabase.from("products").delete().eq("id", id).eq("store_id", storeId);
    if (error) { alert(error.message); return; }
    setProducts((prev) => prev.filter(function(p) { return p.id !== id; }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500">Manage all your products</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewStoreButton />
          <Link href="/products/new" className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-xl font-semibold">+ Add Product</Link>
        </div>
      </div>
      {errorMessage ? <p className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p> : null}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center">
          <h2 className="text-xl font-semibold mb-4">No products found</h2>
          <Link href="/products/new" className="inline-block mt-4 bg-pink-600 text-white px-6 py-3 rounded-xl">Create Product</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map(function(product) {
            return (
              <div key={product.id} className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="relative w-full h-52 bg-gray-100">
                  <Image src={product.main_image_url || "https://placehold.co/600x400?text=No+Image"} alt={product.product_name} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" unoptimized />
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-xl">{product.product_name}</h2>
                  <p className="text-gray-500 mt-1">{product.category}</p>
                  <p className="mt-4 text-pink-600 font-bold text-lg">${product.price}</p>
                  {storeType !== "digital" && <p className="text-sm text-gray-500 mt-2">👁 {product.views} views</p>}
                  <div className="flex gap-3 mt-6">
                    <Link href={"/products/" + product.id} className="flex-1 text-center bg-gray-100 rounded-xl py-2 hover:bg-gray-200">Edit</Link>
                    <button onClick={function() { handleDelete(product.id); }} className="flex-1 bg-red-600 text-white rounded-xl py-2 hover:bg-red-700">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}