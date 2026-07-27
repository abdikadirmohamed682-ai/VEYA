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

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const productId = params.id as string;

  const storeId = searchParams.get("store_id") || "";

  const customer_name = searchParams.get("customer_name") || "";
  const phone = searchParams.get("phone") || "";
  const whatsapp = searchParams.get("whatsapp") || "";
  const address = searchParams.get("address") || "";
  const notes = searchParams.get("notes") || "";

  const [seller, setSeller] = useState<Seller | null>(null);

  const [senderNumber, setSenderNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
useEffect(() => {
  async function loadSeller() {
    console.log("storeId:", storeId);

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("user_id")
      .eq("id", storeId)
      .single();

    console.log("store:", store);
    console.log("storeError:", storeError);

    if (storeError || !store) {
      setLoading(false);
      return;
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("full_name,profile_image,payment_number")
      .eq("id", store.user_id)
      .single();

    console.log("user:", user);
    console.log("userError:", userError);

    setSeller(user as Seller);
    setLoading(false);
  }

  if (storeId) {
    loadSeller();
  } else {
    console.log("storeId is empty");
    setLoading(false);
  }
}, [storeId]);
  async function handlePaid() {
  if (!senderNumber) {
    alert("Please enter the payment number you used.");
    return;
  }

  try {
    setSending(true);

    // Retrieve the authenticated customer ID
    const { data: { session } } = await supabase.auth.getSession();
    const customer_id = session?.user?.id || null;

    const response = await fetch("/api/buy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        store_id: storeId,
        customer_name,
        phone,
        whatsapp,
        address,
        notes,
        sender_payment_number: senderNumber,
        customer_id,
      }),
    });

    const result = await response.json();

    console.log(result);

    if (!response.ok) {
      throw new Error(result.error || "Unknown error");
    }

    router.push(`/order-waiting/${result.orderId}`);

  } catch (err) {
    console.error(err);
    alert("Failed to create order.");
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

        <h1 className="text-3xl font-bold text-center mb-8">
          Payment Information
        </h1>

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