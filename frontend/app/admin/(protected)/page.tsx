"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  } | null;
}

interface Store {
  id: string;
  store_name: string;
  logo: string | null;
  verified: boolean;
}

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  profile_image: string | null;
}

interface StoreVisitorCount {
  store_id: string;
  store_name: string;
  visitor_count: number;
}

export default function AdminDashboardPage() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [platformVisitors, setPlatformVisitors] = useState(0);
  const [totalStoreVisitors, setTotalStoreVisitors] = useState<number | null>(
    null
  );

  const [verifiedStores, setVerifiedStores] = useState(0);
  const [pendingStores, setPendingStores] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);

  const [latestOrders, setLatestOrders] = useState<Order[]>([]);
  const [latestStores, setLatestStores] = useState<Store[]>([]);
  const [latestCustomers, setLatestCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // ---- Basic Counts + Store Visitor Counts ----
        const [
          { count: customersCount },
          { count: storesCount },
          { count: productsCount },
          { count: ordersCount },
          { count: platformVisitorsCount, error: platformVisitorsError },
          {
            data: storeVisitorsData,
            error: storeVisitorsError,
          },
        ] = await Promise.all([
          supabase
            .from("users")
            .select("id", { count: "exact", head: true }),

          supabase
            .from("stores")
            .select("id", { count: "exact", head: true }),

          supabase
            .from("products")
            .select("id", { count: "exact", head: true }),

          supabase
            .from("orders")
            .select("id", { count: "exact", head: true }),

          supabase
            .from("platform_visits")
            .select("id", { count: "exact", head: true }),

          // IMPORTANT:
          // Total Store Visitors now comes from the existing View.
          supabase
            .from("store_visitor_counts")
            .select("store_id, store_name, visitor_count"),
        ]);

        if (platformVisitorsError) {
          throw platformVisitorsError;
        }

        if (storeVisitorsError) {
          throw storeVisitorsError;
        }

        // ---- Calculate Total Store Visitors ----
        const visitorRows = (storeVisitorsData ||
          []) as StoreVisitorCount[];

        const totalVisitors = visitorRows.reduce(
          (total, store) => total + Number(store.visitor_count || 0),
          0
        );

        setTotalStoreVisitors(totalVisitors);

        // ---- Row 2 counts ----
        const [
          verifiedResult,
          pendingResult,
          completedResult,
          todayResult,
        ] = await Promise.all([
          supabase
            .from("stores")
            .select("id", { count: "exact", head: true })
            .eq("verified", true),

          supabase
            .from("stores")
            .select("id", { count: "exact", head: true })
            .eq("verified", false),

          supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("status", "completed"),

          supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .gte(
              "created_at",
              new Date(
                new Date().setHours(0, 0, 0, 0)
              ).toISOString()
            ),
        ]);

        // ---- Latest 5 orders, stores, customers ----
        const [
          ordersData,
          storesData,
          customersData,
        ] = await Promise.all([
          supabase
            .from("orders")
            .select(
              "id, customer_name, phone, total, status, created_at, stores (store_name)"
            )
            .order("created_at", { ascending: false })
            .limit(5),

          supabase
            .from("stores")
            .select("id, store_name, logo, verified")
            .order("created_at", { ascending: false })
            .limit(5),

          supabase
            .from("users")
            .select("id, full_name, phone, profile_image")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        if (
          customersCount === null ||
          storesCount === null ||
          productsCount === null ||
          ordersCount === null ||
          platformVisitorsCount === null ||
          verifiedResult.count === null ||
          pendingResult.count === null ||
          completedResult.count === null ||
          todayResult.count === null
        ) {
          setError("Failed to load dashboard statistics.");
          return;
        }

        setTotalCustomers(customersCount);
        setTotalStores(storesCount);
        setTotalProducts(productsCount);
        setTotalOrders(ordersCount);
        setPlatformVisitors(platformVisitorsCount);

        setVerifiedStores(verifiedResult.count);
        setPendingStores(pendingResult.count);
        setCompletedOrders(completedResult.count);
        setTodayOrders(todayResult.count);

        setLatestOrders(
          (ordersData.data || []) as unknown as Order[]
        );

        setLatestStores(
          (storesData.data || []) as Store[]
        );

        setLatestCustomers(
          (customersData.data || []) as Customer[]
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : String(err)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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

    if (s === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (s === "paid") {
      return "bg-blue-100 text-blue-700";
    }

    if (s === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (s === "cancelled") {
      return "bg-red-100 text-red-700";
    }

    if (s === "processing") {
      return "bg-blue-100 text-blue-700";
    }

    if (s === "waiting") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Marketplace overview and recent activity.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* Top Statistics Cards — Row 1 */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Customers
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {totalCustomers}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total customers
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Stores
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {totalStores}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total stores
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Products
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {totalProducts}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total products
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Orders
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {totalOrders}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total orders
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Platform Visitors
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {platformVisitors}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Main homepage visits
            </p>
          </div>

          {/* TOTAL STORE VISITORS */}
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Total Store Visitors
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {totalStoreVisitors === null
                ? "—"
                : totalStoreVisitors}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Visits to merchant stores
            </p>
          </div>
        </div>

        {/* Statistics Cards — Row 2 */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Verified
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {verifiedStores}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Verified stores
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Pending
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {pendingStores}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Pending stores
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Completed
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {completedOrders}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Completed orders
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Today
            </p>

            <p className="mt-3 text-4xl font-bold text-gray-900">
              {todayOrders}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Today&apos;s orders
            </p>
          </div>
        </div>

        {/* Recent Activity — Latest 5 Orders */}
        <div className="mt-10 rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
                Recent Activity
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Latest Orders
              </h2>
            </div>

            <Link
              href="/admin/orders"
              className="rounded-3xl bg-[#FCE7F3] px-5 py-2 text-sm font-semibold text-[#B91C7A] hover:bg-[#FAD1E8]"
            >
              View all
            </Link>
          </div>

          {latestOrders.length === 0 ? (
            <div className="mt-6 rounded-3xl bg-gray-50 p-8 text-center text-gray-500">
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {latestOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm text-gray-500">
                      {order.id}
                    </p>

                    <div className="mt-1 space-y-0.5">
                      <p className="font-semibold text-gray-900">
                        {order.customer_name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {order.stores?.store_name || "—"} ·{" "}
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex rounded-xl bg-[#D94680] px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity — Latest 5 Stores & Latest 5 Customers */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Latest Stores */}
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
                  Recent Activity
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  Latest Stores
                </h2>
              </div>

              <Link
                href="/admin/stores"
                className="rounded-3xl bg-[#FCE7F3] px-5 py-2 text-sm font-semibold text-[#B91C7A] hover:bg-[#FAD1E8]"
              >
                View all
              </Link>
            </div>

            {latestStores.length === 0 ? (
              <div className="mt-6 rounded-3xl bg-gray-50 p-8 text-center text-gray-500">
                <p>No stores yet.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {latestStores.map((store) => (
                  <div
                    key={store.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={store.store_name}
                          className="h-14 w-14 rounded-2xl border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                          <span className="text-xs">
                            No logo
                          </span>
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {store.store_name}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                            store.verified
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {store.verified
                            ? "Verified"
                            : "Unverified"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/stores/${store.id}`}
                      className="shrink-0 self-start rounded-xl bg-[#D94680] px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600 sm:self-auto"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Customers */}
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
                  Recent Activity
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  Latest Customers
                </h2>
              </div>

              <Link
                href="/admin/customers"
                className="rounded-3xl bg-[#FCE7F3] px-5 py-2 text-sm font-semibold text-[#B91C7A] hover:bg-[#FAD1E8]"
              >
                View all
              </Link>
            </div>

            {latestCustomers.length === 0 ? (
              <div className="mt-6 rounded-3xl bg-gray-50 p-8 text-center text-gray-500">
                <p>No customers yet.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {latestCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      {customer.profile_image ? (
                        <img
                          src={customer.profile_image}
                          alt={customer.full_name}
                          className="h-14 w-14 rounded-2xl border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                          <span className="text-xs">
                            No image
                          </span>
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {customer.full_name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {customer.phone || "—"}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="shrink-0 self-start rounded-xl bg-[#D94680] px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600 sm:self-auto"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10">
          <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
            Quick Actions
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Manage
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/stores"
              className="group rounded-[2rem] bg-white p-8 shadow-xl shadow-pink-100/40 transition hover:bg-[#D94680]"
            >
              <p className="text-lg font-bold text-gray-900 transition group-hover:text-white">
                Stores
              </p>

              <p className="mt-2 text-sm text-gray-500 transition group-hover:text-pink-100">
                Manage all marketplace stores.
              </p>
            </Link>

            <Link
              href="/admin/orders"
              className="group rounded-[2rem] bg-white p-8 shadow-xl shadow-pink-100/40 transition hover:bg-[#D94680]"
            >
              <p className="text-lg font-bold text-gray-900 transition group-hover:text-white">
                Orders
              </p>

              <p className="mt-2 text-sm text-gray-500 transition group-hover:text-pink-100">
                View and manage all orders.
              </p>
            </Link>

            <Link
              href="/admin/products"
              className="group rounded-[2rem] bg-white p-8 shadow-xl shadow-pink-100/40 transition hover:bg-[#D94680]"
            >
              <p className="text-lg font-bold text-gray-900 transition group-hover:text-white">
                Products
              </p>

              <p className="mt-2 text-sm text-gray-500 transition group-hover:text-pink-100">
                Manage all marketplace products.
              </p>
            </Link>

            <Link
              href="/admin/customers"
              className="group rounded-[2rem] bg-white p-8 shadow-xl shadow-pink-100/40 transition hover:bg-[#D94680]"
            >
              <p className="text-lg font-bold text-gray-900 transition group-hover:text-white">
                Customers
              </p>

              <p className="mt-2 text-sm text-gray-500 transition group-hover:text-pink-100">
                View all marketplace customers.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}