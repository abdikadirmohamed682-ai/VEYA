"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartItem, formatCurrency, loadCart, saveCart } from "@/lib/cart";

const CART_BUTTON_TEXT = "Add To Cart";

export default function CartOverlay() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    setItems(loadCart());
  }, []);

  useEffect(() => {
    const addItem = (item: CartItem) => {
      setItems((current) => {
        const existing = current.find((entry) => entry.product_id === item.product_id);
        const nextCart = existing
          ? current.map((entry) =>
              entry.product_id === item.product_id
                ? { ...entry, quantity: entry.quantity + 1 }
                : entry
            )
          : [...current, item];
        saveCart(nextCart);
        return nextCart;
      });
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const button = target.closest("button");
      if (!button) return;
      if (button.textContent?.trim() !== CART_BUTTON_TEXT) return;
      if (!window.location.pathname.match(/^\/product\/[a-zA-Z0-9_-]+$/)) return;

      const titleEl = document.querySelector("main h1");
      const priceEl = Array.from(document.querySelectorAll("main p")).find((p) =>
        /^\$\d/.test(p.textContent?.trim() || "")
      );
      const imageEl = document.querySelector("main img");

      if (!titleEl || !priceEl || !imageEl) {
        return;
      }

      const priceText = priceEl.textContent?.trim() || "";
      const price = Number(priceText.replace(/[^0-9.]/g, ""));
      const title = titleEl.textContent?.trim() || "";
      const image = imageEl.getAttribute("src") || "";
      const productId = window.location.pathname.split("/").pop() || "";

      if (!productId || !title || Number.isNaN(price) || price <= 0) {
        return;
      }

      addItem({
        product_id: productId,
        store_id: "",
        title,
        price,
        quantity: 1,
        image,
      });

      setToast(`${title} added to cart.`);
      window.setTimeout(() => setToast(""), 2600);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
      <Link
        href="/cart"
        className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-white/95 px-4 py-3 text-sm font-semibold text-gray-900 shadow-xl shadow-pink-100/70 transition hover:bg-white"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#D94680] text-sm font-bold text-white">
          {totalQuantity}
        </span>
        View Cart
      </Link>
      {toast ? (
        <div className="pointer-events-auto max-w-sm rounded-3xl bg-white p-4 shadow-xl shadow-pink-100/70">
          <p className="text-sm text-gray-900">{toast}</p>
        </div>
      ) : null}
    </div>
  );
}
