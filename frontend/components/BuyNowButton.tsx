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

  const [status, setStatus] = useState<"idle" | "processing">("idle");


  const handleBuyNow = async () => {
    if (disabled) return;

    setStatus("processing");

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/customer/login?redirect=/buy/${product_id}`);
      return;
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("id", session.user.id)
      .single();

    if (!customer) {
      router.push(`/customer/login?redirect=/buy/${product_id}`);
      return;
    }

    router.push(`/buy/${product_id}`);
  };


  return (
    <button
      type="button"
      onClick={handleBuyNow}
      disabled={disabled || status === "processing"}
      className={`w-full rounded-3xl border border-[#D94680] px-6 py-4 text-lg font-bold text-[#D94680] transition ${
        disabled
          ? "cursor-not-allowed bg-gray-100 text-gray-500"
          : "bg-white hover:bg-[#FCE7F3]"
      }`}
    >
      {disabled
        ? "Out of Stock"
        : status === "processing"
        ? "Processing..."
        : "Buy Now"}
    </button>
  );
}