export default function StoreSetup() {
  return (
    <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">

      <div className="max-w-2xl">

        <h1 className="text-4xl font-bold text-gray-900">
          Create Your First Store
        </h1>

        <p className="mt-4 text-lg text-gray-500">
          Welcome to VEYA. Let's create your first online store.
        </p>

        <div className="mt-10 space-y-6">

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Store Name
            </label>

            <input
              type="text"
              placeholder="Example: VEYA Fashion"
              className="w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none transition focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Store URL
            </label>

            <input
              type="text"
              placeholder="your-store"
              className="w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none transition focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Category
            </label>

            <select className="w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none">

              <option>Fashion</option>

              <option>Electronics</option>

              <option>Beauty</option>

              <option>Home</option>

              <option>Books</option>

              <option>Food</option>

            </select>
          </div>

          <a
  href="/dashboard"
  className="mt-6 inline-block rounded-full bg-pink-500 px-10 py-4 font-bold text-white transition hover:bg-pink-600"
>
  Create Store
</a>

        </div>

      </div>

    </div>
  );
}