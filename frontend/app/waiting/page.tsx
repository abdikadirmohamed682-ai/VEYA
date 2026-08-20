"use client";

import { useRouter } from "next/navigation";

export default function WaitingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center">

      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 text-center shadow">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-100">

          <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-600 border-t-transparent"></div>

        </div>

        <h1 className="mt-8 text-4xl font-bold">
          Waiting For Payment Confirmation
        </h1>

        <p className="mt-5 leading-8 text-gray-600">
          Your payment information has been submitted.
          <br />
          The seller will review your payment.
          <br />
          Once approved your order status will update automatically.
        </p>

        <div className="mt-10 rounded-2xl border bg-gray-50 p-6">

          <h2 className="text-xl font-bold">
            Current Status
          </h2>

          <p className="mt-4 font-semibold text-orange-500">
            Waiting...
          </p>

        </div>

        <div className="mt-10 flex justify-center gap-4">

          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <span aria-hidden="true">←</span>
          </button>

          <button aria-label="Home"
            type="button"
            onClick={() => router.push("/")}
            className="rounded-2xl bg-[#D94680] px-6 py-3 font-semibold text-white transition hover:bg-[#C72F6E]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></svg>
          </button>

        </div>

      </div>

    </main>
  );
}
