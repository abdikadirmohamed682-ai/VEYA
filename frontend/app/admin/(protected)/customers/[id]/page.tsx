"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data, error: customerError } = await supabase
          .from("users")
          .select("*")
          .eq("id", customerId)
          .single();

        if (customerError || !data) {
          setError(customerError?.message || "Customer not found");
          return;
        }

        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">Loading customer...</p>
        </div>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="mx-auto max-w-7xl px-8 py-10">
          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/admin/customers");
              }
            }}
            className="text-pink-500 hover:underline"
          >
            <span aria-hidden="true">←</span>
          </button>
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error || "Customer not found"}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/admin/customers");
              }
            }}
            className="text-pink-500 hover:underline"
          >
            <span aria-hidden="true">←</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="flex items-center gap-6">
            {customer.profile_image ? (
              <img
                src={customer.profile_image}
                alt={customer.full_name}
                className="h-24 w-24 rounded-2xl border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <span className="text-xs">No image</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.full_name}</h1>
              <p className="mt-1 text-gray-500">{customer.email}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Phone</p>
              <p className="mt-1 font-semibold text-gray-900">{customer.phone || "—"}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">WhatsApp</p>
              <p className="mt-1 font-semibold text-gray-900">{customer.whatsapp || "—"}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Payment Number</p>
              <p className="mt-1 font-semibold text-gray-900">{customer.payment_number || "—"}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="mt-1 font-semibold text-gray-900">
                {customer.created_at
                  ? new Date(customer.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
