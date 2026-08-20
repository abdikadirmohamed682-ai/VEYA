"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

      setStoreType(
        store.store_type === "physical" ? "physical" : "digital"
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
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "completed":
        return "bg-green-50 text-green-700 border-green-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
            Loading orders...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Orders
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Manage customer orders
            </p>
          </div>

          <div className="shrink-0">
            <ViewStoreButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your customers haven't placed any orders yet.
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* List Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  All Orders
                </p>

                <p className="text-xs text-gray-400">
                  {orders.length}{" "}
                  {orders.length === 1 ? "order" : "orders"}
                </p>
              </div>
            </div>

            {/* Orders */}
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block cursor-pointer px-4 py-3 transition hover:bg-gray-50 active:bg-gray-100 sm:px-5 sm:py-4"
                >
                  <div className="flex items-center gap-3">
                    {/* Customer Avatar */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600 sm:h-10 sm:w-10">
                      {order.customer_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    {/* Customer Information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-gray-900">
                          {order.customer_name}
                        </h3>

                        <span
                          className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:inline-flex ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-gray-500">
                        <span className="truncate">
                          {order.phone}
                        </span>

                        <span className="text-gray-300">�</span>

                        <span className="shrink-0">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-pink-600">
                        ${Number(order.total).toFixed(2)}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:hidden ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Download */}
                  {storeType === "digital" &&
                    order.status === "completed" &&
                    order.download_url && (
                      <div className="mt-2 ml-12">
                        <span
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();

                            window.open(
                              order.download_url!,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                          className="text-xs font-semibold text-pink-600 hover:text-pink-700"
                        >
                          Download
                        </span>
                      </div>
                    )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}