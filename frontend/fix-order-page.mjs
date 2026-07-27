import fs from "fs";

const content = `"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: string | number;
  product_name: string;
  main_image_url: string | null;
  price: number;
  quantity: number;
}

interface OrderDetails {
  id: string | number;
  customer_name: string;
  phone: string;
  whatsapp: string;
  address: string;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [storeType, setStoreType] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      const orderId = params.id;

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
        .select("id, store_type")
        .eq("user_id", session.user.id)
        .single();

      if (storeError || !store) {
        setError(storeError?.message || "Store not found.");
        setLoading(false);
        return;
      }

      setStoreType(store.store_type ?? null);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          "id, customer_name, phone, whatsapp, address, notes, subtotal, delivery_fee, total, status, created_at"
        )
        .eq("id", orderId)
        .eq("store_id", store.id)
        .single();

      if (orderError || !orderData) {
        setError(orderError?.message || "Order not found.");
        setLoading(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from("order_items")
        .select("id, product_id, quantity, price")
        .eq("order_id", orderId)
        .order("id", { ascending: true });

      if (itemError) {
        setError(itemError.message);
        setLoading(false);
        return;
      }

      const orderItems = (itemData || []) as {
        id: string | number;
        product_id: string;
        quantity: number;
        price: number;
      }[];

      if (orderItems.length > 0) {
        const productIds = orderItems.map((item) => item.product_id);
        const { data: productsData } = await supabase
          .from("products")
          .select("id, product_name, main_image_url")
          .in("id", productIds);

        const productMap = new Map<string, { product_name: string; main_image_url: string | null }>();
        (productsData || []).forEach((p: { id: string; product_name: string; main_image_url: string | null }) => {
          productMap.set(p.id, { product_name: p.product_name, main_image_url: p.main_image_url });
        });

        setOrderItemsWithProducts(orderItems, productMap);
      } else {
        setItems([]);
      }

      setOrder(orderData as OrderDetails);
      setLoading(false);
    };

    loadOrder();
  }, [params.id]);

  function setOrderItemsWithProducts(
    orderItems: { id: string | number; product_id: string; quantity: number; price: number }[],
    productMap: Map<string, { product_name: string; main_image_url: string | null }>
  ) {
    const mapped: OrderItem[] = orderItems.map((item) => {
      const product = productMap.get(item.product_id);
      return {
        id: item.id,
        product_name: product?.product_name || "Unknown Product",
        main_image_url: product?.main_image_url || null,
        price: item.price,
        quantity: item.quantity,
      };
    });
    setItems(mapped);
  }

  const updateStatus = async (nextStatus: string) => {
    if (!order || nextStatus === order.status) {
      return;
    }

    setStatusUpdating(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const response = await fetch(\`/api/orders/\${params.id}\`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${session.access_token}\`,
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    const json = await response.json();
    setStatusUpdating(false);

    if (!response.ok) {
      setError(json?.error || "Unable to update status.");
      return;
    }

    setOrder({ ...order, status: nextStatus });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFC]">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#FAFAFC] py-10 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-10 shadow-xl">
          <p className="text-center text-red-600">{error || "Order details could not be loaded."}</p>
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/orders")}
              className="rounded-3xl bg-[#D94680] px-6 py-3 text-white hover:bg-pink-600"
            >
              Back to orders
            </button>
          </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] py-10 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-pink-100/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Order details</p>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">Order #{order.id}</h1>
              <p className="mt-2 text-gray-600">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <span className={\`inline-flex rounded-full px-4 py-2 text-sm font-semibold \${badgeForStatus(order.status)}\`}>
                {order.status}
              </span>
              <Link
                href="/orders"
                className="inline-flex rounded-3xl bg-[#FCE7F3] px-5 py-2 text-sm font-semibold text-[#B91C7A] hover:bg-[#FAD1E8]"
              >
                Back to orders
              </Link>
            </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="space-y-6">
              <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Customer</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">WhatsApp</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{order.whatsapp}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500">Delivery address</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{order.address}</p>
                  </div>
              </div>

              <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Order items</h2>
                    <p className="mt-1 text-sm text-gray-500">{items.length} product(s)</p>
                  </div>
                  {storeType === "digital" ? (
                    <div className="flex gap-2">
                      {order.status !== "completed" && order.status !== "cancelled" ? (
                        <>
                          <button
                            onClick={() => updateStatus("completed")}
                            disabled={statusUpdating}
                            className="rounded-3xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                          >
                            &#10003; Complete
                          </button>
                          <button
                            onClick={() => updateStatus("cancelled")}
                            disabled={statusUpdating}
                            className="rounded-3xl bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
                          >
                            &#10007; Cancel
                          </button>
                        </>
                      ) : (
                        <span className="rounded-3xl border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-500">
                          No actions available
                        </span>
                      )}
                    </div>
                  ) : (
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(e.target.value)}
                      disabled={statusUpdating}
                      className="rounded-3xl border border-gray-200 bg-[#FEF3F8] px-4 py-3 text-sm font-semibold outline-none focus:border-[#D94680]"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  {items.map((item) => (
                    <div key={String(item.id)} className="grid gap-4 rounded-[1.5rem] border border-gray-200 bg-[#FEF3F8] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                      <img src={item.main_image_url || ""} alt={item.product_name} className="h-24 w-24 rounded-3xl object-cover" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{item.product_name}</p>
                        <p className="mt-2 text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#D94680]">{formatCurrency(item.price)}</p>
                        <p className="mt-1 text-sm text-gray-600">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                  ))}
                </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Delivery fee</span>
                    <span>{formatCurrency(order.delivery_fee)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 text-lg font-semibold text-gray-900 flex items-center justify-between">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
              </div>

              {order.notes ? (
                <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-900">Customer notes</h2>
                  <p className="mt-4 text-gray-700">{order.notes}</p>
                </div>
              ) : null}
            </aside>
          </div>
      </div>
    </main>
  );
}
`;

const path = "c:/Users/Admin/Projects/VEYA/frontend/app/orders/[id]/page.tsx";
fs.writeFileSync(path, content, "utf8");
console.log("File written successfully. Size:", fs.statSync(path).size);
