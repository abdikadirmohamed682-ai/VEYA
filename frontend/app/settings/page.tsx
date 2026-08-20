"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function loadStore() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, store_name, description, logo")
        .eq("user_id", session.user.id)
        .single();

      if (!storeError && storeData) {
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

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/login";
        return;
      }

      if (storeId) {
        const { error: storeUpdateError } = await supabase
          .from("stores")
          .update({
            store_name: storeName,
            description,
          })
          .eq("id", storeId);

        if (storeUpdateError) {
          alert(storeUpdateError.message);
          return;
        }
      }

      if (logoFile && storeId) {
        const fileName = `${session.user.id}_${Date.now()}`;

        const { error: uploadError } = await supabase.storage
          .from("store-logos")
          .upload(fileName, logoFile);

        if (uploadError) {
          alert(uploadError.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("store-logos")
          .getPublicUrl(fileName);

        const { error: logoUpdateError } = await supabase
          .from("stores")
          .update({
            logo: publicUrlData.publicUrl,
          })
          .eq("id", storeId);

        if (logoUpdateError) {
          alert(logoUpdateError.message);
          return;
        }

        setExistingLogo(publicUrlData.publicUrl);
      }

      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          payment_number: paymentNumber,
          phone: phoneNumber,
          whatsapp,
        })
        .eq("id", session.user.id);

      if (userUpdateError) {
        alert(userUpdateError.message);
        return;
      }

      setLogoFile(null);
      setLogoPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Settings saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving settings.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage your store settings.
            </p>
          </div>

          <div className="shrink-0">
            <ViewStoreButton />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <section className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-6 sm:px-8">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Store Information
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Update your store information and contact details.
            </p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="store-name"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Store Name
                </label>

                <input
                  id="store-name"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="block w-full min-w-0 rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-[#D94680] focus:ring-2 focus:ring-pink-100 sm:text-base"
                  placeholder="Store Name"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full min-w-0 resize-y rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm leading-6 text-gray-900 outline-none transition focus:border-[#D94680] focus:ring-2 focus:ring-pink-100 sm:text-base"
                  placeholder="Store Description"
                />
              </div>

              <div>
                <label
                  htmlFor="payment-number"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Payment Number
                </label>

                <input
                  id="payment-number"
                  type="text"
                  value={paymentNumber}
                  onChange={(e) => setPaymentNumber(e.target.value)}
                  className="block w-full min-w-0 rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-[#D94680] focus:ring-2 focus:ring-pink-100 sm:text-base"
                  placeholder="Payment Number"
                />
              </div>

              <div>
                <label
                  htmlFor="phone-number"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  Phone Number
                </label>

                <input
                  id="phone-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full min-w-0 rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-[#D94680] focus:ring-2 focus:ring-pink-100 sm:text-base"
                  placeholder="Phone Number"
                />
              </div>

              <div>
                <label
                  htmlFor="whatsapp"
                  className="mb-2 block text-sm font-semibold text-gray-800"
                >
                  WhatsApp
                </label>

                <input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="block w-full min-w-0 rounded-2xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-[#D94680] focus:ring-2 focus:ring-pink-100 sm:text-base"
                  placeholder="WhatsApp"
                />
              </div>

              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-900">
                    Store Logo
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Upload a new logo for your store.
                  </p>
                </div>

                {(logoPreview || existingLogo) && (
                  <div className="mb-5">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                      <img
                        src={logoPreview || existingLogo || ""}
                        alt="Store logo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  className="block w-full min-w-0 cursor-pointer rounded-2xl border border-gray-300 bg-white text-sm text-gray-600 file:mr-3 file:rounded-xl file:border-0 file:bg-pink-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-pink-600 hover:file:bg-pink-100"
                />
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-2xl bg-[#D94680] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[160px] sm:text-base"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}