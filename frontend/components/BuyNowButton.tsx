"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addCartItem } from "@/lib/cart";

interface BuyNowButtonProps {
  product_id: string;
  title: string;
  price: number;
  image: string;
  disabled?: boolean;
}

export default function BuyNowButton({
  product_id,
  title,
  price,
  image,
  disabled = false,
}: BuyNowButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "processing">("idle");

  const handleBuyNow = () => {
    if (disabled) return;

    setStatus("processing");
    addCartItem({ product_id, title, price, image, quantity: 1 });
    router.push("/checkout");
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
      {disabled ? "Out of Stock" : status === "processing" ? "Processing..." : "Buy Now"}
    </button>
  );
}
