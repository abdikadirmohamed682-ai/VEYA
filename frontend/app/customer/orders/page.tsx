"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface OrderDisplay {
  id: string;
  status: string;
  created_at: string;
  product_name: string;
  product_image: string | null;
  download_url: string | null;
}

export default function CustomerOrdersPage() {
  const router = useRouter();

  const [pendingOrders, setPendingOrders] = useState<OrderDisplay[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        // 1. Require customer authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/customer/login");
          return;
        }

        const customerId = session.user.id;

        // 2. Verify the user is a registered customer
        const { data: customer, error: customerError } = await supabase
          .from("customers")
          .select("id")
          .eq("id", customerId)
          .single();

        if (customerError || !customer) {
          router.replace("/customer/login");
          return;
        }

        // 3. Fetch orders belonging to this customer using customer_id only
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("id, status, created_at, product_id, download_url")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false });

        if (ordersError) {
          setError(ordersError.message);
          setLoading(false);
          return;
        }

        if (!ordersData || ordersData.length === 0) {
          setLoading(false);
          return;
        }

        // 4. Fetch product names and images in a single batch
        const productIds = [
          ...new Set(ordersData.map((o: any) => o.product_id)),
        ];

        const { data: productsData } = await supabase
          .from("products")
          .select("id, product_name, main_image_url")
          .in("id", productIds);

        const productMap = new Map<
          string,
          { product_name: string; main_image_url: string | null }
        >();
        (productsData || []).forEach(
          (p: {
            id: string;
            product_name: string;
            main_image_url: string | null;
          }) => {
            productMap.set(p.id, {
              product_name: p.product_name,
              main_image_url: p.main_image_url,
            });
          }
        );

        // 5. Separate into pending and completed
        const pending: OrderDisplay[] = [];
        const completed: OrderDisplay[] = [];

        ordersData.forEach((order: any) => {
          const product = productMap.get(order.product_id);
          const entry: OrderDisplay = {
            id: order.id,
            status: order.status,
            created_at: order.created_at,
            product_name: product?.product_name || "Unknown Product",
            product_image: product?.main_image_url || null,
            download_url: order.download_url || null,
          };

          if (order.status === "completed") {
            completed.push(entry);
          } else {
            pending.push(entry);
          }
        });

        setPendingOrders(pending);
        setCompletedOrders(completed);
      } catch (err) {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [router]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAFC]">
        <p className="text-gray-500">Loading your orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFAFC]">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] py-10 px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-500 mb-10">View your pending and completed orders.</p>

        {/* Pending Orders */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-700">
              {pendingOrders.length}
            </span>
            Pending Orders
          </h2>

          {pendingOrders.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
              <p className="text-gray-500">No pending orders.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl bg-white p-6 shadow transition hover:shadow-lg"
                >
                  <div className="flex items-center gap-5">
                    {/* Product image */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                      {order.product_image ? (
                        <img
                          src={order.product_image}
                          alt={order.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
                          No img
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {order.product_name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Ordered {formatDate(order.created_at)}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span className="inline-flex rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700 capitalize">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Orders */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {completedOrders.length}
            </span>
            Completed Orders
          </h2>

          {completedOrders.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
              <p className="text-gray-500">No completed orders.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-3xl bg-white p-6 shadow transition hover:shadow-lg"
                >
                  <div className="flex items-center gap-5">
                    {/* Product image */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                      {order.product_image ? (
                        <img
                          src={order.product_image}
                          alt={order.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
                          No img
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {order.product_name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Purchased {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Download button for digital products */}
                  {order.download_url ? (
                    <a
                      href={order.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block w-full rounded-xl bg-[#D94680] py-3 text-center text-base font-bold text-white transition hover:opacity-90"
                    >
                      Download Product
                    </a>
                  ) : (
                    <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-center">
                      <p className="font-bold text-red-700 text-sm">
                        Download is not available.
                      </p>
                      <p className="text-xs text-red-600 mt-0.5">
                        Please contact the seller.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

