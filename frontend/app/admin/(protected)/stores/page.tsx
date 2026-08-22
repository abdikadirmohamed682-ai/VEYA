"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AnyRecord = Record<string, any>;

interface Store {
  id: string;
  store_name: string;
  store_type: string | null;
  logo: string | null;
  verified: boolean;
  created_at: string;
  user_id: string;
  visitorCount: number | null;
}

interface Owner extends AnyRecord {
  id: string;
}

const HIDDEN_KEYS = [
  "password",
  "password_hash",
  "encrypted_password",
  "access_token",
  "refresh_token",
  "token",
  "secret",
];

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
  avatar: "Profile Photo",

  passport_image: "Passport Image",
  passport_photo: "Passport Image",

  national_id_image: "National ID Image",
  national_id_photo: "National ID Image",

  id_image: "ID Image",
  id_card_image: "ID Card Image",
};

function labelFor(key: string) {
  if (LABELS[key]) {
    return LABELS[key];
  }

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isHiddenKey(key: string) {
  const lower = key.toLowerCase();

  return HIDDEN_KEYS.some(
    (hiddenKey) =>
      lower === hiddenKey || lower.includes(hiddenKey)
  );
}

function isImageKey(key: string) {
  return IMAGE_KEYS.includes(key.toLowerCase());
}

function isImageUrl(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }

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

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Record<string, Owner>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openOwner, setOpenOwner] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        setError(null);

        /*
         * ---------------------------------------------------------
         * 1. LOAD STORES
         * ---------------------------------------------------------
         *
         * Keep all existing store information exactly as before.
         */
        const { data: storesData, error: storesError } = await supabase
          .from("stores")
          .select(
            "id, store_name, store_type, logo, verified, created_at, user_id"
          )
          .order("created_at", { ascending: false });

        if (storesError) {
          setError(storesError.message);
          setStores([]);
          return;
        }

        /*
         * ---------------------------------------------------------
         * 2. LOAD VISITOR COUNTS
         * ---------------------------------------------------------
         */
        const {
          data: visitorCounts,
          error: visitorCountsError,
        } = await supabase
          .from("store_visitor_counts")
          .select("store_id, visitor_count");

        if (visitorCountsError) {
          throw new Error(visitorCountsError.message);
        }

        const visitorCountMap = new Map<string, number>();

        (visitorCounts ?? []).forEach((item) => {
          visitorCountMap.set(
            item.store_id,
            Number(item.visitor_count) || 0
          );
        });

        /*
         * ---------------------------------------------------------
         * 3. BUILD STORES LIST
         * ---------------------------------------------------------
         */
        const storesList: Store[] = (storesData || []).map((store) => ({
          ...(store as Store),
          visitorCount: visitorCountMap.get(store.id) ?? 0,
        }));

        setStores(storesList);

        /*
         * ---------------------------------------------------------
         * 4. LOAD COMPLETE MERCHANT / OWNER DATA
         * ---------------------------------------------------------
         *
         * IMPORTANT:
         * We use select("*") instead of selecting only:
         * full_name, email, phone, whatsapp.
         *
         * This means any additional registration fields already
         * stored in the users table will also appear here.
         */
        if (storesList.length > 0) {
          const ownerIds = Array.from(
            new Set(storesList.map((store) => store.user_id).filter(Boolean))
          );

          if (ownerIds.length > 0) {
            const {
              data: usersData,
              error: usersError,
            } = await supabase
              .from("users")
              .select("*")
              .in("id", ownerIds);

            if (usersError) {
              setError(usersError.message);
              return;
            }

            const ownerMap: Record<string, Owner> = {};

            (usersData || []).forEach((user) => {
              ownerMap[user.id] = user as Owner;
            });

            setOwners(ownerMap);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : String(err)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /*
   * Return only useful owner fields.
   * Sensitive fields are automatically excluded.
   */
  const getOwnerEntries = (owner: Owner | undefined) => {
    if (!owner) {
      return [];
    }

    return Object.entries(owner).filter(([key, value]) => {
      if (isHiddenKey(key)) {
        return false;
      }

      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return false;
      }

      return true;
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">
            Loading stores...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">
              Stores
            </h1>

            <p className="mt-2 text-gray-500">
              View all stores and their complete merchant information.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">

        {/* SUMMARY */}
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Admin
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              All stores
            </h2>
          </div>

          <div className="mt-4 rounded-3xl bg-[#FCE7F3] px-5 py-4 text-sm font-semibold text-[#B91C7A] sm:mt-0">
            {stores.length} stores
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error && stores.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <h2 className="text-2xl font-bold">
              No stores found
            </h2>

            <p className="mt-3 text-gray-500">
              There are no stores yet.
            </p>
          </div>
        )}

        {/* STORES TABLE */}
        {stores.length > 0 && (
          <div className="overflow-hidden rounded-3xl bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] border-collapse text-left">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Logo
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Store
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Type
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Visitors
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Verified
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Created
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Merchant
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {stores.map((store) => {
                    const owner = owners[store.user_id];
                    const ownerEntries = getOwnerEntries(owner);
                    const isOwnerOpen = openOwner === store.id;

                    return (
                      <tr
                        key={store.id}
                        className="border-t align-top hover:bg-gray-50"
                      >
                        {/* LOGO */}
                        <td className="p-5">
                          {store.logo ? (
                            <img
                              src={store.logo}
                              alt={store.store_name}
                              className="h-14 w-14 rounded-2xl border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                              <span className="text-xs">
                                No logo
                              </span>
                            </div>
                          )}
                        </td>

                        {/* STORE */}
                        <td className="p-5">
                          <p className="font-semibold text-gray-900">
                            {store.store_name}
                          </p>
                        </td>

                        {/* TYPE */}
                        <td className="p-5 text-gray-600">
                          {store.store_type || "—"}
                        </td>

                        {/* VISITORS */}
                        <td className="p-5 font-semibold text-gray-900">
                          {store.visitorCount === null
                            ? "—"
                            : `${store.visitorCount} Visitors`}
                        </td>

                        {/* VERIFIED */}
                        <td className="p-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                              store.verified
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {store.verified
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </td>

                        {/* CREATED */}
                        <td className="p-5 text-gray-600">
                          {formatDate(store.created_at)}
                        </td>

                        {/* MERCHANT */}
                        <td className="p-5">
                          {!owner ? (
                            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                              No merchant record found.
                            </div>
                          ) : (
                            <div className="min-w-[360px]">

                              {/* Main merchant identity */}
                              <div className="rounded-2xl border border-gray-200 bg-white p-4">

                                <p className="font-semibold text-gray-900">
                                  {owner.full_name ||
                                    owner.name ||
                                    "Unnamed merchant"}
                                </p>

                                {owner.email && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {owner.email}
                                  </p>
                                )}

                                {owner.phone && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {owner.phone}
                                  </p>
                                )}

                                {owner.whatsapp && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    WhatsApp: {owner.whatsapp}
                                  </p>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenOwner(
                                      isOwnerOpen
                                        ? null
                                        : store.id
                                    )
                                  }
                                  className="mt-4 rounded-xl bg-[#D94680] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c73570]"
                                >
                                  {isOwnerOpen
                                    ? "Hide Merchant Details"
                                    : "View Full Merchant Data"}
                                </button>
                              </div>

                              {/* COMPLETE MERCHANT DATA */}
                              {isOwnerOpen && (
                                <div className="mt-3 space-y-3 rounded-2xl border border-pink-100 bg-pink-50/40 p-4">

                                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#D94680]">
                                    Complete Registration Data
                                  </p>

                                  {ownerEntries.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                      No additional merchant data found.
                                    </p>
                                  ) : (
                                    <div className="space-y-3">
                                      {ownerEntries.map(
                                        ([key, value]) => {
                                          const image =
                                            isImageKey(key) &&
                                            isImageUrl(value);

                                          return (
                                            <div
                                              key={key}
                                              className="rounded-xl border border-gray-200 bg-white p-3"
                                            >
                                              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                {labelFor(key)}
                                              </p>

                                              {image ? (
                                                <a
                                                  href={value}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="mt-2 block"
                                                >
                                                  <img
                                                    src={value}
                                                    alt={labelFor(key)}
                                                    className="max-h-48 w-full rounded-xl border border-gray-200 object-contain"
                                                  />

                                                  <p className="mt-2 text-xs font-semibold text-[#D94680]">
                                                    Open full image
                                                  </p>
                                                </a>
                                              ) : (
                                                <p className="mt-1 break-words whitespace-pre-wrap text-sm font-medium text-gray-900">
                                                  {formatValue(value)}
                                                </p>
                                              )}
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="p-5">
                          <Link
                            href={`/admin/stores/${store.id}`}
                            className="inline-flex rounded-xl bg-[#D94680] px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}