"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ViewStoreButton from "@/components/ViewStoreButton";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  whatsapp: string;
  total: number;
  status: string;
  created_at: string;
  download_url: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [storeId, setStoreId] = useState("");
  const [storeType, setStoreType] = useState<"digital" | "physical">(
    "digital"
  );

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Please login first.");
        return;
      }

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id, store_type")
        .eq("user_id", session.user.id)
        .single();

      if (storeError || !store) {
        setError("Store not found.");
        return;
      }

      setStoreId(store.id);
      setStoreType(
        store.store_type === "physical"
          ? "physical"
          : "digital"
      );
            const { data, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          customer_name,
          phone,
          whatsapp,
          total,
          status,
          created_at,
          download_url
        `)
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error(ordersError);
        setError(ordersError.message);
        return;
      }

      setOrders((data || []) as Order[]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while loading orders.");
    } finally {
      setLoading(false);
    }
  }

  function getStatusStyle(status: string) {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl font-semibold text-pink-600">
          Loading orders...
        </p>
      </div>
    );
  }
    return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>

            <p className="mt-2 text-gray-500">
              Manage all customer orders
            </p>
          </div>

          <ViewStoreButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <h2 className="text-2xl font-bold">
              No orders found
            </h2>

            <p className="mt-3 text-gray-500">
              Your customers haven't placed any orders yet.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="overflow-hidden rounded-3xl bg-white shadow">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-5 text-left">Customer</th>
                  <th className="p-5 text-left">Phone</th>
                  <th className="p-5 text-left">WhatsApp</th>
                  <th className="p-5 text-left">Total</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-left">Date</th>
                  <th className="p-5 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-5 font-semibold">
                      {order.customer_name}
                    </td>

                    <td className="p-5">
                      {order.phone}
                    </td>

                    <td className="p-5">
                      {order.whatsapp}
                    </td>

                    <td className="p-5 font-bold text-pink-600">
                      ${Number(order.total).toFixed(2)}
                    </td>

                    <td className="p-5">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="p-5">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="p-5">
  {storeType === "digital" &&
  order.status === "completed" &&
  order.download_url ? (
    <a
      href={order.download_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
    >
      Download Product
    </a>
  ) : (
    <Link
      href={`/orders/${order.id}`}
      className="inline-flex rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700"
    >
      View Details
    </Link>
  )}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}