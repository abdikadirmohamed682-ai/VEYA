"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface OrderDetail {
  id: string;
  customer_name: string;
  phone: string;
  whatsapp: string;
  address: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_status: string;
  sender_payment_number: string;
  download_url: string | null;
  product_id: string;
  store_id: string;
}

interface ProductInfo {
  id: string;
  product_name: string;
  main_image_url: string | null;
  price: number;
}

export default function SellerOrderPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const [storeType, setStoreType] = useState<"digital" | "physical">("digital");

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const userId = session.user.id;

      const { data: store } = await supabase
        .from("stores")
        .select("id, store_type")
        .eq("user_id", userId)
        .single();
              if (!store) {
        setError("Store not found.");
        return;
      }

      setStoreType(
        store.store_type === "physical" ? "physical" : "digital"
      );

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("store_id", store.id)
        .single();

      if (orderError || !orderData) {
        setError("Order not found.");
        return;
      }

      setOrder(orderData as OrderDetail);

      const { data: productData } = await supabase
        .from("products")
        .select("id, product_name, main_image_url, price")
        .eq("id", orderData.product_id)
        .single();

      if (productData) {
        setProduct(productData as ProductInfo);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load order.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    status: "pending" | "processing" | "completed"
  ) {
    if (!order) return;

    try {
      setUpdating(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          status,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        alert(result.error || "Failed to update order.");
        return;
      }

      setOrder({
        ...order,
        status,
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setUpdating(false);
    }
  }
    if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold text-pink-600">
          Loading order...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">
            {error || "Order not found"}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>

          <p className="mt-2 text-gray-500">
            Order ID: {order.id}
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            storeType === "digital"
              ? "bg-pink-100 text-pink-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {storeType === "digital"
            ? "Digital Store"
            : "Physical Store"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">
            Product
          </h2>

          {product?.main_image_url && (
            <img
              src={product.main_image_url}
              alt={product.product_name}
              className="mb-4 h-56 w-full rounded-xl object-cover"
            />
          )}

          <h3 className="text-xl font-semibold">
            {product?.product_name || "Unknown Product"}
          </h3>

          <p className="mt-2 text-lg font-bold text-pink-600">
            ${product?.price ?? order.subtotal}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">
            Customer
          </h2>

          <div className="space-y-3">
            <p>
              <strong>Name:</strong> {order.customer_name}
            </p>

            <p>
              <strong>Phone:</strong> {order.phone}
            </p>

            <p>
              <strong>WhatsApp:</strong> {order.whatsapp}
            </p>

            {storeType === "physical" && (
              <p>
                <strong>Address:</strong>{" "}
                {order.address || "-"}
              </p>
            )}
                      </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border-2 border-pink-300 bg-pink-50 p-6">
        <h2 className="mb-3 text-lg font-bold text-pink-700">
          Sender Payment Number
        </h2>

        <p className="break-all text-3xl font-extrabold tracking-wider text-pink-600">
          {order.sender_payment_number}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">
          Payment Summary
        </h2>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${Number(order.subtotal).toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>${Number(order.delivery_fee).toFixed(2)}</span>
          </div>

          <hr />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          disabled={updating}
          onClick={() => updateStatus("pending")}
          className="rounded-xl bg-gray-700 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          Pending
        </button>

        {storeType === "physical" ? (
          <>
            <button
              disabled={updating}
              onClick={() => updateStatus("processing")}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Shipping
            </button>

            <button
              disabled={updating}
              onClick={() => updateStatus("completed")}
              className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              Completed
            </button>
          </>
        ) : (
          <button
            disabled={updating}
            onClick={() => updateStatus("completed")}
            className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            Complete
          </button>
        )}
      </div>
    </main>
  );
}