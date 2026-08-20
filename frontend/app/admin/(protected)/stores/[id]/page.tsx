"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AnyRecord = Record<string, any>;

const IMAGE_KEYS = [
  "profile_image",
  "profile_photo",
  "avatar",
  "passport_image",
  "passport_photo",
  "national_id_image",
  "national_id_photo",
  "id_image",
  "id_card_image",
  "logo",
];

const HIDDEN_KEYS = [
  "password",
  "password_hash",
  "encrypted_password",
  "access_token",
  "refresh_token",
];

const LABELS: Record<string, string> = {
  full_name: "Full Name",
  name: "Name",
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  national_id: "National ID",
  national_id_number: "National ID Number",
  passport_number: "Passport Number",
  passport: "Passport",
  profile_image: "Profile Photo",
  profile_photo: "Profile Photo",
  passport_image: "Passport Image",
  passport_photo: "Passport Photo",
  national_id_image: "National ID Image",
  national_id_photo: "National ID Photo",
  id_image: "ID Image",
  id_card_image: "ID Card Image",
  store_name: "Store Name",
  store_type: "Store Type",
  logo: "Store Logo",
  verified: "Verified",
  created_at: "Created",
  user_id: "Owner ID",
};

function labelFor(key: string) {
  if (LABELS[key]) return LABELS[key];

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isImageKey(key: string) {
  return IMAGE_KEYS.includes(key.toLowerCase());
}

function isImageUrl(value: unknown) {
  if (typeof value !== "string") return false;

  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  );
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function isSensitiveKey(key: string) {
  const lower = key.toLowerCase();

  return (
    lower.includes("password") ||
    lower.includes("token") ||
    lower.includes("secret")
  );
}

export default function AdminStoreDetailPage() {
  const params = useParams();
  const router = useRouter();

  const storeId = params.id as string;

  const [store, setStore] = useState<AnyRecord | null>(null);
  const [owner, setOwner] = useState<AnyRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();

      if (storeError) {
        throw new Error(storeError.message);
      }

      if (!storeData) {
        throw new Error("Store not found.");
      }

      setStore(storeData);
      const { data: visitorData, error: visitorsError } = await supabase
        .from("store_visitor_counts")
        .select("visitor_count")
        .eq("store_id", storeId)
        .single();

      if (visitorsError) {
        console.error("Failed to load store visitor count:", visitorsError);
        setVisitorCount(null);
      } else {
        setVisitorCount(visitorData?.visitor_count ?? 0);
      }
      if (storeData.user_id) {
        const { data: ownerData, error: ownerError } = await supabase
          .from("users")
          .select("*")
          .eq("id", storeData.user_id)
          .maybeSingle();

        if (ownerError) {
          throw new Error(ownerError.message);
        }

        setOwner(ownerData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storeId) {
      fetchData();
    }
  }, [storeId]);

  const storeEntries = useMemo(() => {
    if (!store) return [];

    return Object.entries(store).filter(([key]) => {
      return !HIDDEN_KEYS.includes(key.toLowerCase());
    });
  }, [store]);

  const ownerEntries = useMemo(() => {
    if (!owner) return [];

    return Object.entries(owner).filter(([key]) => {
      return !HIDDEN_KEYS.includes(key.toLowerCase());
    });
  }, [owner]);

  const updateVerification = async (verified: boolean) => {
    if (!store) return;

    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: updateError } = await supabase
        .from("stores")
        .update({ verified })
        .eq("id", store.id)
        .select("*")
        .maybeSingle();

      if (updateError) {
        throw new Error(updateError.message);
      }

      if (!data) {
        throw new Error(
          "No rows were updated. Check the admin RLS UPDATE policy."
        );
      }

      setStore(data);
      setMessage(
        verified
          ? "Store verified successfully."
          : "Store marked as unverified."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(false);
    }
  };

  const deleteStore = async () => {
    if (!store) return;

    const confirmed = window.confirm(
      `Delete "${store.store_name || "this store"}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: deleteError } = await supabase
        .from("stores")
        .delete()
        .eq("id", store.id)
        .select("id")
        .maybeSingle();

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      if (!data) {
        throw new Error(
          "No rows were deleted. Check the admin RLS DELETE policy or foreign-key constraints."
        );
      }

      router.push("/admin/stores");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-500">Loading store...</p>
        </div>
      </main>
    );
  }

  if (error && !store) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/admin/stores");
              }
            }}
            className="text-pink-600 hover:underline"
          >
            <span aria-hidden="true">←</span>
          </button>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!store) return null;

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <button aria-label="Back"
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/admin/stores");
              }
            }}
            className="font-medium text-pink-600 hover:underline"
          >
            <span aria-hidden="true">←</span>
          </button>

          <div className="flex gap-3">
            {store.verified ? (
              <button
                onClick={() => updateVerification(false)}
                disabled={actionLoading}
                className="rounded-xl bg-gray-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Working..." : "Unverify Store"}
              </button>
            ) : (
              <button
                onClick={() => updateVerification(true)}
                disabled={actionLoading}
                className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading ? "Working..." : "Verify Store"}
              </button>
            )}

            <button
              onClick={deleteStore}
              disabled={actionLoading}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete Store
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* STORE HEADER */}
        <section className="rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              {store.logo && isImageUrl(store.logo) ? (
                <img
                  src={store.logo}
                  alt={store.store_name || "Store"}
                  className="h-24 w-24 rounded-2xl border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-100 text-xs text-gray-400">
                  No logo
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {store.store_name || "Unnamed Store"}
                </h1>

                <div className="mt-3 flex flex-wrap gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      store.verified
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {store.verified ? "Verified" : "Unverified"}
                  </span>

                  {store.store_type && (
                    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                      {store.store_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* STORE VISITOR STATISTICS */}
        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-600">
            Statistics
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Store Visitors</h2>
          <p className="mt-3 text-4xl font-bold text-gray-900">{visitorCount === null ? "—" : visitorCount}</p>
        </section>
        {/* OWNER INFORMATION */}
        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-600">
              Verification
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Owner Information
            </h2>

            <p className="mt-2 text-gray-500">
              All registration information submitted by the store owner.
            </p>
          </div>

          {!owner ? (
            <div className="rounded-2xl bg-gray-50 p-6 text-gray-500">
              No owner record found.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {ownerEntries.map(([key, value]) => {
                if (value === null || value === undefined || value === "") {
                  return null;
                }

                const image =
                  isImageKey(key) && isImageUrl(value);

                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-gray-200 p-5"
                  >
                    <p className="text-sm font-medium text-gray-500">
                      {labelFor(key)}
                    </p>

                    {image ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 block"
                      >
                        <img
                          src={value}
                          alt={labelFor(key)}
                          className="max-h-72 w-full rounded-xl border border-gray-200 object-contain"
                        />
                        <p className="mt-2 text-sm font-semibold text-pink-600">
                          Open full image
                        </p>
                      </a>
                    ) : (
                      <p className="mt-2 break-words whitespace-pre-wrap font-medium text-gray-900">
                        {formatValue(value)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* STORE DATABASE INFORMATION */}
        <section className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Store Information
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {storeEntries.map(([key, value]) => {
              if (value === null || value === undefined || value === "") {
                return null;
              }

              const image =
                isImageKey(key) && isImageUrl(value);

              return (
                <div
                  key={key}
                  className="rounded-2xl border border-gray-200 p-5"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {labelFor(key)}
                  </p>

                  {image ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block"
                    >
                      <img
                        src={value}
                        alt={labelFor(key)}
                        className="max-h-72 w-full rounded-xl border border-gray-200 object-contain"
                      />
                    </a>
                  ) : (
                    <p className="mt-2 break-words whitespace-pre-wrap font-medium text-gray-900">
                      {formatValue(value)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ADMIN ACTIONS */}
        <section className="mt-8 rounded-[2rem] border border-red-100 bg-white p-8 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900">
            Admin Actions
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            {store.verified ? (
              <button
                onClick={() => updateVerification(false)}
                disabled={actionLoading}
                className="rounded-xl bg-gray-800 px-5 py-3 font-semibold text-white disabled:opacity-50"
              >
                Unverify
              </button>
            ) : (
              <button
                onClick={() => updateVerification(true)}
                disabled={actionLoading}
                className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
              >
                Verify
              </button>
            )}

            <button
              onClick={deleteStore}
              disabled={actionLoading}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              Delete Store
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}