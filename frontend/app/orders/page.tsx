"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ViewStoreButton from "@/components/ViewStoreButton";

interface OrderSummary {
  id: string | number;
  customer_name: string;
  phone_number: string;
  total: number;
  status: string;
  created_at: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function badgeForStatus(status: string) {
  const key = status.toLowerCase();
  return statusStyles[key] || "bg-gray-100 text-gray-700";
}

function formatDate(createdAt: string) {
  const date = new Date(createdAt);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (storeError || !store) {
        setError(storeError?.message || "Store not found.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, phone_number, total, status, created_at")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setOrders([]);
      } else {
        setOrders((data || []) as OrderSummary[]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-gray-500 mt-2">Manage customer orders.</p>
          </div>
          <ViewStoreButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-6 flex flex-col gap-3 rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Order Dashboard</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Latest customer orders</h2>
          </div>
          <div className="rounded-3xl bg-[#FCE7F3] px-5 py-4 text-sm font-semibold text-[#B91C7A]">
            Newest first
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow">
          <table className="w-full min-w-full border-collapse text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Customer</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Phone</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Total</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Status</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Date</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={String(order.id)} className="border-b hover:bg-gray-50">
                    <td className="p-5 font-semibold text-gray-900">{order.customer_name}</td>
                    <td className="p-5 text-gray-600">{order.phone_number}</td>
                    <td className="p-5 font-semibold text-[#D94680]">${Number(order.total).toFixed(2)}</td>
                    <td className="p-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${badgeForStatus(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-5 text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="p-5">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex rounded-3xl bg-[#D94680] px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
