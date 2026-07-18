"use client";

import { useState } from "react";
import { CartItem, addCartItem } from "@/lib/cart";

interface AddToCartButtonProps {
  product_id: string;
  title: string;
  price: number;
  image: string;
}

export default function AddToCartButton({ product_id, title, price, image }: AddToCartButtonProps) {
  const [status, setStatus] = useState<"idle" | "added">("idle");

  const handleAdd = () => {
    addCartItem({ product_id, title, price, image, quantity: 1 });
    setStatus("added");
    window.setTimeout(() => setStatus("idle"), 1800);
  };

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="w-full rounded-3xl bg-[#D94680] px-6 py-4 text-lg font-bold text-white transition hover:bg-pink-600"
    >
      {status === "added" ? "Added to Cart" : "Add To Cart"}
    </button>
  );
}
