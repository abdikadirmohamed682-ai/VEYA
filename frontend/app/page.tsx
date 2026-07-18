import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center px-6">

      <div className="max-w-3xl text-center">

        <div className="mb-8 flex justify-center">
          <div className="h-24 w-24 rounded-3xl bg-[#D94680] flex items-center justify-center text-white text-5xl font-bold shadow-lg">
            V
          </div>
        </div>

        <h1 className="text-6xl font-extrabold text-gray-900">
          VEYA
        </h1>

        <p className="mt-6 text-xl text-gray-600">
          Create your online store in minutes.
        </p>

        <div className="mt-14 flex justify-center gap-6">

          <Link
            href="/register"
            className="rounded-2xl bg-[#D94680] px-10 py-4 text-lg font-bold text-white transition hover:scale-105"
          >
            Create Store Free
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-gray-300 bg-white px-10 py-4 text-lg font-bold text-gray-800 transition hover:bg-gray-100"
          >
            Login
          </Link>

        </div>

      </div>

    </main>
  );
}