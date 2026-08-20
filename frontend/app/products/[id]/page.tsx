"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStoreTypeDefinition, isStoreType } from "@/lib/store-types";

interface Product {
  id: string;
  product_name: string;
  description: string;
  price: number;
  category: string;
  quantity: number;
  main_image_url: string | null;
  status: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function fetchProduct() {
    try {
      const { data: userData } = await supabase.auth.getSession();

      if (!userData?.session?.user?.id) {
        router.replace("/login");
        return;
      }

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, store_type")
        .eq("user_id", userData.session.user.id)
        .single();

      if (storeError || !storeData?.id) {
        router.replace("/products");
        return;
      }

      const storeType = isStoreType(storeData.store_type) ? storeData.store_type : "digital";
      setCategories(getStoreTypeDefinition(storeType).categories as string[]);

      const { data: productData, error } = await supabase
        .from("products")
        .select("id, product_name, description, price, category, quantity, main_image_url, status")
        .eq("id", productId)
        .eq("store_id", storeData.id)
        .single();

      if (error || !productData) {
        setErrorMessage("Product not found");
        setLoading(false);
        return;
      }

      setProduct(productData as Product);
      setTitle(productData.product_name);
      setDescription(productData.description || "");
      setPrice(productData.price.toString());
      setCategory(productData.category);
      setQuantity(productData.quantity);
    } catch (error) {
      console.error("Error fetching product:", error);
      setErrorMessage("Failed to load product");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProduct();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [productId]);

  async function handleUpdateProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title || !description || !price || !category) {
      alert("Please complete all fields.");
      return;
    }

    const priceValue = Number(price);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      alert("Please enter a valid quantity.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data: userData } = await supabase.auth.getSession();
      if (!userData?.session?.user?.id) {
        throw new Error("Unable to verify ownership.");
      }

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", userData.session.user.id)
        .single();

      if (storeError || !storeData?.id) {
        throw new Error("Unable to verify store ownership.");
      }

      const { data: updatedProduct, error } = await supabase
        .from("products")
        .update({
          product_name: title,
          description,
          price: priceValue,
          category,
          quantity,
        })
        .eq("id", productId)
        .eq("store_id", storeData.id)
        .select("id")
        .single();

      if (error || !updatedProduct) {
        throw error || new Error("Product update was not authorized.");
      }

      router.push("/products");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message || "Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (errorMessage && !product) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/products");
              }
            }}
            className="px-6 py-2 bg-[#D94680] text-white rounded-lg font-bold hover:opacity-90"
          >
            <span aria-hidden="true">←</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="mt-1 text-gray-500">Update your product details</p>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleUpdateProduct}
            className="space-y-6 bg-white rounded-2xl p-8 shadow"
          >
            {errorMessage && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <div>
              <label className="mb-2 block font-semibold">Product Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
                placeholder="Product title"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Description</label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
                placeholder="Describe your product"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-semibold">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
                  placeholder="20.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-[#D94680] py-3 text-lg font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Product"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/products")}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-lg font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
