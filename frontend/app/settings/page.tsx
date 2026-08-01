"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import ViewStoreButton from "@/components/ViewStoreButton";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadStore() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: storeData, error } = await supabase
        .from("stores")
        .select("id, store_name, description, logo")
        .eq("user_id", session.user.id)
        .single();

      if (!error && storeData) {
        setStoreId(storeData.id);
        setStoreName(storeData.store_name || "");
        setDescription(storeData.description || "");
        setExistingLogo(storeData.logo || null);
      }

      const { data: userData } = await supabase
        .from("users")
        .select("payment_number, phone, whatsapp")
        .eq("id", session.user.id)
        .single();

      if (userData) {
        setPaymentNumber(userData.payment_number || "");
        setPhoneNumber(userData.phone || "");
        setWhatsapp(userData.whatsapp || "");
      }

      setLoading(false);
    }

    loadStore();
  }, []);

  async function handleSave() {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const promises = [];

    if (storeId) {
      promises.push(
        supabase
          .from("stores")
          .update({ store_name: storeName, description })
          .eq("id", storeId)
      );
    }

    if (logoFile) {
      const fileName = `${session?.user.id}_${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("store-logos")
        .upload(fileName, logoFile);

      if (uploadError) {
        setSaving(false);
        alert(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("store-logos")
        .getPublicUrl(fileName);

      if (storeId) {
        promises.push(
          supabase
            .from("stores")
            .update({ logo: publicUrlData.publicUrl })
            .eq("id", storeId)
        );
      }
    }

    promises.push(
      (async () => {
        const { error: updateError } = await supabase
          .from("users")
          .update({ payment_number: paymentNumber, phone: phoneNumber, whatsapp: whatsapp })
          .eq("id", session?.user.id);
        if (updateError) {
          console.error(updateError);
          alert(updateError.message);
        }
      })()
    );
    await Promise.all(promises);
    setSaving(false);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC]">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-2 text-gray-500">Manage your store settings.</p>
          </div>
          <ViewStoreButton />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold">Store Information</h2>
          <p className="mt-2 text-gray-500">Update your store information.</p>

          <div className="mt-8">
            <label className="mb-2 block font-semibold">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
              placeholder="Store Name"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-semibold">Description</label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
              placeholder="Store Description"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-semibold">Payment Number</label>
            <input
              type="text"
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
              placeholder="Payment Number"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-semibold">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
              placeholder="Phone Number"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-semibold">WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
              placeholder="WhatsApp"
            />
          </div>

          <div className="mt-6">
            <label className="mb-2 block font-semibold">Store Logo</label>
            {(logoPreview || existingLogo) && (
              <div className="mb-4">
                <img
                  src={logoPreview || existingLogo || ""}
                  alt="Store logo"
                  className="h-32 w-32 rounded-2xl border border-gray-200 object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleLogoChange}
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-[#D94680] file:mr-4 file:rounded-xl file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-600 hover:file:bg-pink-100"
            />
            <p className="mt-2 text-sm text-gray-500">Change Logo</p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-[#D94680] px-8 py-4 font-bold text-white transition hover:opacity-90"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
</div>
      </div>

    </main>
  );
}
