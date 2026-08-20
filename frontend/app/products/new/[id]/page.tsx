"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FAFAFC]">

      <div className="mx-auto max-w-7xl px-8 py-10">

        <button aria-label="Back"
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="text-sm font-semibold text-pink-600"
        >
          <span aria-hidden="true">←</span>
        </button>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">

          {/* Images */}

          <div>

            <div className="h-[520px] overflow-hidden rounded-3xl border bg-white">

              <div className="flex h-full items-center justify-center text-gray-400">
                Product Image
              </div>

            </div>

            
  {[1,2,3,4].map((image)=>(
    <div
      key={image}
      className="h-24 rounded-2xl border bg-white flex items-center justify-center text-gray-400"
    >
      Image
    </div>
  ))}

</div>

</div>

{/* Product Information */}

<div>

  <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-600">
    Digital Product
  </span>

  <h1 className="mt-6 text-5xl font-bold">
    Product Name
  </h1>

  <div className="mt-5 flex items-center gap-4">

    <span className="text-yellow-500 text-xl">
      ★★★★★
    </span>

    <span className="font-semibold">
      4.9
    </span>

    <span className="text-gray-500">
      (214 Reviews)
    </span>

  </div>

  <div className="mt-8 text-5xl font-bold text-pink-600">
    $20
  </div>

  <div className="mt-8 rounded-2xl border bg-white p-6">

    <h2 className="mb-4 text-2xl font-bold">
      Description
    </h2>

    <p className="leading-8 text-gray-600">
      Product description will appear here.
      The seller can explain everything about the product,
      what the customer will receive,
      and any additional information.
    </p>

  </div>
            <div className="mt-8">

            <div className="mb-6 rounded-2xl border bg-white p-6">

              <h3 className="mb-4 text-xl font-bold">
                Seller
              </h3>

              <div className="flex items-center gap-5">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#D94680] text-3xl font-bold text-white">
                  V
                </div>

                <div>

                  <h4 className="text-2xl font-bold">
                    Mohamed Ali
                  </h4>

                  <p className="text-gray-500">
                    Joined VEYA • Jan 2026
                  </p>

                  <div className="mt-2 flex gap-3">

                    <a
                      href="#"
                      className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                    >
                      TikTok
                    </a>

                    <a
                      href="#"
                      className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                    >
                      WhatsApp
                    </a>

                  </div>

                </div>

              </div>

            </div>

            <div className="rounded-2xl border bg-white p-6">

              <h3 className="mb-4 text-xl font-bold">
                Delivery
              </h3>

              <div className="space-y-3 text-gray-600">

                <p>✔ Instant delivery after payment.</p>

                <p>✔ Secure payment.</p>

                <p>✔ Official seller.</p>

              </div>

            </div>

            <div className="mt-8">

              <Link
                href="/checkout"
                className="block rounded-2xl bg-[#D94680] py-5 text-center text-xl font-bold text-white hover:opacity-90"
              >
                Buy Now
              </Link>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}