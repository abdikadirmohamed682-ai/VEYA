"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ViewStoreButton from "@/components/ViewStoreButton";

interface OrderRecord {
  customer_name: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
}

interface CustomerSummary {
  customer_name: string;
  phone: string;
  order_count: number;
  total_spent: number;
  last_order_date: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        const { data: store, error: storeError } = await supabase
          .from("stores")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (storeError || !store) {
          throw new Error(
            storeError?.message || "Store not found."
          );
        }

        const { data, error } = await supabase
          .from("orders")
          .select(
            "customer_name, phone, total, status, created_at"
          )
          .eq("store_id", store.id)
          .eq("status", "completed")
          .order("created_at", { ascending: true });

        if (error) {
          setError(error.message);
          setCustomers([]);
          return;
        }

        const records = (data || []) as OrderRecord[];
        const customerMap = new Map<string, CustomerSummary>();

        records.forEach((order) => {
          const key = order.phone || order.customer_name;
          const existing = customerMap.get(key);

          const orderDate = new Date(
            order.created_at
          ).toISOString();

          if (existing) {
            existing.order_count += 1;
            existing.total_spent += Number(order.total || 0);

            if (
              orderDate > existing.last_order_date
            ) {
              existing.last_order_date = orderDate;
            }

            customerMap.set(key, existing);
          } else {
            customerMap.set(key, {
              customer_name: order.customer_name,
              phone: order.phone,
              order_count: 1,
              total_spent: Number(order.total || 0),
              last_order_date: orderDate,
            });
          }
        });

        const customerList = Array.from(
          customerMap.values()
        ).sort(
          (a, b) =>
            Number(new Date(b.last_order_date)) -
            Number(new Date(a.last_order_date))
        );

        setCustomers(customerList);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Customers
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Customers from completed orders
            </p>
          </div>

          <div className="shrink-0">
            <ViewStoreButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
        {/* Summary */}
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-500 sm:text-xs">
                Customer Insights
              </p>

              <h2 className="mt-1 truncate text-base font-bold text-gray-900 sm:text-xl">
                Your customers
              </h2>
            </div>

            <div className="shrink-0 rounded-full bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-600 sm:px-4">
              {loading
                ? "Loading..."
                : `${customers.length} ${
                    customers.length === 1
                      ? "customer"
                      : "customers"
                  }`}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Loading customers...
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          customers.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                No customers found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Customers will appear here after completed
                orders.
              </p>
            </div>
          )}

        {/* Customers */}
        {!loading &&
          !error &&
          customers.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* List header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    All Customers
                  </p>

                  <p className="text-xs text-gray-400">
                    Based on completed orders
                  </p>
                </div>
              </div>

              {/* Customer list */}
              <div className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <Link
                    key={customer.phone || customer.customer_name}
                    href={`/customers/${encodeURIComponent(
                      customer.phone
                    )}`}
                    className="block px-4 py-3 transition hover:bg-gray-50 active:bg-gray-100 sm:px-5 sm:py-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600 sm:h-11 sm:w-11">
                        {customer.customer_name
                          ?.charAt(0)
                          ?.toUpperCase() || "?"}
                      </div>

                      {/* Customer info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                            {customer.customer_name}
                          </h3>
                        </div>

                        <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-gray-500">
                          <span className="truncate">
                            {customer.phone}
                          </span>

                          <span className="text-gray-300">
                            •
                          </span>

                          <span className="shrink-0">
                            {customer.order_count}{" "}
                            {customer.order_count === 1
                              ? "order"
                              : "orders"}
                          </span>
                        </div>
                      </div>

                      {/* Spending */}
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-pink-600">
                          $
                          {customer.total_spent.toFixed(
                            2
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-400 sm:text-xs">
                          {formatDate(
                            customer.last_order_date
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
      </div>
    </main>
  );
}