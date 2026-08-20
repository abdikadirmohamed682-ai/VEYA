"use client";

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
  const [customerOrders, setCustomerOrders] = useState<
    CustomerOrderSummary[]
  >([]);
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

        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select(
            "id, customer_name, phone, total, status, created_at"
          )
          .eq("phone", phone)
          .eq("store_id", store.id)
          .order("created_at", { ascending: false });

        if (ordersError) {
          setError(ordersError.message);
          return;
        }

        const customerOrdersData =
          (orders || []) as CustomerOrderSummary[];

        if (customerOrdersData.length === 0) {
          setError("No customer orders found.");
          return;
        }

        setCustomerName(customerOrdersData[0].customer_name);
        setCustomerPhone(phone);
        setCustomerOrders(customerOrdersData);

        const orderIds = customerOrdersData.map(
          (order) => order.id
        );

        const { data: rawItems, error: itemsError } =
          await supabase
            .from("order_items")
            .select(
              "id, order_id, product_id, quantity, price"
            )
            .in("order_id", orderIds);

        if (itemsError) {
          setError(itemsError.message);
          return;
        }

        const rawOrderItems = (rawItems || []) as {
          id: string | number;
          order_id: string | number;
          product_id: string;
          quantity: number;
          price: number;
        }[];

        if (rawOrderItems.length === 0) {
          setOrderItems([]);
          return;
        }

        const productIds = [
          ...new Set(
            rawOrderItems.map((item) => item.product_id)
          ),
        ];

        const { data: productsData } = await supabase
          .from("products")
          .select(
            "id, product_name, main_image_url"
          )
          .in("id", productIds);

        const productMap = new Map<
          string,
          {
            product_name: string;
            main_image_url: string | null;
          }
        >();

        (productsData || []).forEach(
          (product: {
            id: string;
            product_name: string;
            main_image_url: string | null;
          }) => {
            productMap.set(product.id, {
              product_name: product.product_name,
              main_image_url: product.main_image_url,
            });
          }
        );

        const items: OrderItem[] = rawOrderItems.map(
          (item) => {
            const product = productMap.get(
              item.product_id
            );

            return {
              id: item.id,
              order_id: item.order_id,
              product_name:
                product?.product_name ||
                "Unknown Product",
              main_image_url:
                product?.main_image_url || null,
              price: Number(item.price || 0),
              quantity: Number(item.quantity || 0),
            };
          }
        );

        setOrderItems(items);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : String(fetchError)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [params.phone]);

  const totalSpent = customerOrders.reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
    0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "processing":
        return "bg-blue-100 text-blue-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF8FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D94680]" />
            <p className="font-medium text-gray-600">
              Loading customer details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#FFF8FC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
              !
            </div>

            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Unable to load customer
            </h1>

            <p className="mt-3 break-words text-sm leading-6 text-red-600">
              {error}
            </p>

            <button aria-label="Back"
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/customers");
                }
              }}
              className="mt-7 w-full rounded-2xl bg-[#D94680] px-6 py-3.5 font-semibold text-white transition hover:bg-pink-600 sm:w-auto"
            >
              <span aria-hidden="true">←</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFF8FC]">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Header */}
        <header className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D94680]">
                Customer
              </p>

              <h1 className="mt-2 break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                {customerName}
              </h1>

              <p className="mt-2 break-all text-sm text-gray-500">
                {customerPhone}
              </p>
            </div>

            <button aria-label="Back"
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/customers");
                }
              }}
              className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto"
            >
              <span aria-hidden="true">←</span>
            </button>
          </div>
        </header>

        {/* Customer Summary */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Customer
            </p>

            <p className="mt-3 break-words text-xl font-bold text-gray-900">
              {customerName}
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Orders
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {customerOrders.length}
            </p>
          </div>

          <div className="rounded-[2rem] bg-[#FCE7F3] p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B91C7A]">
              Total spent
            </p>

            <p className="mt-3 text-3xl font-bold text-[#D94680]">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Order History */}
          <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order history
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {customerOrders.length}{" "}
                  {customerOrders.length === 1
                    ? "order"
                    : "orders"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {customerOrders.map((order) => (
                <div
                  key={String(order.id)}
                  className="rounded-[1.5rem] border border-gray-100 bg-[#FFF8FC] p-4 transition hover:border-pink-100 sm:p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500">
                          Order #{order.id}
                        </p>

                        <p className="mt-1 text-base font-bold text-gray-900">
                          {formatDate(
                            order.created_at
                          )}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span className="text-sm text-gray-500">
                        Order total
                      </span>

                      <span className="text-base font-bold text-[#D94680]">
                        {formatCurrency(
                          Number(order.total || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Purchased Products */}
          <aside className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-7">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Purchased products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Products purchased by this customer
              </p>
            </div>

            {orderItems.length === 0 ? (
              <div className="mt-6 rounded-3xl bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-500">
                  No purchased products found.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={String(item.id)}
                    className="rounded-[1.5rem] border border-gray-100 bg-[#FFF8FC] p-4"
                  >
                    <div className="flex gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                        {item.main_image_url ? (
                          <img
                            src={item.main_image_url}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-bold text-gray-900">
                          {item.product_name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#D94680]">
                            {formatCurrency(
                              item.price
                            )}
                          </span>

                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(
                              item.price *
                                item.quantity
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}