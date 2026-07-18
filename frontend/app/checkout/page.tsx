"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadCart, formatCurrency } from "@/lib/cart";

interface CheckoutForm {
  fullName: string;
  phoneNumber: string;
  whatsappNumber: string;
  deliveryAddress: string;
  notes: string;
}

export default function CheckoutPage() {
  const [items, setItems] = useState(loadCart());
  const [form, setForm] = useState<CheckoutForm>({
    fullName: "",
    phoneNumber: "",
    whatsappNumber: "",
    deliveryAddress: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const deliveryFee = 5.0;
  const grandTotal = subtotal + deliveryFee;

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    setError(null);

    if (!form.fullName || !form.phoneNumber || !form.whatsappNumber || !form.deliveryAddress) {
      setError("Please fill in all required customer fields.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          whatsappNumber: form.whatsappNumber,
          deliveryAddress: form.deliveryAddress,
          notes: form.notes,
        },
        items,
        totals: {
          subtotal,
          deliveryFee,
          grandTotal,
        },
      }),
    });

    const json = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(json?.error || "Unable to place order.");
      return;
    }

    window.localStorage.removeItem("veya-cart");
    router.push("/order-success");
  };

  return (
    <main className="min-h-screen bg-[#FAFAFC] py-10 px-4 sm:px-6 lg:px-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">Checkout</p>
            <h1 className="mt-3 text-4xl font-bold text-gray-900">Complete your order</h1>
          </div>
          <div className="rounded-3xl bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm">
            {items.length} items
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
              <h2 className="text-2xl font-bold text-gray-900">Order details</h2>
              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={item.product_id} className="grid gap-4 border-b border-gray-200 pb-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <img src={item.image} alt={item.title} className="h-24 w-24 rounded-3xl object-cover" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{item.title}</p>
                      <p className="mt-2 text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#D94680]">{formatCurrency(item.price)}</p>
                      <p className="mt-1 text-sm text-gray-600">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
              <h2 className="text-2xl font-bold text-gray-900">Customer information</h2>
              <div className="mt-6 grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Full Name</span>
                  <input
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="w-full rounded-3xl border border-gray-200 bg-[#FEF3F8] p-4 text-gray-900 outline-none focus:border-[#D94680]"
                    placeholder="Your full name"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Phone Number</span>
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    className="w-full rounded-3xl border border-gray-200 bg-[#FEF3F8] p-4 text-gray-900 outline-none focus:border-[#D94680]"
                    placeholder="Phone number"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700">WhatsApp Number</span>
                  <input
                    value={form.whatsappNumber}
                    onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                    className="w-full rounded-3xl border border-gray-200 bg-[#FEF3F8] p-4 text-gray-900 outline-none focus:border-[#D94680]"
                    placeholder="WhatsApp number"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Delivery Address</span>
                  <textarea
                    value={form.deliveryAddress}
                    onChange={(e) => handleChange("deliveryAddress", e.target.value)}
                    className="w-full rounded-3xl border border-gray-200 bg-[#FEF3F8] p-4 text-gray-900 outline-none focus:border-[#D94680]"
                    placeholder="Delivery address"
                    rows={4}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Notes (optional)</span>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    className="w-full rounded-3xl border border-gray-200 bg-[#FEF3F8] p-4 text-gray-900 outline-none focus:border-[#D94680]"
                    placeholder="Any delivery instructions or notes"
                    rows={3}
                  />
                </label>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40">
              <h2 className="text-2xl font-bold text-gray-900">Summary</h2>
              <div className="mt-6 space-y-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 text-lg font-bold text-gray-900 flex items-center justify-between">
                  <span>Grand Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {error ? <p className="mt-5 rounded-3xl bg-[#FCE7F3] p-4 text-sm text-[#9D174D]">{error}</p> : null}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="mt-6 w-full rounded-3xl bg-[#D94680] px-6 py-4 text-lg font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Placing order..." : "Place Order"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
