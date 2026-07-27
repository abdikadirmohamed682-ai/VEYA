"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: string | number;
  order_id: string | number;
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

interface CustomerOrderSummary {
  id: string | number;
  customer_name: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams<{ phone: string }>();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerOrders, setCustomerOrders] = useState<CustomerOrderSummary[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const phone = decodeURIComponent(params.phone);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const { data: store, error: storeError } = await supabase
          .from("stores")
          .select("id")
          .eq("user_id", session.user.id)
          .single();
        if (storeError || !store) {
          throw new Error(storeError?.message || "Store not found.");
        }

        const { data: orders, error } = await supabase
          .from("orders")
          .select("id, customer_name, phone, total, status, created_at")
          .eq("phone", phone)
          .eq("store_id", store.id)
          .order("created_at", { ascending: false });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        const customerOrdersData = (orders || []) as CustomerOrderSummary[];
        if (customerOrdersData.length === 0) {
          setError("No customer orders found.");
          setLoading(false);
          return;
        }

        setCustomerName(customerOrdersData[0].customer_name);
        setCustomerPhone(phone);
        setCustomerOrders(customerOrdersData);

        const orderIds = customerOrdersData.map((order) => order.id);
        const { data: rawItems, error: itemsError } = await supabase
          .from("order_items")
          .select("id, order_id, product_id, quantity, price")
          .in("order_id", orderIds);

        if (itemsError) {
          setError(itemsError.message);
          setLoading(false);
          return;
        }

        // Fetch product details for order items
        const rawOrderItems = (rawItems || []) as { id: string | number; order_id: string | number; product_id: string; quantity: number; price: number }[];
        if (rawOrderItems.length > 0) {
          const productIds = [...new Set(rawOrderItems.map((i) => i.product_id))];
          const { data: productsData } = await supabase
            .from("products")
            .select("id, product_name, main_image_url")
            .in("id", productIds);

          const productMap = new Map<string, { product_name: string; main_image_url: string | null }>();
          (productsData || []).forEach((p: { id: string; product_name: string; main_image_url: string | null }) => {
            productMap.set(p.id, { product_name: p.product_name, main_image_url: p.main_image_url });
          });

          const items: OrderItem[] = rawOrderItems.map((item) => {
            const product = productMap.get(item.product_id);
            return {
              id: item.id,
              order_id: item.order_id,
              product_name: product?.product_name || "Unknown Product",
              main_image_url: product?.main_image_url || null,
              price: item.price,
              quantity: item.quantity,
            };
          });
          setOrderItems(items);
        } else {
          setOrderItems([]);
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [params.phone]);

  const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFC]">
        <p className="text-gray-500">Loading customer details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#FAFAFC] py-10 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-10 shadow-xl">
          <p className="text-center text-red-600">{error}</p>
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/customers")}
              className="rounded-3xl bg-[#D94680] px-6 py-3 text-white hover:bg-pink-600"
            >
              Back to customers
            </button>
          </div>
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
              <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Customer details</p>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">{customerName}</h1>
              <p className="mt-2 text-gray-600">{customerPhone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total spent</p>
              <p className="mt-2 text-3xl font-bold text-[#D94680]">{formatCurrency(totalSpent)}</p>
              <Link
                href="/customers"
                className="mt-4 inline-flex rounded-3xl bg-[#FCE7F3] px-5 py-2 text-sm font-semibold text-[#B91C7A] hover:bg-[#FAD1E8]"
              >
                Back to customers
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <section className="space-y-6">
              <div className="rounded-[2rem] border border-gray-200 bg-[#FEF3F8] p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Order history</h2>
                <div className="mt-6 space-y-4">
                  {customerOrders.map((order) => (
                    <div key={String(order.id)} className="rounded-3xl bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Order #{order.id}</p>
                          <p className="mt-1 text-lg font-semibold text-gray-900">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="mt-1 text-lg font-semibold text-[#D94680]">{order.status}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-3xl bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">Order total</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Purchased products</h2>
                <div className="mt-6 space-y-4">
                  {orderItems.map((item) => (
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
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
