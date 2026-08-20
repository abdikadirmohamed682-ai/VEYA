"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
  stores: {
    store_name: string;
  } | null | undefined;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error: orderError } = await supabase
          .from("orders")
          .select("id, customer_name, phone, total, status, created_at, stores (store_name)")
          .eq("id", orderId)
          .single();

        if (orderError || !data) {
          setError(orderError?.message || "Order not found");
          return;
        }

        setOrder(data as unknown as Order);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">Loading order...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="mx-auto max-w-7xl px-8 py-10">
          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/admin/orders");
              }
            }}
            className="text-pink-500 hover:underline"
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error || "Order not found"}
          </div>
        </div>
      </main>
    );
  }

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

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/admin/orders");
              }
            }}
            className="text-pink-500 hover:underline"
          >
            <span aria-hidden="true">←</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <h1 className="mt-1 font-mono text-2xl font-bold text-gray-900">{order.id}</h1>
            </div>
            <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadge(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="mt-1 font-semibold text-gray-900">{order.customer_name}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Phone</p>
              <p className="mt-1 font-semibold text-gray-900">{order.phone || "—"}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Store</p>
              <p className="mt-1 font-semibold text-gray-900">{order.stores?.store_name || "—"}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="mt-1 font-semibold text-gray-900">${order.total.toFixed(2)}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Date</p>
              <p className="mt-1 font-semibold text-gray-900">
                {order.created_at
                  ? new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
