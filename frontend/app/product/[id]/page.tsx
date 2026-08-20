"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BuyNowButton from "@/components/BuyNowButton";
import Image from "next/image";

interface Product {
  id: string;
  store_id: string;
  product_name: string;
  description: string | null;
  price: number;
  category: string;
  quantity: number;
  main_image_url: string | null;
  additional_image_urls: string[] | null;
}

export default function ProductPage() {
  const router = useRouter();
  const { id: productId } = useParams<{ id: string }>();
  const [productData, setProductData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const productResponse = await supabase
        .from("products")
        .select(
          "id, store_id, product_name, description, price, category, quantity, main_image_url, additional_image_urls"
        )
        .eq("id", productId)
        .eq("status", "active")
        .single();

      const data = productResponse.data as Product | null;
      const error = productResponse.error;

      if (error || !data) {
        setLoading(false);
        return;
      }

      setProductData(data);
      setLoading(false);
    }

    if (productId) {
      load();
    }
  }, [productId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F8] text-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button aria-label="Home"
                type="button"
                onClick={() => router.push("/")}
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
                    router.push("/");
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <span aria-hidden="true">←</span>
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8 lg:pt-10">
          <p className="text-gray-500">Loading product...</p>
        </div>
      </main>
    );
  }

  if (!productData) {
    return (
      <main className="min-h-screen bg-[#F7F7F8] text-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button aria-label="Home"
                type="button"
                onClick={() => router.push("/")}
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
                    router.push("/");
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <span aria-hidden="true">←</span>
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8 lg:pt-10">
          <p className="text-gray-500">Product not found.</p>
        </div>
      </main>
    );
  }

  const images = [
    productData.main_image_url,
    ...(productData.additional_image_urls || []),
  ].filter(Boolean) as string[];

  const mainImage = images[0] ?? null;
  const additionalImages = images.slice(1);

  return (
    <main className="min-h-screen bg-[#F7F7F8] text-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Home"
              type="button"
              onClick={() => router.push("/")}
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
                  router.push("/");
                }
              }}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <span aria-hidden="true">←</span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8 lg:pt-10">
        <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="bg-[#FAFAFB] p-4 sm:p-7 lg:p-10">
              <div className="overflow-hidden rounded-[24px] bg-white">
                {mainImage ? (
                  <div className="relative aspect-square w-full">
                    <Image
                      src={mainImage}
                      alt={productData.product_name}
                      fill
                      priority
                      sizes="(max-width: 1023px) 100vw, 55vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center text-sm font-semibold text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {additionalImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {additionalImages.slice(0, 4).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`${productData.product_name} ${index + 2}`}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-8 lg:p-12">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                {productData.product_name}
              </h1>

              <p className="mt-5 text-2xl font-black tracking-tight text-[#D94680] sm:text-3xl">
                ${Number(productData.price).toFixed(2)}
              </p>

              <div className="my-7 h-px bg-gray-100" />

              <div>
                <h2 className="text-sm font-bold text-gray-950">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
                  {productData.description || "No description available."}
                </p>
              </div>

              <div className="mt-auto pt-10">
                <BuyNowButton
                  product_id={productData.id}
                  store_id={productData.store_id}
                  title={productData.product_name}
                  price={productData.price}
                  image={productData.main_image_url || ""}
                  disabled={productData.quantity < 1}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7 text-center sm:px-6">
          <p className="text-sm font-bold text-gray-800">VEYA</p>
          <p className="mt-1 text-xs text-gray-400">Marketplace</p>
        </div>
      </footer>
    </main>
  );
}
