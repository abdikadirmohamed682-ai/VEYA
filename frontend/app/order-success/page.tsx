import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFC] py-20 px-4 sm:px-6 lg:px-10 text-gray-900">
      <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-12 shadow-xl shadow-pink-100/70 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#D94680] text-4xl font-bold text-white">
          ✅
        </div>
        <h1 className="mt-8 text-5xl font-bold text-gray-900">Order Placed Successfully</h1>
        <p className="mt-4 text-gray-600">Your order is confirmed and being processed. We will contact you shortly.</p>
        <Link
          href="/"
          className="mt-10 inline-flex rounded-3xl bg-[#D94680] px-10 py-4 text-lg font-bold text-white transition hover:bg-pink-600"
        >
          Return to Store
        </Link>
      </div>
    </main>
  );
}
