"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartItem, formatCurrency, loadCart, saveCart } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  useEffect(() => {
    const handleStorage = () => setItems(loadCart());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const updateItem = (product_id: string, nextQuantity: number) => {
    setItems((current) => {
      const updated = current
        .map((item) =>
          item.product_id === product_id
            ? { ...item, quantity: Math.max(1, nextQuantity) }
            : item
        )
        .filter((item) => item.quantity > 0);
      saveCart(updated);
      return updated;
    });
  };

  const removeItem = (product_id: string) => {
    setItems((current) => {
      const updated = current.filter((item) => item.product_id !== product_id);
      saveCart(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    saveCart([]);
  };

  return (
    <main className="min-h-screen bg-[#FAFAFC] py-10 px-4 sm:px-6 lg:px-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-pink-100/60 sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#D94680]">Shopping Cart</p>
              <h1 className="mt-3 text-4xl font-bold text-gray-900">Review your order</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={clearCart}
                className="rounded-3xl border border-[#D94680] bg-white px-5 py-3 text-sm font-semibold text-[#D94680] transition hover:bg-[#FCE7F3]"
              >
                Clear Cart
              </button>
              <Link
                href="/"
                className="rounded-3xl bg-[#D94680] px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 shadow-xl shadow-pink-100/60 text-center">
            <p className="text-lg font-semibold text-gray-900">Your cart is empty.</p>
            <p className="mt-3 text-gray-600">Add products to see them here.</p>
            <Link
              href="/"
              className="mt-8 inline-flex rounded-3xl bg-[#D94680] px-8 py-4 text-sm font-semibold text-white transition hover:bg-pink-600"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-36 w-full flex-none rounded-3xl object-cover md:w-44"
                    />

                    <div className="flex-1">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.24em] text-[#D94680]">Item</p>
                          <h2 className="mt-2 text-2xl font-bold text-gray-900">{item.title}</h2>
                        </div>
                        <p className="text-2xl font-bold text-[#D94680]">{formatCurrency(item.price)}</p>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-[#FEF3F8] p-3">
                          <button
                            type="button"
                            onClick={() => updateItem(item.product_id, item.quantity - 1)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#D94680] transition hover:bg-[#FCE7F3]"
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-lg font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItem(item.product_id, item.quantity + 1)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#D94680] transition hover:bg-[#FCE7F3]"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id)}
                          className="rounded-3xl bg-[#FCE7F3] px-5 py-3 text-sm font-semibold text-[#D94680] transition hover:bg-[#F8E3EF]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl bg-[#FAF2F7] p-4 text-sm text-gray-600">
                    <p>
                      Subtotal: <span className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-[2rem] bg-white p-8 shadow-xl shadow-pink-100/60">
              <p className="text-sm uppercase tracking-[0.28em] text-[#D94680]">Order summary</p>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="font-semibold text-gray-900">{items.length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <span className="text-sm text-gray-600">Grand total</span>
                  <span className="text-2xl font-bold text-[#D94680]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-8 inline-flex w-full items-center justify-center rounded-3xl bg-[#D94680] px-6 py-4 text-lg font-bold text-white transition hover:bg-pink-600"
                onClick={() => alert("Checkout is not implemented yet.")}
              >
                Proceed to Checkout
              </button>

              <p className="mt-4 text-sm text-gray-600">
                Payment is not implemented yet. This page is a preview of your order.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
