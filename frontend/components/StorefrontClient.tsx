"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  product_name: string;
  description: string | null;
  price: number;
  category: string;
  main_image_url: string | null;
  status: string;
  is_featured?: boolean | null;
}

interface StorefrontClientProps {
  storeId: string;
  storeName: string;
  storeDescription: string | null;
  storeLogo: string | null;
  storeBanner: string | null;
  storeSlug: string;
  products: Product[];
}

export default function StorefrontClient({
  storeName,
  storeDescription,
  storeLogo,
  storeBanner,
  storeSlug,
  products,
}: StorefrontClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkCustomerSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setIsLoggedIn(!!session);
      }
    }

    checkCustomerSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsLoggedIn(!!session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.product_name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {storeLogo ? (
              <img
                src={storeLogo}
                alt={storeName}
                className="h-11 w-11 shrink-0 rounded-xl object-cover sm:h-12 sm:w-12"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-400 sm:h-12 sm:w-12">
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                {storeName}
              </h1>

              {storeDescription && (
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {storeDescription}
                </p>
              )}
            </div>
          </div>

          {isLoggedIn && (
            <Link
              href="/customer/orders"
              className="shrink-0 rounded-xl bg-[#D94680] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c73570]"
            >
              My Orders
            </Link>
          )}
        </div>
      </header>

      {/* Banner */}
      {storeBanner && (
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={storeBanner}
              alt={storeName}
              className="h-40 w-full object-cover sm:h-56 lg:h-72"
            />
          </div>
        </div>
      )}

      {/* Store content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Search */}
        <div className="mb-7">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#D94680] focus:ring-2 focus:ring-[#D94680]/10"
          />
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === item
                    ? "bg-[#D94680] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-12 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group flex min-w-0 flex-col"
              >
                {/* Product image */}
                <Link
                  href={`/product/${product.id}`}
                  className="block"
                  aria-label={`View ${product.product_name}`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                    {product.main_image_url ? (
                      <img
                        src={product.main_image_url}
                        alt={product.product_name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400">
                        No image
                      </div>
                    )}

                    {product.is_featured && (
                      <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#D94680] shadow-sm sm:text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                </Link>

                {/* Product information */}
                <div className="flex flex-1 flex-col pt-3 sm:pt-4">
                  <div className="min-w-0">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 transition group-hover:text-[#D94680] sm:text-base sm:leading-6">
                        {product.product_name}
                      </h3>
                    </Link>

                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 sm:text-sm">
                      {product.description || "No description available."}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-base font-bold text-[#D94680] sm:text-lg">
                      ${product.price}
                    </span>

                    <Link
                      href={`/product/${product.id}`}
                      className="shrink-0 rounded-lg bg-[#D94680] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#c73570] sm:px-4 sm:text-sm"
                    >
                      Buy
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-semibold text-gray-700">
              No products found
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or category.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}