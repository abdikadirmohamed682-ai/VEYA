"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  status: string;
  payment_status: string;
  store_id: string;
  download_url: string | null;
  customer_id: string;
};


export default function OrderWaitingPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadOrder() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace(`/customer/login?redirect=/order-waiting/${orderId}`);
        return;
      }

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (!customer) {
        router.replace(`/customer/login?redirect=/order-waiting/${orderId}`);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          payment_status,
          store_id,
          download_url,
          customer_id
        `)
        .eq("id", orderId)
        .eq("customer_id", session.user.id)
        .single();


      if (!error && data) {
        setOrder(data);

        // Fetch the store slug for the back button
        const { data: storeData } = await supabase
          .from("stores")
          .select("slug")
          .eq("id", data.store_id)
          .single();

        if (storeData) {
          setStoreSlug(storeData.slug);
        }
      }

      setLoading(false);
    }


    if (orderId) {
      loadOrder();
    }


    const interval = setInterval(() => {
      if (orderId) {
        loadOrder();
      }
    }, 5000);


    return () => clearInterval(interval);

  }, [orderId]);



  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }


  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Order not found.
      </main>
    );
  }



  return (
    <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center px-6">

      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">

        {order.status === "completed" ? (
          <div className="mb-6 space-y-4">
            <div className="rounded-xl bg-green-100 p-4">
              <p className="font-bold text-green-700">
                ✓ Payment verified successfully.
              </p>
              <p className="text-sm text-green-600 mt-1">
                Your digital product is ready.
              </p>
            </div>

            {order.download_url ? (
              <a
                href={order.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl bg-[#D94680] py-4 text-center text-lg font-bold text-white transition hover:opacity-90"
              >
                Download Product
              </a>
            ) : (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="font-bold text-red-700">
                  Download is not available.
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Please contact the seller.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-xl font-bold text-gray-800">
              Your order will arrive within 24 hours.
            </p>

            <p className="text-gray-600 mt-3">
              Please wait and do not submit the order again.
            </p>
          </div>
        )}



        <button
          type="button"
          onClick={() => {
            if (storeSlug) {
              router.push(`/store/${storeSlug}`);
            }
          }}
          disabled={!storeSlug}
          className="w-full rounded-xl bg-black py-4 text-white font-bold disabled:opacity-50"
        >
          Back to Store
        </button>


      </div>

    </main>
  );
}