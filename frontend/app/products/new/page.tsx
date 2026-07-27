"use client";

import { FormEvent, useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getStoreTypeDefinition,
  isCategoryForStoreType,
  isStoreType,
  type StoreType,
} from "@/lib/store-types";

export default function AddProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [storeType, setStoreType] = useState<StoreType | null>(null);
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadFileUploading, setDownloadFileUploading] = useState(false);
  const [downloadFileUploaded, setDownloadFileUploaded] = useState(false);
  const [downloadFileError, setDownloadFileError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndStore = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        router.replace("/login");
        return;
      }

      const userId = sessionData.session.user.id;

      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, store_type")
        .eq("user_id", userId)
        .single();

      if (storeError || !storeData?.id) {
        setErrorMessage("Please create a store before adding products.");
        setAuthChecked(true);
        return;
      }

      const type = isStoreType(storeData.store_type)
        ? storeData.store_type
        : "digital";

      setStoreType(type);
      setCategory(getStoreTypeDefinition(type).categories[0]);
      setAuthChecked(true);
    };

    checkAuthAndStore();
  }, [router]);

  async function uploadImage(file: File) {
    const randomId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const filePath = `product-images/${randomId}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Unable to retrieve image URL.");
    }

    return data.publicUrl;
  }

  async function uploadDownloadFile(file: File): Promise<string> {
    const randomId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const ext = file.name.lastIndexOf(".") !== -1
      ? file.name.slice(file.name.lastIndexOf("."))
      : "";
    const filePath = `product-downloads/${randomId}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Unable to retrieve download URL.");
    }

    return data.publicUrl;
  }

  async function handleDownloadFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setDownloadFile(file);
    setDownloadFileUploaded(false);
    setDownloadFileError(null);
    setDownloadUrl("");

    if (!file) return;

    setDownloadFileUploading(true);

    try {
      const url = await uploadDownloadFile(file);
      setDownloadUrl(url);
      setDownloadFileUploaded(true);
    } catch (err) {
      setDownloadFileError(
        err instanceof Error ? err.message : "Failed to upload file."
      );
      setDownloadFile(null);
    } finally {
      setDownloadFileUploading(false);
    }
  }

  async function handlePublishProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!title || !description || !price || !category || !mainImageFile || !storeType) {
      alert("Please complete all fields.");
      return;
    }

    const priceValue = Number(price);

    if (Number.isNaN(priceValue) || priceValue <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (storeType === "physical" && (!Number.isInteger(quantity) || quantity < 1)) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (storeType === "digital" && !downloadFile) {
      alert("Please upload a file for your digital product.");
      return;
    }

    if (!isCategoryForStoreType(category, storeType)) {
      alert("Choose a category available for your store type.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const userId = sessionData.session.user.id;

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id,user_id,store_type")
        .eq("user_id", userId)
        .single();

      if (storeError || !store) {
        throw new Error("Store not found.");
      }

      if (!isCategoryForStoreType(category, store.store_type as StoreType)) {
        throw new Error("Category does not belong to this store type.");
      }

      const mainImageUrl = await uploadImage(mainImageFile);

      const additionalImageUrls: string[] = [];

      for (const file of additionalImageFiles) {
        additionalImageUrls.push(await uploadImage(file));
      }

      const productData: Record<string, unknown> = {
        store_id: store.id,
        product_name: title,
        description,
        price: priceValue,
        category,
        main_image_url: mainImageUrl,
        status: "active",
        views: 0,
        is_featured: false,
      };

      if (storeType === "digital") {
        productData.download_url = downloadUrl.trim();
      } else {
        productData.quantity = quantity;
        productData.additional_image_urls = additionalImageUrls;
      }

      const { error } = await supabase
        .from("products")
        .insert([productData]);

      if (error) {
        throw error;
      }

      router.push("/dashboard");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to publish product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!authChecked) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <div className="mx-auto max-w-4xl px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Add Product</h1>
          <p className="mt-2 text-gray-500">Publish a new product to your store.</p>

          {storeType && (
            <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-4">
              <p className="text-sm text-gray-500">Store Type</p>
              <h2 className="text-xl font-bold text-[#D94680]">
                {getStoreTypeDefinition(storeType).label}
              </h2>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {errorMessage}
            </div>
          )}
        </div>

        <form onSubmit={handlePublishProduct} className="space-y-8 rounded-3xl bg-white p-10 shadow">
          <div>
            <label className="mb-2 block font-semibold">Product title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
              placeholder="Product title"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Description</label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
              placeholder="Describe your product"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">Price</label>
              <input
                type="number"
                value={price}
                min="0"
                step="0.01"
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
              >
                {storeType &&
                  getStoreTypeDefinition(storeType).categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </div>

            {storeType !== "digital" && (
              <div>
                <label className="mb-2 block font-semibold">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
                />
              </div>
            )}
          </div>

          {storeType === "digital" && (
            <div>
              <label className="mb-2 block font-semibold">
                Download File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.zip,.epub,.rar"
                onChange={handleDownloadFileChange}
                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
              />
              {downloadFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {downloadFile.name}
                </p>
              )}
              {downloadFileUploading && (
                <p className="mt-2 text-sm text-blue-600">
                  Uploading file...
                </p>
              )}
              {downloadFileUploaded && (
                <p className="mt-2 text-sm text-green-600">
                  File uploaded successfully.
                </p>
              )}
              {downloadFileError && (
                <p className="mt-2 text-sm text-red-600">
                  {downloadFileError}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-2 block font-semibold">Main image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-gray-300 p-4"
            />
          </div>

          {storeType !== "digital" && (
            <div>
              <label className="mb-2 block font-semibold">Additional images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setAdditionalImageFiles(Array.from(e.target.files || []))}
                className="w-full rounded-xl border border-gray-300 p-4"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[#D94680] py-4 text-lg font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Publishing..." : "Publish Product"}
          </button>
        </form>
      </div>
    </main>
  );
}
