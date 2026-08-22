"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Seller {
  full_name: string;
  profile_image: string | null;
  payment_number: string;
}

interface CartProduct {
  store_id: string;
}

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = params.id as string;

  const requestedStoreId = searchParams.get("store_id") || "";

  const customer_name = searchParams.get("customer_name") || "";
  const phone = searchParams.get("phone") || "";
  const whatsapp = searchParams.get("whatsapp") || "";
  const address = searchParams.get("address") || "";
  const notes = searchParams.get("notes") || "";

  const [seller, setSeller] = useState<Seller | null>(null);
  const [storeId, setStoreId] = useState("");
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  const [senderNumber, setSenderNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  function goHome() {
    if (storeSlug) {
      router.push(`/store/${storeSlug}`);
    }
  }

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (storeSlug) {
      router.push(`/store/${storeSlug}`);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadSeller() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (active) {
          setLoading(false);
          router.replace(`/customer/login?redirect=/payment/${productId}`);
        }
        return;
      }

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (!customer) {
        if (active) {
          setLoading(false);
          router.replace(`/customer/login?redirect=/payment/${productId}`);
        }
        return;
      }

    let verifiedStoreId = "";

    if (productId === "cart") {
      // Cart removed in MVP — redirect back to home
      if (active) setLoading(false);
      return;
    } else {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("store_id")
        .eq("id", productId)
        .eq("status", "active")
        .single();

      if (productError || !product?.store_id) {
        if (active) setLoading(false);
        return;
      }

      verifiedStoreId = product.store_id;
    }

    if (requestedStoreId && requestedStoreId !== verifiedStoreId) {
      if (active) setLoading(false);
      return;
    }

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("user_id")
      .eq("id", verifiedStoreId)
      .single();

    if (storeError || !store) {
      if (active) setLoading(false);
      return;
    }

    const { data: storeSlugData } = await supabase
      .from("stores")
      .select("slug")
      .eq("id", verifiedStoreId)
      .single();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("full_name,profile_image,payment_number")
      .eq("id", store.user_id)
      .single();

    if (!userError && user && active) {
      setStoreId(verifiedStoreId);
      setStoreSlug(storeSlugData?.slug ?? null);
      setSeller(user as Seller);
    }

    if (active) setLoading(false);
  }

  const loadTimer = window.setTimeout(() => void loadSeller(), 0);
  return () => {
    active = false;
    window.clearTimeout(loadTimer);
  };
}, [productId, requestedStoreId]);
  async function handlePaid() {
  if (!senderNumber) {
    alert("Please enter the payment number you used.");
    return;
  }

  try {
    setSending(true);

    // Retrieve the authenticated customer ID
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/customer/login?redirect=/payment/${productId}`);
      return;
    }

    const response = await fetch("/api/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        cart_checkout: productId === "cart",
        product_id: productId,
        store_id: storeId,
        customer_name,
        phone,
        whatsapp,
        address,
        notes,
        sender_payment_number: senderNumber,
      }),
    });

    const result = await response.json();

    console.log(result);

    if (!response.ok) {
      throw new Error(JSON.stringify(result.error || result));
    }

    router.push(`/order-waiting/${result.orderId}`);

  } catch (err) {
    console.error(err);
    // Show full error details in development so the DB error is visible
    const message = err instanceof Error ? err.message : String(err);
    alert("Failed to create order: " + message);
  } finally {
    setSending(false);
  }
}

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!seller) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Seller not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-lg">

        <div className="relative mb-8 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-center mb-8">
            Payment Information
          </h1>

          <div className="absolute left-0 flex items-center gap-3">
            <button aria-label="Home"
              type="button"
              onClick={goHome}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#D94680] transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94680]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></svg>
            </button>
            <button aria-label="Back"
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <span aria-hidden="true">←</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">

          {seller.profile_image && (
            <Image
              src={seller.profile_image}
              alt={seller.full_name}
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
          )}

          <h2 className="mt-5 text-2xl font-bold">
            {seller.full_name}
          </h2>

          <p className="mt-6 text-gray-500">
            Send payment to
          </p>

          <p className="mt-2 text-3xl font-bold text-pink-600 break-all">
            {seller.payment_number}
          </p>
                    <input
            type="text"
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            placeholder="Number you sent the payment from"
            className="mt-10 w-full rounded-xl border p-4"
          />

          <div className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-semibold">
              Important
            </p>

            <p className="mt-2">
              Please make sure you have completed the payment before pressing
              the button below. Keep a screenshot of your payment until the
              seller confirms your order.
            </p>
          </div>

          <button
            onClick={handlePaid}
            disabled={sending}
            className="mt-8 w-full rounded-xl bg-pink-600 py-4 text-lg font-bold text-white hover:bg-pink-700 disabled:opacity-50"
          >
            {sending ? "Processing..." : "I've Paid"}
          </button>

        </div>

      </div>
    </main>
  );
}
