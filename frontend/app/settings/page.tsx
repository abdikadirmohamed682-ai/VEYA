"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ViewStoreButton from "@/components/ViewStoreButton";
import { STORE_TYPES, STORE_TYPE_DEFINITIONS, type StoreType } from "@/lib/store-types";

const STORAGE_BUCKET = "product-images";
const STORAGE_FOLDER = "store-assets";

export default function SettingsPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [storeType, setStoreType] = useState<StoreType>("digital");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [workFrom, setWorkFrom] = useState("08:00");
  const [workTo, setWorkTo] = useState("22:00");
  const [isOpen, setIsOpen] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadStore = async () => {
      setLoading(true);
      setErrorMessage(null);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.user?.id) {
        router.replace("/login");
        return;
      }

      const userId = sessionData.session.user.id;
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (storeError || !storeData) {
        setErrorMessage("No store found. Create a store to manage settings.");
        setLoading(false);
        return;
      }

      setStoreId(storeData.id);
      setStoreName(storeData.store_name || "");
      setDescription(storeData.description || "");
      setStoreType(STORE_TYPES.includes(storeData.store_type) ? storeData.store_type : "digital");
      setLogoUrl(storeData.logo || null);
      setBannerUrl(storeData.banner || null);
      setPhone(storeData.phone || "");
      setWhatsapp(storeData.whatsapp || "");
      setPaymentNumber(storeData.payment_number || "");
      setWorkFrom(storeData.work_from || "08:00");
      setWorkTo(storeData.work_to || "22:00");
      setIsOpen(storeData.is_open ?? true);
      setLoading(false);
    };

    loadStore();
  }, [router]);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [logoPreview, bannerPreview]);

  const uploadImage = async (file: File) => {
    const randomId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filePath = `${STORAGE_FOLDER}/${randomId}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Unable to retrieve image URL.");
    }

    return publicUrlData.publicUrl;
  };

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleBannerChange = (file: File | null) => {
    setBannerFile(file);
    setBannerPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!storeId) {
      setErrorMessage("Unable to save settings. Store not found.");
      return;
    }

    if (!storeName.trim()) {
      setErrorMessage("Store name is required.");
      return;
    }

    if (workFrom >= workTo) {
      setErrorMessage("Opening time must be earlier than closing time.");
      return;
    }

    setSaving(true);

    try {
      let updatedLogoUrl = logoUrl;
      let updatedBannerUrl = bannerUrl;

      if (logoFile) {
        updatedLogoUrl = await uploadImage(logoFile);
      }

      if (bannerFile) {
        updatedBannerUrl = await uploadImage(bannerFile);
      }

      const updates: Record<string, unknown> = {
        store_name: storeName,
        description,
        store_type: storeType,
        logo: updatedLogoUrl,
        banner: updatedBannerUrl,
        phone,
        whatsapp,
        payment_number: paymentNumber,
        work_from: workFrom,
        work_to: workTo,
        is_open: isOpen,
      };

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const { error: updateError } = await supabase
        .from("stores")
        .update(updates)
        .eq("id", storeId)
        .eq("user_id", session.user.id);

      if (updateError) {
        throw updateError;
      }

      setLogoUrl(updatedLogoUrl);
      setBannerUrl(updatedBannerUrl);
      setLogoFile(null);
      setBannerFile(null);
      setSuccessMessage("Settings saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!storeId) return;

    if (!window.confirm("Delete this store permanently? This cannot be undone.")) {
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    const { error } = await supabase
      .from("stores")
      .delete()
      .eq("id", storeId)
      .eq("user_id", session.user.id);
    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/create-store");
  };

  const currentLogo = logoPreview || logoUrl;
  const currentBanner = bannerPreview || bannerUrl;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFC]">
        <p className="text-gray-500">Loading store settings…</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-2 text-gray-500">Manage your store profile, contact details, payment options, and appearance.</p>
          </div>
          <ViewStoreButton />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-10">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl bg-white p-8 shadow">
              <div className="space-y-7">
                <div>
                  <h2 className="text-xl font-semibold">Store profile</h2>
                  <p className="mt-2 text-sm text-gray-500">Update the store name, description, and public visuals.</p>
                </div>

                <div>
                  <label className="mb-2 block font-semibold">Store Name</label>
                  <input
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-4"
                    placeholder="Your store name"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold">Store Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 p-4"
                    placeholder="Short store summary for customers"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold">Store Type</label>
                  <select
                    value={storeType}
                    onChange={(e) => setStoreType(e.target.value as StoreType)}
                    className="w-full rounded-xl border border-gray-300 p-4"
                  >
                    {STORE_TYPES.map((type) => (
                      <option key={type} value={type}>{STORE_TYPE_DEFINITIONS[type].label}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">Changing this also changes the categories available for new and edited products.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold">Store Logo</label>
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-4">
                      {currentLogo ? (
                        <img src={currentLogo} alt="Logo preview" className="h-28 w-full rounded-3xl object-cover" />
                      ) : (
                        <div className="flex h-28 items-center justify-center text-sm text-gray-500">Upload a logo</div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleLogoChange(event.target.files?.[0] ?? null)}
                        className="mt-4 w-full text-sm text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">Store Cover</label>
                    <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-4">
                      {currentBanner ? (
                        <img src={currentBanner} alt="Banner preview" className="h-28 w-full rounded-3xl object-cover" />
                      ) : (
                        <div className="flex h-28 items-center justify-center text-sm text-gray-500">Upload a cover image</div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleBannerChange(event.target.files?.[0] ?? null)}
                        className="mt-4 w-full text-sm text-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-8 shadow">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Store status</h2>
                  <p className="text-sm text-gray-500">Control whether your storefront is currently open for orders.</p>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setIsOpen(true)}
                      className={`rounded-2xl px-5 py-3 text-sm font-semibold ${isOpen ? "bg-[#D94680] text-white" : "border border-gray-300 text-gray-700"}`}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className={`rounded-2xl px-5 py-3 text-sm font-semibold ${!isOpen ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"}`}
                    >
                      Closed
                    </button>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-semibold">Open From</label>
                      <input
                        type="time"
                        value={workFrom}
                        onChange={(e) => setWorkFrom(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-4"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-semibold">Open Until</label>
                      <input
                        type="time"
                        value={workTo}
                        onChange={(e) => setWorkTo(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Danger zone</h2>
                  <p className="text-sm text-gray-500">Delete your store and remove it from the platform.</p>
                  <button
                    type="button"
                    onClick={handleDeleteStore}
                    className="w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Delete Store
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Contact & payments</h2>
                <p className="text-sm text-gray-500">Update the customer contact details and payment identifier used by your store.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block font-semibold">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-4"
                    placeholder="+252610000000"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold">WhatsApp Number</label>
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-4"
                    placeholder="+252610000000"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-semibold">Payment Number</label>
                <input
                  value={paymentNumber}
                  onChange={(e) => setPaymentNumber(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-4"
                  placeholder="Payment number or account ID"
                />
              </div>

              {errorMessage ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-3xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  {successMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">Last saved settings will be applied to your storefront.</div>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#D94680] px-8 py-4 font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
