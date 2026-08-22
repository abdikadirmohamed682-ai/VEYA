"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface BuyNowButtonProps {
  product_id: string;
  store_id: string;
  title: string;
  price: number;
  image: string;
  disabled?: boolean;
}

export default function BuyNowButton({
  product_id,
  store_id,
  title,
  price,
  image,
  disabled = false,
}: BuyNowButtonProps) {
  const router = useRouter();

  const [status, setStatus] = useState<
    "idle" | "processing" | "self-purchase"
  >("idle");

  const handleBuyNow = async () => {
    // Prevent multiple clicks
    if (disabled || status === "processing") return;

    // Immediately lock the button
    setStatus("processing");

    try {
      // Check authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/customer/login?redirect=/buy/${product_id}`);
        return;
      }

      // Check store owner
      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("user_id")
        .eq("id", store_id)
        .single();

      if (storeError) {
        console.error("Error checking store owner:", storeError);
        setStatus("idle");
        return;
      }

      // Prevent the store owner from buying their own product
      if (store && store.user_id === session.user.id) {
        setStatus("self-purchase");
        return;
      }

      // Check customer account
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (customerError || !customer) {
        router.push(`/customer/login?redirect=/buy/${product_id}`);
        return;
      }

      // Customer can continue to buy
      router.push(`/buy/${product_id}`);
    } catch (error) {
      console.error("Buy Now error:", error);

      // Allow trying again only if a real error occurred
      setStatus("idle");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBuyNow}
      disabled={
        disabled ||
        status === "processing" ||
        status === "self-purchase"
      }
      className={`w-full rounded-3xl border px-6 py-4 text-lg font-bold transition ${
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
          : status === "self-purchase"
          ? "cursor-not-allowed border-red-200 bg-red-50 text-red-600"
          : status === "processing"
          ? "cursor-wait border-gray-200 bg-gray-100 text-gray-500"
          : "border-[#D94680] bg-white text-[#D94680] hover:bg-[#FCE7F3]"
      }`}
    >
      {disabled
        ? "Out of Stock"
        : status === "self-purchase"
        ? "You cannot purchase your own product."
        : status === "processing"
        ? "Processing..."
        : "Buy Now"}
    </button>
  );
}