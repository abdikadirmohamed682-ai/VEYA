export default function TopBar() {
  return (
    <div className="mb-8 flex items-center justify-between rounded-3xl bg-white p-6 shadow-lg">

      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Welcome back to VEYA.
        </p>
      </div>

      <div className="flex items-center gap-4">

        <input
          type="text"
          placeholder="Search..."
          className="rounded-2xl border border-gray-200 px-5 py-3 outline-none transition focus:border-pink-500"
        />

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-xl transition hover:bg-pink-200">
          🔔
        </button>

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500 font-bold text-white">
          A
        </button>

      </div>

    </div>
  );
}