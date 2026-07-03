export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Navbar */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500 text-xl font-bold text-white">
              V
            </div>

            <span className="text-2xl font-bold tracking-wide">
              VEYA
            </span>
          </div>

          <nav className="hidden gap-8 md:flex text-gray-700">
            <a href="#">Home</a>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
            <a href="#">Contact</a>
          </nav>

          <a
  href="/register"
  className="rounded-full bg-pink-500 px-6 py-3 text-white font-semibold transition hover:bg-pink-600"
>
  Create Store
</a>

        </div>
      </header>

      {/* Hero */}

      <section className="mx-auto flex max-w-7xl flex-col items-center px-8 py-24 lg:flex-row">

        {/* Left */}

        <div className="flex-1">

          <h1 className="text-6xl font-extrabold leading-tight text-gray-900">

            Build your online store

            <span className="block text-pink-500">
              in minutes.
            </span>

          </h1>

          <p className="mt-8 max-w-xl text-xl leading-9 text-gray-600">

            VEYA helps anyone create a beautiful online store,
            manage products,
            and sell professionally without coding.

          </p>

          <div className="mt-10 flex gap-5">

           <a
  href="/register"
  className="rounded-full bg-pink-500 px-8 py-4 font-semibold text-white transition hover:bg-pink-600"
>
  Start Free
</a>
            <button className="rounded-full border border-gray-300 px-8 py-4 font-semibold transition hover:border-pink-500 hover:text-pink-500">

              Learn More

            </button>

          </div>

        </div>

        {/* Right */}

        <div className="mt-16 flex flex-1 justify-center lg:mt-0">

          <div className="w-[340px] rounded-3xl bg-gradient-to-br from-pink-500 to-pink-400 p-8 shadow-2xl">

            <div className="rounded-3xl bg-white p-6">

              <div className="h-40 rounded-2xl bg-pink-100"></div>

              <h3 className="mt-5 text-xl font-bold">
                Premium Sneakers
              </h3>

              <p className="mt-2 text-gray-500">
                Modern • Fashion • Trending
              </p>

              <button className="mt-6 w-full rounded-full bg-pink-500 py-3 font-semibold text-white">

                Add to Cart

              </button>

            </div>

          </div>

        </div>

      </section>

    {/* Trust Section */}

<section className="bg-pink-50 py-20">

  <div className="mx-auto max-w-7xl px-8">

    <h2 className="text-center text-4xl font-bold text-gray-900">
      Why choose VEYA?
    </h2>

    <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-gray-600">
      Everything you need to launch and grow your online business from one beautiful platform.
    </p>

    <div className="mt-16 grid gap-8 md:grid-cols-3">

      <div className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl">

        <div className="mb-5 text-5xl">⚡</div>

        <h3 className="text-2xl font-bold">
          Fast Setup
        </h3>

        <p className="mt-4 text-gray-600">
          Create your professional store in just a few minutes.
        </p>

      </div>

      <div className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl">

        <div className="mb-5 text-5xl">🛍️</div>

        <h3 className="text-2xl font-bold">
          Beautiful Stores
        </h3>

        <p className="mt-4 text-gray-600">
          Modern layouts that make your products look premium.
        </p>

      </div>

      <div className="rounded-3xl bg-white p-8 shadow-lg transition hover:-translate-y-2 hover:shadow-xl">

        <div className="mb-5 text-5xl">🚀</div>

        <h3 className="text-2xl font-bold">
          Grow Faster
        </h3>

        <p className="mt-4 text-gray-600">
          Sell more with a clean shopping experience your customers will love.
        </p>

      </div>

    </div>

  </div>

</section>{/* Statistics */}

<section className="py-24 bg-white">

  <div className="mx-auto max-w-7xl px-8">

    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">

      <div className="rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <h2 className="text-5xl font-extrabold text-pink-500">
          10K+
        </h2>

        <p className="mt-4 text-lg font-medium text-gray-700">
          Active Stores
        </p>
      </div>

      <div className="rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <h2 className="text-5xl font-extrabold text-pink-500">
          500K+
        </h2>

        <p className="mt-4 text-lg font-medium text-gray-700">
          Products
        </p>
      </div>

      <div className="rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <h2 className="text-5xl font-extrabold text-pink-500">
          35+
        </h2>

        <p className="mt-4 text-lg font-medium text-gray-700">
          Countries
        </p>
      </div>

      <div className="rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
        <h2 className="text-5xl font-extrabold text-pink-500">
          99.9%
        </h2>

        <p className="mt-4 text-lg font-medium text-gray-700">
          Platform Uptime
        </p>
      </div>

    </div>

  </div>

</section>{/* Store Preview */}

<section className="bg-gray-50 py-28">

  <div className="mx-auto max-w-7xl px-8">

    <div className="mb-14 text-center">

      <h2 className="text-5xl font-bold text-gray-900">
        Your Store.
        <span className="text-pink-500"> Your Brand.</span>
      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
        This is how your online store can look inside VEYA.
      </p>

    </div>

    <div className="grid gap-8 md:grid-cols-3">

      {/* Product */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

        <div className="h-64 bg-pink-100"></div>

        <div className="p-6">

          <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
            Fashion
          </span>

          <h3 className="mt-5 text-2xl font-bold">
            Premium Sneakers
          </h3>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-3xl font-bold text-pink-500">
              $120
            </span>

            <span className="text-yellow-500">
              ⭐ 4.9
            </span>

          </div>

          <button className="mt-6 w-full rounded-full bg-pink-500 py-3 font-semibold text-white transition hover:bg-pink-600">

            Add to Cart

          </button>

        </div>

      </div>

      {/* Product */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

        <div className="h-64 bg-pink-100"></div>

        <div className="p-6">

          <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
            Electronics
          </span>

          <h3 className="mt-5 text-2xl font-bold">
            Smart Watch
          </h3>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-3xl font-bold text-pink-500">
              $89
            </span>

            <span className="text-yellow-500">
              ⭐ 5.0
            </span>

          </div>

          <button className="mt-6 w-full rounded-full bg-pink-500 py-3 font-semibold text-white transition hover:bg-pink-600">

            Add to Cart

          </button>

        </div>

      </div>

      {/* Product */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">

        <div className="h-64 bg-pink-100"></div>

        <div className="p-6">

          <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
            Home
          </span>

          <h3 className="mt-5 text-2xl font-bold">
            Luxury Chair
          </h3>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-3xl font-bold text-pink-500">
              $210
            </span>

            <span className="text-yellow-500">
              ⭐ 4.8
            </span>

          </div>

          <button className="mt-6 w-full rounded-full bg-pink-500 py-3 font-semibold text-white transition hover:bg-pink-600">

            Add to Cart

          </button>

        </div>

      </div>

    </div>

  </div>

</section>{/* How VEYA Works */}

<section className="py-28 bg-white">

  <div className="mx-auto max-w-7xl px-8">

    <div className="text-center">

      <h2 className="text-5xl font-bold text-gray-900">

        Launch your store in
        <span className="text-pink-500"> 3 simple steps</span>

      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">

        Creating an online business has never been easier.

      </p>

    </div>

    <div className="mt-20 grid gap-12 md:grid-cols-3">

      <div className="text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-500 text-3xl font-bold text-white">

          1

        </div>

        <h3 className="mt-8 text-2xl font-bold">

          Create your account

        </h3>

        <p className="mt-5 text-gray-600 leading-8">

          Sign up for free and create your professional workspace.

        </p>

      </div>

      <div className="text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-500 text-3xl font-bold text-white">

          2

        </div>

        <h3 className="mt-8 text-2xl font-bold">

          Build your store

        </h3>

        <p className="mt-5 text-gray-600 leading-8">

          Upload products, customize your store and publish instantly.

        </p>

      </div>

      <div className="text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-500 text-3xl font-bold text-white">

          3

        </div>

        <h3 className="mt-8 text-2xl font-bold">

          Start selling

        </h3>

        <p className="mt-5 text-gray-600 leading-8">

          Share your store with customers and receive orders online.

        </p>

      </div>

    </div>

  </div>

</section>{/* Templates */}

<section className="bg-pink-50 py-28">

  <div className="mx-auto max-w-7xl px-8">

    <div className="text-center">

      <h2 className="text-5xl font-bold text-gray-900">

        Beautiful Store Templates

      </h2>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">

        Launch with a premium design that matches your business.

      </p>

    </div>

    <div className="mt-20 grid gap-10 md:grid-cols-3">

      {/* Template */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-xl transition duration-300 hover:-translate-y-3 hover:shadow-2xl">

        <div className="h-72 bg-gradient-to-br from-pink-300 to-pink-100"></div>

        <div className="p-6">

          <h3 className="text-2xl font-bold">

            Fashion Store

          </h3>

          <p className="mt-4 text-gray-600">

            Perfect for clothing, shoes and accessories.

          </p>

        </div>

      </div>

      {/* Template */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-xl transition duration-300 hover:-translate-y-3 hover:shadow-2xl">

        <div className="h-72 bg-gradient-to-br from-purple-300 to-pink-100"></div>

        <div className="p-6">

          <h3 className="text-2xl font-bold">

            Electronics

          </h3>

          <p className="mt-4 text-gray-600">

            Sell phones, gadgets and smart devices.

          </p>

        </div>

      </div>

      {/* Template */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-xl transition duration-300 hover:-translate-y-3 hover:shadow-2xl">

        <div className="h-72 bg-gradient-to-br from-yellow-200 to-pink-100"></div>

        <div className="p-6">

          <h3 className="text-2xl font-bold">

            Beauty Store

          </h3>

          <p className="mt-4 text-gray-600">

            Cosmetics, perfumes and skincare products.

          </p>

        </div>

      </div>

    </div>

  </div>

</section>{/* Customer Reviews */}

<section className="py-28 bg-white">

  <div className="mx-auto max-w-7xl px-8">

    <div className="text-center">

      <h2 className="text-5xl font-bold text-gray-900">
        Trusted by growing businesses
      </h2>

      <p className="mt-6 text-lg text-gray-600">
        Thousands of entrepreneurs choose VEYA to build their online business.
      </p>

    </div>

    <div className="mt-20 grid gap-8 md:grid-cols-3">

      <div className="rounded-3xl bg-pink-50 p-8 shadow-sm">

        <div className="text-yellow-500 text-2xl">
          ⭐⭐⭐⭐⭐
        </div>

        <p className="mt-6 text-gray-700 leading-8">
          "Launching my online store took less than one hour.
          The experience was incredibly simple."
        </p>

        <h4 className="mt-8 font-bold">
          Ahmed Hassan
        </h4>

      </div>

      <div className="rounded-3xl bg-pink-50 p-8 shadow-sm">

        <div className="text-yellow-500 text-2xl">
          ⭐⭐⭐⭐⭐
        </div>

        <p className="mt-6 text-gray-700 leading-8">
          "I never imagined creating a professional store could be this easy."
        </p>

        <h4 className="mt-8 font-bold">
          Fatima Ali
        </h4>

      </div>

      <div className="rounded-3xl bg-pink-50 p-8 shadow-sm">

        <div className="text-yellow-500 text-2xl">
          ⭐⭐⭐⭐⭐
        </div>

        <p className="mt-6 text-gray-700 leading-8">
          "Beautiful design, simple dashboard and my customers love it."
        </p>

        <h4 className="mt-8 font-bold">
          Mohamed Yusuf
        </h4>

      </div>

    </div>

  </div>

</section>{/* Final CTA */}

<section className="py-32 bg-pink-500">

  <div className="mx-auto max-w-5xl px-8 text-center">

    <h2 className="text-5xl font-bold text-white leading-tight">

      Ready to launch your online business?

    </h2>

    <p className="mt-8 text-xl text-pink-100">

      Create your store today and start selling in minutes.

    </p>

    <a
  href="/register"
  className="mt-12 inline-block rounded-full bg-white px-10 py-5 text-xl font-bold text-pink-500 transition hover:scale-105"
>
  Create Your Store
</a>

  </div>

</section>

{/* Footer */}

<footer className="border-t border-pink-100 bg-white py-10">

  <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-8 md:flex-row">

    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500 font-bold text-white">

        V

      </div>

      <span className="text-xl font-bold">
        VEYA
      </span>

    </div>

    <p className="text-gray-500">

      © 2026 VEYA. All rights reserved.

    </p>

  </div>

</footer></main>
  );
}