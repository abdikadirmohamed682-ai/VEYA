"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ViewStoreButton from "@/components/ViewStoreButton";
import Image from "next/image";
interface Product {
  id: string;
  product_name: string;
  price: number;
  views: number;
  main_image_url: string | null;
  status: string;
}

interface Store {
  store_name: string;
  store_type: string | null;
}

interface OrderRecord {
  id: string;
  customer_name: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
}

interface WeeklyStat {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

export default function DashboardPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [storeType, setStoreType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const getWeeklyLabels = () => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: 0,
        orders: 0,
      };
    });
  };

  const maxRevenue = Math.max(...weeklyStats.map((item) => item.revenue), 1);
  const maxOrders = Math.max(...weeklyStats.map((item) => item.orders), 1);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get current user
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError || !data?.user?.id) {
          console.error("Failed to get user");
          setLoading(false);
          return;
        }

        const userId = data.user.id;

// Fetch store
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("id, store_name, store_type")
          .eq("user_id", userId)
          .maybeSingle();

        if (!storeError && storeData) {
          setStore(storeData as Store);
          setStoreType(storeData.store_type || null);
        } else if (storeError) {
          setErrorMessage(storeError?.message || "Store not found.");
        }

        const storeId = storeData?.id;
        if (!storeId) {
          setLoading(false);
          return;
        }

        const [productsResponse, ordersResponse] = await Promise.all([
          supabase
            .from("products")
            .select("id, product_name, price, views, main_image_url, status, created_at")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false }),
          supabase
            .from("orders")
            .select("id, customer_name, phone, total, status, created_at")
            .eq("store_id", storeId)
            .order("created_at", { ascending: false }),
        ]);

        const [productsData, ordersData] = [productsResponse.data, ordersResponse.data];

        if (!productsResponse.error && productsData) {
          const allProducts = productsData as Product[];
          const activeProducts = allProducts.filter(
            (product) => product.status.toLowerCase() === "active"
          );
          setProducts(allProducts.slice(0, 8));
          setTopProducts(
            [...allProducts]
              .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
              .slice(0, 5)
          );
          const allViews = allProducts.reduce(
            (sum, product) => sum + (product.views || 0),
            0
          );
          setTotalViews(allViews);
          setProductCount(activeProducts.length);
        } else if (productsResponse.error) {
          setErrorMessage(productsResponse.error.message);
        }

        if (ordersResponse.error) {
          setErrorMessage(ordersResponse.error.message);
        }

        if (!ordersResponse.error && ordersData) {
          const orderRecords = ordersData as OrderRecord[];
          setTotalOrders(orderRecords.length);
          const completedRevenue = orderRecords
            .filter((order) => order.status.toLowerCase() === "completed")
            .reduce((sum, order) => sum + Number(order.total || 0), 0);
          setTotalSales(completedRevenue);

          const customers = new Set<string>();
          orderRecords.forEach((order) => {
            const key = order.phone?.trim() || order.customer_name?.trim() || order.id;
            customers.add(key);
          });
          setTotalCustomers(customers.size);

          const stats = getWeeklyLabels();
          orderRecords.forEach((order) => {
            const createdDate = new Date(order.created_at);
            const key = createdDate.toISOString().slice(0, 10);
            const statIndex = stats.findIndex((item) => item.key === key);

            if (statIndex >= 0) {
              stats[statIndex].orders += 1;
              if (order.status.toLowerCase() === "completed") {
                stats[statIndex].revenue += Number(order.total || 0);
              }
            }
          });
          setWeeklyStats(stats);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-gray-500">Welcome back to {store?.store_name || "your store"}!</p>
          </div>
          <ViewStoreButton />
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {errorMessage ? (
          <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ${storeType === "digital" ? "xl:grid-cols-4" : "xl:grid-cols-5"}`}>
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">Total Sales</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(totalSales)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <span className="text-xl">💵</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">Orders</p>
                <p className="text-3xl font-bold mt-2">{totalOrders}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
                <span className="text-xl">🧾</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">Customers</p>
                <p className="text-3xl font-bold mt-2">{totalCustomers}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 font-medium">Active Products</p>
                <p className="text-3xl font-bold mt-2">{productCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-xl">📦</span>
              </div>
            </div>
          </div>

          {storeType !== "digital" && (
            <div className="bg-white rounded-2xl p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium">Product Views</p>
                  <p className="text-3xl font-bold mt-2">{totalViews.toLocaleString()}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <span className="text-xl">👁️</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.85fr] mb-8">
          <div className="rounded-3xl bg-white p-6 shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Revenue Trend</p>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">Last 7 days</h2>
                <p className="mt-2 text-gray-500">Revenue and order volume by day.</p>
              </div>
              <div className="rounded-3xl bg-[#FCE7F3] px-4 py-3 text-sm font-semibold text-[#B91C7A]">
                {weeklyStats.reduce((sum, item) => sum + item.orders, 0)} orders
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {weeklyStats.map((stat) => (
                <div key={stat.key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{stat.label}</span>
                    <span>{formatCurrency(stat.revenue)}</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-full bg-gray-100 h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#D94680]"
                        style={{ width: `${Math.round((stat.revenue / maxRevenue) * 100)}%` }}
                      />
                    </div>
                    <div className="rounded-full bg-gray-100 h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2563EB]"
                        style={{ width: `${Math.round((stat.orders / maxOrders) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#D94680]" /> Revenue
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" /> Orders
              </span>
            </div>
          </div>

          {storeType !== "digital" && (
            <div className="rounded-3xl bg-white p-6 shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Top Products</p>
                  <h2 className="mt-3 text-2xl font-bold text-gray-900">Most viewed</h2>
                  <p className="mt-2 text-gray-500">Top 5 products by page views.</p>
                </div>
                <span className="rounded-3xl bg-[#EFF6FF] px-4 py-3 text-sm font-semibold text-[#1D4ED8]">
                  {topProducts.length}
                </span>
              </div>

              <div className="mt-8 space-y-4">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={product.id} className="rounded-3xl border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gray-100 overflow-hidden">
                          {product.main_image_url ? (
                            <img src={product.main_image_url} alt={product.product_name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-gray-400">No image</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{product.product_name}</p>
                          <p className="mt-1 text-sm text-gray-500">{product.views || 0} views</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">Rank #{index + 1}</p>
                          <p className="text-sm text-[#D94680]">${product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                    No top products available yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Featured Products Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-[#D94680] font-semibold hover:opacity-80">
              View All →
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {product.main_image_url ? (
                      <Image
                       src={product.main_image_url}
                       alt={product.product_name}
                       width={400}
                       height={400}
                        className="h-full w-full object-cover"

                      />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm truncate">{product.product_name}</h3>
                    <p className="text-[#D94680] font-bold mt-2">
                      ${product.price.toFixed(2)}
                    </p>
                    {storeType !== "digital" && (
                      <p className="text-gray-500 text-sm mt-1">
                        👁️ {product.views || 0} views
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow">
              <p className="text-gray-500 mb-4">No products yet</p>
              <Link
                href="/products/new"
                className="inline-block px-6 py-3 bg-[#D94680] text-white rounded-xl font-bold hover:opacity-90"
              >
                Create Your First Product
              </Link>
            </div>
          )}
        </div>

        {/* Recent Products Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Products</h2>
          </div>

          {products.length > 4 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(4, 8).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {product.main_image_url ? (
                      <Image
                     src={product.main_image_url}
                     alt={product.product_name}
                     width={120}
                      height={120}
                       className="h-full w-full object-cover"

                      />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm truncate">{product.product_name}</h3>
                    <p className="text-[#D94680] font-bold mt-2">
                      ${product.price.toFixed(2)}
                    </p>
                    {storeType !== "digital" && (
                      <p className="text-gray-500 text-sm mt-1">
                        👁️ {product.views || 0} views
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
