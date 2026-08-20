"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  whatsapp: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  store_id: string;
  product_id: string;
  stores: {
    store_name: string;
    logo: string | null;
  } | null;
  products: {
    product_name: string;
    main_image_url: string | null;
    price: number;
  } | null;
  order_items: {
    quantity: number;
  }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            stores (store_name, logo),
            products (product_name, main_image_url, price),
            order_items (quantity)
          `)
          .order("created_at", { ascending: false });

        if (ordersError) {
          setError(ordersError.message);
          setOrders([]);
          return;
        }

        setOrders((data || []) as Order[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return "bg-yellow-100 text-yellow-700";
    if (s === "paid") return "bg-blue-100 text-blue-700";
    if (s === "completed") return "bg-green-100 text-green-700";
    if (s === "cancelled") return "bg-red-100 text-red-700";
    if (s === "processing") return "bg-blue-100 text-blue-700";
    if (s === "waiting") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const filteredOrders = orders.filter((order) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      order.customer_name.toLowerCase().includes(q) ||
      order.phone.toLowerCase().includes(q) ||
      (order.stores?.store_name || "").toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q)
    );
  });

  const getQuantity = (order: Order): number => {
    if (order.order_items && order.order_items.length > 0) {
      return order.order_items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    return 1;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="mt-2 text-gray-500">View all marketplace orders.</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Admin</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">All orders</h2>
          </div>
          <div className="rounded-3xl bg-[#FCE7F3] px-5 py-4 text-sm font-semibold text-[#B91C7A]">
            {loading ? "Loading..." : `${orders.length} orders`}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, store, or order ID..."
            className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!error && filteredOrders.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <h2 className="text-2xl font-bold">
              {search ? "No orders match your search" : "No orders found"}
            </h2>
            <p className="mt-3 text-gray-500">
              {search ? "Try a different search term." : "There are no orders yet."}
            </p>
          </div>
        )}

        {filteredOrders.length > 0 && (
          <div className="overflow-hidden rounded-3xl bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full border-collapse text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Order ID</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Customer</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Store</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Product</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Qty</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Total</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Payment Method</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Payment Status</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Order Status</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Created</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-gray-50">
                      <td className="p-5 font-mono text-sm text-gray-600">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="p-5">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-gray-900">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.phone}</p>
                        </div>
                      </td>
                      <td className="p-5 font-semibold text-gray-900">
                        {order.stores?.store_name || "—"}
                      </td>
                      <td className="p-5 text-gray-700">
                        {order.products?.product_name || "—"}
                      </td>
                      <td className="p-5 text-gray-700">
                        {getQuantity(order)}
                      </td>
                      <td className="p-5 font-bold text-[#D94680]">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="p-5 text-gray-700">
                        Manual Transfer
                      </td>
                      <td className="p-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadge(order.payment_status)}`}
                        >
                          {order.payment_status || "—"}
                        </span>
                      </td>
                      <td className="p-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadge(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-5 text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="p-5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex rounded-xl bg-[#D94680] px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

