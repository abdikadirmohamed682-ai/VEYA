export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-white border-r border-pink-100 p-6">

      {/* Logo */}

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500 text-2xl font-bold text-white">
          V
        </div>

        <div>
          <h1 className="text-2xl font-bold">VEYA</h1>
          <p className="text-sm text-gray-500">
            Seller Dashboard
          </p>
        </div>

      </div>

      {/* Menu */}

      <nav className="mt-12 flex flex-col gap-3">

        <button className="rounded-2xl bg-pink-500 px-5 py-4 text-left font-semibold text-white">
          🏠 Dashboard
        </button>

        <button className="rounded-2xl px-5 py-4 text-left font-semibold text-gray-700 transition hover:bg-pink-50">
          📦 Products
        </button>

        <button className="rounded-2xl px-5 py-4 text-left font-semibold text-gray-700 transition hover:bg-pink-50">
          🛒 Orders
        </button>

        <button className="rounded-2xl px-5 py-4 text-left font-semibold text-gray-700 transition hover:bg-pink-50">
          🎨 Themes
        </button>

        <button className="rounded-2xl px-5 py-4 text-left font-semibold text-gray-700 transition hover:bg-pink-50">
          👥 Customers
        </button>

        <button className="rounded-2xl px-5 py-4 text-left font-semibold text-gray-700 transition hover:bg-pink-50">
          ⚙ Settings
        </button>

      </nav>

    </aside>
  );
}