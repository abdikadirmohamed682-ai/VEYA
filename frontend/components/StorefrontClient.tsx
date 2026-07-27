"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface StorefrontProduct {
  id: string;
  product_name: string;
  price: number;
  category: string;
  main_image_url: string | null;
  status: string;
  description: string | null;
  is_featured?: boolean | null;
  views?: number | null;
}

interface StorefrontClientProps {
  storeName: string;
  storeDescription: string | null;
  storeLogo: string | null;
  storeBanner: string | null;
  storeSlug: string;
  products: StorefrontProduct[];
}

const sortOptions = [
  { value: "featured", label: "Recommended" },
  { value: "low-to-high", label: "Price: Low to High" },
  { value: "high-to-low", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export default function StorefrontClient({
  storeName,
  storeDescription,
  storeLogo,
  storeBanner,
  products,
}: StorefrontClientProps) {
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("featured");

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("id", session.user.id)
          .single();
        setIsCustomerLoggedIn(!!customer);
      }
    }
    checkAuth();
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          products
            .map((product) => product.category?.trim() || "General")
            .filter(Boolean)
        )
      ),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const matchingProducts = products.filter((product) => {
      const productCategory = product.category?.trim() || "General";
      const matchesCategory =
        selectedCategory === "All" || productCategory === selectedCategory;

      const matchesSearch =
        !normalizedSearch ||
        [product.product_name, product.description, product.category]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesSearch;
    });

    return matchingProducts.sort((a, b) => {
      if (sortOption === "high-to-low") {
        return b.price - a.price;
      }

      if (sortOption === "low-to-high") {
        return a.price - b.price;
      }

      if (sortOption === "popular") {
        return (b.views ?? 0) - (a.views ?? 0);
      }

      const aFeatured = a.is_featured ? 1 : 0;
      const bFeatured = b.is_featured ? 1 : 0;

      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured;
      }

      return (b.views ?? 0) - (a.views ?? 0);
    });
  }, [products, searchTerm, selectedCategory, sortOption]);

  return (
<main className="min-h-screen bg-[#FAFAFC] text-gray-900">
      {/* Customer navigation header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D94680] text-xl font-bold text-white">
            V
          </Link>

          <nav className="flex items-center gap-4">
            {isCustomerLoggedIn ? (
              <Link
                href="/customer/orders"
                className="rounded-2xl bg-[#D94680] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                My Orders
              </Link>
            ) : (
              <>
                <Link
                  href="/customer/login"
                  className="rounded-2xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  href="/customer/signup"
                  className="rounded-2xl bg-[#D94680] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <section className="overflow-hidden bg-white">
        <div className="relative">
          <div className="h-72 bg-gray-100 sm:h-96">
            {storeBanner ? (
              <img
                src={storeBanner}
                alt={storeName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl font-bold text-gray-300">
                {storeName}
              </div>
            )}
          </div>

          <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
            <div className="-mt-20 rounded-[2rem] border border-gray-200 bg-white p-8 shadow-2xl sm:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-[#FCE7F3] text-4xl font-bold text-[#D94680] shadow-sm">
                    {storeLogo ? (
                      <img src={storeLogo} alt={storeName} className="h-full w-full object-cover" />
                    ) : (
                      storeName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Storefront</p>
                    <h1 className="mt-2 text-4xl font-bold text-gray-900 sm:text-5xl">
                      {storeName}
                    </h1>
                    <p className="mt-4 max-w-2xl text-gray-600">
                      {storeDescription || "Browse products from this curated collection."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-2xl bg-[#FCE7F3] px-4 py-3 text-sm font-semibold text-[#B91C57]">
                    {products.length} active product{products.length === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
                    {categories.length - 1} categories
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#D94680]">Discover</p>
            <h2 className="mt-2 text-3xl font-bold">Find the perfect product</h2>
          </div>
          <p className="text-gray-500">
            {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} matched
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_auto]">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products, categories, or keywords"
              className="w-full rounded-3xl border border-gray-200 bg-white px-5 py-4 text-gray-900 shadow-sm outline-none transition focus:border-[#D94680] focus:ring-2 focus:ring-[#FCE7F3]"
            />
            <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-gray-400">
              🔍
            </span>
          </label>

          <div className="flex items-center gap-3">
            <div className="min-w-[180px] rounded-3xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Sort by
              </label>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
                className="w-full bg-transparent text-gray-900 outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-[#D94680] text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-72 bg-gray-100">
                  {product.main_image_url ? (
                    <img
                      src={product.main_image_url}
                      alt={product.product_name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      No image
                    </div>
                  )}

                  {product.is_featured && (
                    <span className="absolute left-4 top-4 rounded-full bg-[#D94680] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                      Featured
                    </span>
                  )}

                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-3xl bg-white/90 px-4 py-2 text-xs text-gray-700 backdrop-blur-sm">
                    <span>{product.category || "General"}</span>
                    <span>{product.views ?? 0} views</span>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {product.product_name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {product.description || "No description available."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-2xl font-bold text-[#D94680]">
                      ${product.price.toFixed(2)}
                    </span>
                    <Link
                      href={`/product/${product.id}`}
                      className="rounded-3xl border border-[#D94680] px-4 py-3 text-sm font-semibold text-[#D94680] transition hover:bg-[#FCE7F3]"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-[2rem] border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-sm">
              <p className="text-lg font-semibold">No products match your search.</p>
              <p className="mt-2">Try a different keyword or category.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
