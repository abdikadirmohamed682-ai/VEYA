"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/login");
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
      <div className="p-6">
        {/* Logo */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D94680] text-2xl font-bold text-white mb-8">
          V
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className={`block px-4 py-3 rounded-xl font-semibold transition ${
              pathname === "/dashboard"
                ? "bg-[#D94680] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/products"
            className={`block px-4 py-3 rounded-xl font-semibold transition ${
              isActive("/products") && pathname !== "/products/new"
                ? "bg-[#D94680] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Products
          </Link>

          <Link
            href="/products/new"
            className={`block px-4 py-3 rounded-xl font-semibold transition ${
              pathname === "/products/new"
                ? "bg-[#D94680] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            + Add Product
          </Link>

          <Link
            href="/orders"
            className={`block px-4 py-3 rounded-xl font-semibold transition ${
              isActive("/orders")
                ? "bg-[#D94680] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Orders
          </Link>

          <Link
            href="/customers"
            className={`block px-4 py-3 rounded-xl font-semibold transition ${
              isActive("/customers")
                ? "bg-[#D94680] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Customers
          </Link>

          <Link
            href="/settings"
            className={`block px-4 py-3 rounded-xl font-semibold transition ${
              pathname === "/settings"
                ? "bg-[#D94680] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Settings
          </Link>
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-8 px-4 py-3 rounded-xl font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
