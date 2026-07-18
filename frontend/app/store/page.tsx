export default function StorePage() {
  return (
    <main className="min-h-screen bg-[#FAFAFC]">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              VEYA Demo Store
            </h1>

            <p className="text-gray-500">
              Digital Products
            </p>
          </div>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-12">

        <h2 className="mb-8 text-3xl font-bold">
          Products
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          <div className="overflow-hidden rounded-3xl bg-white shadow">

            <div className="flex h-56 items-center justify-center bg-gray-100 text-gray-400 text-6xl">
              Image
            </div>

            <div className="p-6">

              <h3 className="text-2xl font-bold">
                Digital Marketing Book
              </h3>

              <p className="mt-3 text-gray-500">
                Learn how to grow your online business.
              </p>

              <div className="mt-6 flex items-center justify-between">

                <span className="text-2xl font-bold text-[#D94680]">
                  $19
                </span>

                <button
                  className="rounded-xl bg-gray-300 px-5 py-3 font-semibold text-gray-600 cursor-not-allowed"
                >
                  Store Closed
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}