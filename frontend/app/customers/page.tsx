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

        const { data, error } = await supabase
          .from("orders")
          .select("customer_name, phone, total, status, created_at")
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
          const orderDate = new Date(order.created_at).toISOString();

          if (existing) {
            existing.order_count += 1;
            existing.total_spent += Number(order.total || 0);
            if (orderDate > existing.last_order_date) {
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

        const customerList = Array.from(customerMap.values()).sort(
          (a, b) => Number(new Date(b.last_order_date)) - Number(new Date(a.last_order_date))
        );

        setCustomers(customerList);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="mt-1 text-gray-500">View customers from completed orders.</p>
          </div>
          <ViewStoreButton />
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Customer Insights</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Customers with completed orders</h2>
          </div>
          <div className="rounded-3xl bg-[#FCE7F3] px-5 py-4 text-sm font-semibold text-[#B91C7A]">
            {loading ? "Loading..." : `${customers.length} customers`}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow">
          <table className="w-full min-w-full border-collapse text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Customer</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Phone</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Orders</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Total Spent</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Last Order</th>
                <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.phone} className="border-b hover:bg-gray-50">
                    <td className="p-5 font-semibold text-gray-900">{customer.customer_name}</td>
                    <td className="p-5 text-gray-600">{customer.phone}</td>
                    <td className="p-5 text-gray-900">{customer.order_count}</td>
                    <td className="p-5 font-semibold text-[#D94680]">${customer.total_spent.toFixed(2)}</td>
                    <td className="p-5 text-gray-600">{formatDate(customer.last_order_date)}</td>
                    <td className="p-5">
                      <Link
                        href={`/customers/${encodeURIComponent(customer.phone)}`}
                        className="inline-flex rounded-3xl bg-[#D94680] px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
