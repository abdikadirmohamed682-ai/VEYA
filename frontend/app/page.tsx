"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const FEATURED_PRODUCTS = [
  {
    name: "Classic Shirt",
    price: "$24",
    img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "Everyday Sneakers",
    price: "$49",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&auto=format&fit=crop",
  },
  {
    name: "Minimal Watch",
    price: "$39",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80&auto=format&fit=crop",
  },
];

export default function HomePage() {
  const visitRecorded = useRef(false);

  useEffect(() => {
    if (visitRecorded.current) return;
    visitRecorded.current = true;

    void supabase.from("platform_visits").insert({}).then(({ error }) => {
      if (error) {
        console.error("Failed to record platform visit:", error);
      }
    });
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* ============ HEADER ============ */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D94680] text-lg font-bold text-white">
              V
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
              VEYA
            </span>
          </Link>

          {/* Right actions */}
<div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-[#D94680] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#c2346f]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>
      {/* ============ END HEADER ============ */}

      {/* ============ HERO ============ */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-20 lg:px-10 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[45fr_55fr] lg:gap-16">
          {/* ---------- LEFT: TEXT ---------- */}
          <div>
            <h1 className="text-[42px] font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-[60px]">
              Build your online
              <br />
              business with VEYA.
            </h1>

            <p className="mt-6 max-w-[500px] text-lg leading-relaxed text-gray-600 sm:text-[19px] lg:mt-8">
              Create your store, add your products, and start selling online —
              simply.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center lg:mt-10">
              <Link
                href="/register"
                className="inline-flex h-[50px] items-center justify-center rounded-[10px] bg-[#D94680] px-7 text-base font-semibold text-white transition hover:bg-[#c2346f]"
              >
                Create Store Free
              </Link>

              <Link
                href="/login"
                className="inline-flex h-[50px] items-center justify-center rounded-[10px] border border-gray-200 bg-white px-7 text-base font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50"
              >
                Login
              </Link>
            </div>
          </div>

          {/* ---------- RIGHT: STOREFRONT PREVIEW ---------- */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            {/* Storeframe top bar */}
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold tracking-tight text-gray-900">
                NORA
              </span>
              <nav className="flex items-center gap-5">
                {["Home", "Shop", "Contact"].map((item) => (
                  <span
                    key={item}
                    className="text-xs font-medium text-gray-500 transition hover:text-gray-900"
                  >
                    {item}
                  </span>
                ))}
              </nav>
            </div>

            {/* Store hero image */}
            <div className="relative mt-4 h-48 overflow-hidden rounded-xl bg-[#F3EFEA] sm:h-64">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&auto=format&fit=crop"
                alt="NORA fashion store hero banner"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Store hero text + CTA */}
            <div className="mt-5 text-center">
              <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                Everyday essentials.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Simple pieces for your everyday style.
              </p>
              <span className="mt-3 inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">
                Shop Collection
              </span>
            </div>

            {/* Featured Products */}
            <div className="mt-6">
              <p className="text-sm font-bold text-gray-900">
                Featured Products
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {FEATURED_PRODUCTS.map((product) => (
                  <div key={product.name}>
                    <div className="aspect-square overflow-hidden rounded-xl bg-[#F3EFEA]">
                      <img
                        src={product.img}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 truncate text-xs font-semibold text-gray-900 sm:text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">{product.price}</p>
                  </div>
))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ END HERO ============ */}

      {/* ============ WHY VEYA ============ */}
      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[32px] font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[44px]">
              Everything you need to start selling online.
            </h2>
            <p className="mx-auto mt-5 max-w-[650px] text-[17px] leading-relaxed text-gray-600 sm:text-lg">
              Create your store, add your products, and manage your orders — all
              in one place.
            </p>
          </div>

          <div className="mt-16 grid gap-12 sm:gap-10 lg:grid-cols-3 lg:gap-8 lg:mt-20">
            {/* Feature 01 */}
            <div className="lg:pr-6">
              <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
                01
              </span>
              <h3 className="mt-4 text-xl font-bold text-gray-900 sm:text-[22px]">
                Create your store
              </h3>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Create an online store for your business without building a
                website from scratch.
              </p>
            </div>

            {/* Feature 02 */}
            <div className="lg:border-l lg:border-gray-100 lg:pl-8">
              <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
                02
              </span>
              <h3 className="mt-4 text-xl font-bold text-gray-900 sm:text-[22px]">
                Add your products
              </h3>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Add product names, prices, images, descriptions, categories, and
                stock.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                Sell physical products or digital products such as books and
                downloadable files.
              </p>
            </div>

            {/* Feature 03 */}
            <div className="lg:border-l lg:border-gray-100 lg:pl-8">
              <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
                03
              </span>
              <h3 className="mt-4 text-xl font-bold text-gray-900 sm:text-[22px]">
                Manage your orders
              </h3>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Keep your orders and customer information organized in one place.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ============ END WHY VEYA ============ */}
      {/* ============ HOW IT WORKS ============ */}
<section className="border-t border-gray-100 bg-[#F9F9F8]">
  <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">
    {/* Section heading */}
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-[32px] font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[44px]">
        Start selling in three simple steps.
      </h2>

      <p className="mx-auto mt-5 max-w-[620px] text-[17px] leading-relaxed text-gray-600 sm:text-lg">
        Set up your store, add your products, and start managing your orders.
      </p>
    </div>

    {/* Steps */}
    <div className="mt-16 grid gap-14 lg:mt-20 lg:grid-cols-3 lg:gap-8">
      {/* Step 01 */}
      <div>
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
            01
          </span>

          <div className="h-px flex-1 bg-gray-200 lg:hidden" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 sm:text-[22px]">
          Create your store
        </h3>

        <p className="mt-3 max-w-md text-base leading-relaxed text-gray-600">
          Create your online storefront and give your business a place to
          sell online.
        </p>

        {/* Store preview */}
        <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex h-10 items-center justify-between border-b border-gray-100 px-4">
            <span className="text-xs font-bold tracking-tight text-gray-900">
              NORA
            </span>

            <div className="flex gap-3">
              <span className="text-[9px] text-gray-400">Home</span>
              <span className="text-[9px] text-gray-400">Shop</span>
            </div>
          </div>

          <div className="p-3">
            <div className="h-32 overflow-hidden rounded-xl bg-[#F3EFEA] sm:h-36">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80&auto=format&fit=crop"
                alt="Example storefront"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="px-1 pb-1 pt-4">
              <div className="h-3 w-28 rounded bg-gray-900" />
              <div className="mt-2 h-2 w-40 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Step 02 */}
      <div>
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
            02
          </span>

          <div className="h-px flex-1 bg-gray-200 lg:hidden" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 sm:text-[22px]">
          Add your products
        </h3>

        <p className="mt-3 max-w-md text-base leading-relaxed text-gray-600">
          Add your product information, images, prices, categories, and
          available stock.
        </p>

        {/* Product preview */}
        <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <span className="text-xs font-semibold text-gray-900">
              Product
            </span>
          </div>

          <div className="flex gap-4 p-4">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#F3EFEA]">
              <img
                src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80&auto=format&fit=crop"
                alt="Example product"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <p className="truncate text-sm font-bold text-gray-900">
                Classic Shirt
              </p>

              <p className="mt-2 text-sm font-semibold text-gray-900">
                $24
              </p>

              <div className="mt-4 space-y-2">
                <div className="h-2 w-full rounded bg-gray-100" />
                <div className="h-2 w-4/5 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 03 */}
      <div>
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
            03
          </span>

          <div className="h-px flex-1 bg-gray-200 lg:hidden" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 sm:text-[22px]">
          Manage your orders
        </h3>

        <p className="mt-3 max-w-md text-base leading-relaxed text-gray-600">
          Keep your orders organized and manage customer information from one
          place.
        </p>

        {/* Order preview */}
        <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <span className="text-xs font-semibold text-gray-900">
              Orders
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  Classic Shirt
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Customer order
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                Pending
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  Everyday Sneakers
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Customer order
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                Completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
{/* ============ END HOW IT WORKS ============ */}
{/* ============ MERCHANT BENEFITS ============ */}
<section className="border-t border-gray-100 bg-white">
  <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-28">

    {/* Section heading */}
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-[32px] font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-[44px]">
        Built to help you sell your way.
      </h2>

      <p className="mx-auto mt-5 max-w-[650px] text-[17px] leading-relaxed text-gray-600 sm:text-lg">
        Whether you sell physical products or digital products, VEYA gives you
        the tools to run your store in one place.
      </p>
    </div>

    {/* Benefits */}
    <div className="mx-auto mt-16 max-w-5xl lg:mt-20">

      {/* Row 01 */}
      <div className="grid gap-10 border-b border-gray-100 py-10 first:pt-0 sm:grid-cols-[80px_1fr_1fr] sm:items-start sm:gap-8">
        <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
          01
        </span>

        <h3 className="text-xl font-bold text-gray-900 sm:text-[22px]">
          Sell physical products
        </h3>

        <p className="text-base leading-relaxed text-gray-600">
          Clothing, electronics, home goods, and more.
        </p>
      </div>

      {/* Row 02 */}
      <div className="grid gap-10 border-b border-gray-100 py-10 sm:grid-cols-[80px_1fr_1fr] sm:items-start sm:gap-8">
        <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
          02
        </span>

        <h3 className="text-xl font-bold text-gray-900 sm:text-[22px]">
          Sell digital products
        </h3>

        <p className="text-base leading-relaxed text-gray-600">
          Books, files, and other downloadable products.
        </p>
      </div>

      {/* Row 03 */}
      <div className="grid gap-10 border-b border-gray-100 py-10 sm:grid-cols-[80px_1fr_1fr] sm:items-start sm:gap-8">
        <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
          03
        </span>

        <h3 className="text-xl font-bold text-gray-900 sm:text-[22px]">
          Manage your business in one place
        </h3>

        <p className="text-base leading-relaxed text-gray-600">
          Products, orders, and customers organized in your store.
        </p>
      </div>

      {/* Row 04 */}
      <div className="grid gap-10 py-10 last:pb-0 sm:grid-cols-[80px_1fr_1fr] sm:items-start sm:gap-8">
        <span className="text-sm font-bold tracking-[0.2em] text-[#D94680]">
          04
        </span>

        <h3 className="text-xl font-bold text-gray-900 sm:text-[22px]">
          Start without platform commission
        </h3>

        <p className="text-base leading-relaxed text-gray-600">
          Start selling without a platform commission under the current VEYA
          model.
        </p>
      </div>

    </div>
  </div>
</section>
{/* ============ END MERCHANT BENEFITS ============ */}

{/* ============ FINAL CTA ============ */}
<section className="border-t border-gray-100 bg-[#F9F9F8]">
  <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-28 lg:py-32">

    <h2 className="text-[34px] font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-[52px]">
      Ready to build your store?
    </h2>

    <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed text-gray-600 sm:text-lg">
      Create your store and start selling with VEYA.
    </p>

    <div className="mt-8">
      <Link
        href="/register"
        className="inline-flex h-[50px] items-center justify-center rounded-[10px] bg-[#D94680] px-8 text-base font-semibold text-white transition hover:bg-[#c2346f]"
      >
        Create Store
      </Link>
    </div>

  </div>
</section>
{/* ============ END FINAL CTA ============ */}
    </main>
  );
}
