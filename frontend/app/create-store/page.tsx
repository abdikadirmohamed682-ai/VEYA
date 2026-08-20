"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { STORE_TYPES, STORE_TYPE_DEFINITIONS, type StoreType } from "@/lib/store-types";

export default function CreateStorePage() {
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [storeType, setStoreType] = useState<StoreType | "">("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function createSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  async function handleCreateStore(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!storeName || !storeType) {
      alert("Please enter your store name and choose a store type.");
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError || !authData?.session) {
      setLoading(false);
      router.replace("/login");
      return;
    }

const userId = authData.session.user.id;
    const slug = createSlug(storeName) || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    let logoUrl = "";

    if (logoFile) {
      const fileName = `${userId}_${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("store-logos")
        .upload(fileName, logoFile);

      if (uploadError) {
        setLoading(false);
        alert(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("store-logos")
        .getPublicUrl(fileName);

      logoUrl = publicUrlData.publicUrl;
    }

    const { data: storeData, error } = await supabase
      .from("stores")
      .insert([
        {
          store_name: storeName,
          slug: slug,
          description: description,
          logo: logoUrl,
          banner: "",
          verified: false,
          user_id: userId,
          store_type: storeType,
        },
      ])
      .select("id")
      .single();

    setLoading(false);

    if (error) {
      alert(`${error.message}${error.details ? `\n${error.details}` : ""}`);
      return;
    }

    if (!storeData?.id) {
      alert("Store creation failed. Please try again.");
      return;
    }

    router.push("/dashboard");
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

  return (
    <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center px-6">

      <div className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Create Your Store
            </h1>

            <p className="mt-3 text-gray-500">
              Your professional store will be ready in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button aria-label="Home"
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#D94680] transition hover:bg-pink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D94680]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></svg>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleCreateStore}
          className="mt-10 space-y-6"
        >

          <div>

            <label className="mb-2 block font-semibold">
              Store Name
            </label>

            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Example: VEYA Fashion"
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-pink-500"
            />

          </div>

          <div>
            <label className="mb-2 block font-semibold">Store Type</label>
            <select
              value={storeType}
              onChange={(e) => setStoreType(e.target.value as StoreType)}
              required
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-pink-500"
            >
              <option value="" disabled>Select the type of store you run</option>
              {STORE_TYPES.map((type) => (
                <option key={type} value={type}>{STORE_TYPE_DEFINITIONS[type].label}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">Choose Digital Store for downloads and licenses, or Physical Store for tangible products.</p>
          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Store Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Tell customers what you sell..."
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-pink-500"
            />

          </div>

          <div>
            <label className="mb-2 block font-semibold">Store Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full rounded-2xl border border-gray-300 p-4 outline-none focus:border-pink-500 file:mr-4 file:rounded-xl file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-600 hover:file:bg-pink-100"
            />
            {logoPreview && (
              <div className="mt-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-32 w-32 rounded-2xl border border-gray-200 object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#D94680] py-4 text-lg font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Store"}
          </button>

        </form>

      </div>

    </main>
  );
}
