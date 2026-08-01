"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  store_id: string;
  product_name: string;
  description: string | null;
  price: number;
  main_image_url: string | null;
}

export default function BuyPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);
  const [storeType, setStoreType] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadProduct() {
      // Require customer authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/customer/login?redirect=/buy/${productId}`);
        return;
      }

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("id", session.user.id)
        .single();

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          store_id,
          product_name,
          description,
          price,
          main_image_url
        `)
        .eq("id", productId)
        .eq("status", "active")
        .single();

      if (error || !data) {
        router.push("/");
        return;
      }

      setProduct(data as Product);

      // Fetch store type and check ownership
      const { data: store } = await supabase
        .from("stores")
        .select("user_id, store_type")
        .eq("id", data.store_id)
        .single();

      setStoreType(store?.store_type ?? null);

if (store && store.user_id === session.user.id) {
        setIsOwner(true);
        setLoading(false);
        return;
      }

      if (!customer) {
        router.push(`/customer/login?redirect=/buy/${productId}`);
        return;
      }

      setLoading(false);
    }

    if (productId) {
      loadProduct();
    }
  }, [productId, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Product not found.
      </main>
    );
  }

  if (isOwner) {
    return (
      <main className="min-h-screen bg-[#FAFAFC] py-10 px-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-lg text-center">
          <p className="text-xl text-gray-600">You cannot purchase your own product.</p>
        </div>
      </main>
    );
  }

  async function handleBuy() {
    if (!fullName || !phone || !whatsapp) {
      alert("Please fill all required fields.");
      return;
    }

    if (storeType !== "digital" && !address) {
      alert("Please fill all required fields.");
      return;
    }

    if (!product) return;

    setSending(true);

    const query = new URLSearchParams({
      product_id: product.id,
      store_id: product.store_id,
      customer_name: fullName,
      phone,
      whatsapp,
      address,
      notes,
    });

    router.push(`/payment/${product.id}?${query.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] py-10 px-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-lg">

        <h1 className="mb-8 text-4xl font-bold">
          Buy Product
        </h1>

        <div className="mb-8 flex gap-6">

          {product.main_image_url && (
            <Image
              src={product.main_image_url}
              alt={product.product_name}
              width={180}
              height={180}
              className="rounded-2xl object-cover"
            />
          )}

          <div>
            <h2 className="text-3xl font-bold">
              {product.product_name}
            </h2>

            <p className="mt-3 text-lg text-gray-600">
              {product.description}
            </p>

            <p className="mt-6 text-3xl font-bold text-pink-600">
              ${product.price}
            </p>
          </div>

        </div>

        <div className="space-y-5">

          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full rounded-xl border p-4"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-full rounded-xl border p-4"
          />
                    <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp Number"
            className="w-full rounded-xl border p-4"
          />

          {storeType !== "digital" && (
            <textarea
              rows={4}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery Address"
              className="w-full rounded-xl border p-4"
            />
          )}

          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (Optional)"
            className="w-full rounded-xl border p-4"
          />

          <button
            onClick={handleBuy}
            disabled={sending}
            className="w-full rounded-xl bg-pink-600 py-4 text-lg font-bold text-white transition hover:bg-pink-700 disabled:opacity-50"
          >
            {sending ? "Loading..." : "Next"}
          </button>

        </div>

      </div>
    </main>
  );
}

