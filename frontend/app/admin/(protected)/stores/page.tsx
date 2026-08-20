"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

interface Owner {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [owners, setOwners] = useState<Record<string, Owner>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
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

        const { data: visitorCounts, error: visitorCountsError } =
          await supabase
            .from("store_visitor_counts")
            .select("store_id, visitor_count");

        console.log("STORE VISITOR VIEW RESULT:", {
          visitorCounts,
          visitorCountsError,
        });

        if (visitorCountsError) {
          throw new Error(visitorCountsError.message);
        }

        const visitorCountMap = new Map<string, number>();

        (visitorCounts ?? []).forEach((item) => {
          visitorCountMap.set(item.store_id, Number(item.visitor_count) || 0);
        });

        console.log("STORE VISITOR COUNT MAP:", {
          entries: Array.from(visitorCountMap.entries()),
        });

        const storesList: Store[] = (storesData || []).map((store) => {
          const visitorCount = visitorCountMap.get(store.id) ?? 0;

          console.log("STORE VISITOR MATCH:", {
            storeId: store.id,
            storeName: store.store_name,
            visitorCount,
            matched: visitorCountMap.has(store.id),
          });

          return {
            ...(store as Store),
            visitorCount,
          };
        });

        setStores(storesList);

        if (storesList.length > 0) {
          const ownerIds = storesList.map((store) => store.user_id);

          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, full_name, email, phone, whatsapp")
            .in("id", ownerIds);

          if (usersError) {
            setError(usersError.message);
            return;
          }

          const ownerMap: Record<string, Owner> = {};

          (usersData || []).forEach((user) => {
            ownerMap[user.id] = {
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              phone: user.phone || "",
              whatsapp: user.whatsapp || "",
            };
          });

          setOwners(ownerMap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFC]">
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-500">Loading stores...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Stores</h1>
            <p className="mt-2 text-gray-500">
              View all stores and their owners.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-pink-100/40 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
              Admin
            </p>

            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              All stores
            </h2>
          </div>

          <div className="rounded-3xl bg-[#FCE7F3] px-5 py-4 text-sm font-semibold text-[#B91C7A]">
            {loading ? "Loading..." : `${stores.length} stores`}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {!error && stores.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow">
            <h2 className="text-2xl font-bold">No stores found</h2>
            <p className="mt-3 text-gray-500">
              There are no stores yet.
            </p>
          </div>
        )}

        {stores.length > 0 && (
          <div className="overflow-hidden rounded-3xl bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full border-collapse text-left">
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
                      Owner
                    </th>

                    <th className="p-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {stores.map((store) => {
                    const owner = owners[store.user_id];

                    return (
                      <tr
                        key={store.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-5">
                          {store.logo ? (
                            <img
                              src={store.logo}
                              alt={store.store_name}
                              className="h-14 w-14 rounded-2xl border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                              <span className="text-xs">No logo</span>
                            </div>
                          )}
                        </td>

                        <td className="p-5 font-semibold text-gray-900">
                          {store.store_name}
                        </td>

                        <td className="p-5 text-gray-600">
                          {store.store_type || "—"}
                        </td>

                        <td className="p-5 font-semibold text-gray-900">
                          {store.visitorCount === null
                            ? "—"
                            : `${store.visitorCount} Visitors`}
                        </td>

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

                        <td className="p-5 text-gray-600">
                          {formatDate(store.created_at)}
                        </td>

                        <td className="p-5">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-gray-900">
                              {owner?.full_name || "—"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {owner?.email || "—"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {owner?.phone || "—"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {owner?.whatsapp || "—"}
                            </p>
                          </div>
                        </td>

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