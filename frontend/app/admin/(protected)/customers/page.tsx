"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  payment_number: string;
  profile_image: string | null;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error: customersError } = await supabase
          .from("users")
          .select("id, full_name, email, phone, whatsapp, payment_number, profile_image, created_at")
          .order("created_at", { ascending: false });

        if (customersError) {
          setError(customersError.message);
          setCustomers([]);
          return;
        }

        setCustomers((data || []) as User[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
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

  const filteredCustomers = customers.filter((customer) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(q) ||
      customer.phone.toLowerCase().includes(q) ||
      customer.email.toLowerCase().includes(q) ||
      customer.id.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">Loading customers...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="mt-2 text-gray-500">View all marketplace customers.</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Admin</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">All customers</h2>
          </div>
          <div className="rounded-3xl bg-[#FCE7F3] px-5 py-4 text-sm font-semibold text-[#B91C7A]">
            {loading ? "Loading..." : `${customers.length} customers`}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by full name, phone, email, or user ID..."
            className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!error && filteredCustomers.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <h2 className="text-2xl font-bold">
              {search ? "No customers match your search" : "No customers found"}
            </h2>
            <p className="mt-3 text-gray-500">
              {search ? "Try a different search term." : "There are no customers yet."}
            </p>
          </div>
        )}

        {filteredCustomers.length > 0 && (
          <div className="overflow-hidden rounded-3xl bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full border-collapse text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Profile Image</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Full Name</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Email</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Phone</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">WhatsApp</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Payment Number</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Created</th>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t hover:bg-gray-50">
                      <td className="p-5">
                        {customer.profile_image ? (
                          <img
                            src={customer.profile_image}
                            alt={customer.full_name}
                            className="h-14 w-14 rounded-2xl border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            <span className="text-xs">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="p-5 font-semibold text-gray-900">
                        {customer.full_name}
                      </td>
                      <td className="p-5 text-gray-600">
                        {customer.email || "—"}
                      </td>
                      <td className="p-5 text-gray-600">
                        {customer.phone || "—"}
                      </td>
                      <td className="p-5 text-gray-600">
                        {customer.whatsapp || "—"}
                      </td>
                      <td className="p-5 text-gray-600">
                        {customer.payment_number || "—"}
                      </td>
                      <td className="p-5 text-gray-600">
                        {customer.created_at ? formatDate(customer.created_at) : "—"}
                      </td>
                      <td className="p-5">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex rounded-xl bg-[#D94680] px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
</main>
  );
}
