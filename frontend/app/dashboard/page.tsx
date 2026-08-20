"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import ViewStoreButton from "@/components/ViewStoreButton";

interface Store {
  id: string;
  store_name: string;
  store_type: string | null;
  slug: string;
}

interface Product {
  id: string;
  product_name: string;
  price: number;
  main_image_url: string | null;
  status: string;
  created_at: string;
}

interface OrderRecord {
  id: string;
  customer_name: string;
  phone: string;
  total: number;
  status: string;
  created_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  store_id: string | null;
  type: string;
  title: string;
  message: string | null;
  href: string | null;
  is_read: boolean;
  created_at: string;
}

interface WeeklyStat {
  key: string;
  label: string;
  revenue: number;
  orders: number;
}

type IconName =
  | "dashboard"
  | "products"
  | "add"
  | "orders"
  | "customers"
  | "settings"
  | "logout"
  | "menu"
  | "close"
  | "bell"
  | "sales"
  | "box"
  | "eye"
  | "more"
  | "check"
  | "trash"
  | "arrow"
  | "shopping"
  | "copy";

function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );

    case "products":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z" />
          <path d="m4.8 7.4 7.2 4 7.2-4" />
          <path d="M12 11.4V21" />
        </svg>
      );

    case "add":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 3.5h6" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      );

    case "customers":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5" />
          <path d="M16 5.5a3 3 0 0 1 0 5.8" />
          <path d="M17 15c2 .5 3.2 2.1 3.5 5" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.5v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.6-1H6v-2.5h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.5v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.6 1Z" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 5H5v14h5" />
          <path d="M14 8l4 4-4 4" />
          <path d="M8 12h10" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "sales":
      return (
        <svg {...common}>
          <path d="M6 3h12v18H6z" />
          <path d="M9 7h6M9 11h6M9 15h3" />
        </svg>
      );

    case "box":
      return (
        <svg {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4.5 7.7 7.5 4.2 7.5-4.2" />
          <path d="M12 11.9V21" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="12" r="1.2" fill="currentColor" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          <circle cx="19" cy="12" r="1.2" fill="currentColor" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "shopping":
      return (
        <svg {...common}>
          <path d="M6 7h12l1 13H5L6 7Z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </svg>
      );

    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );

    default:
      return null;
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const seconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);

  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const mobileNotificationRef =
    useRef<HTMLDivElement | null>(null);

  const desktopNotificationRef =
    useRef<HTMLDivElement | null>(null);

  const [moreOpen, setMoreOpen] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const storeLink =
    store?.slug && typeof window !== "undefined"
      ? `${window.location.origin}/store/${store.slug}`
      : "";

  const copyStoreLink = async () => {
    if (!storeLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(storeLink);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy store link error:", error);
    }
  };

  const getWeeklyLabels = (): WeeklyStat[] => {
    const now = new Date();

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);

      date.setDate(
        now.getDate() - (6 - index)
      );

      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),
        revenue: 0,
        orders: 0,
      };
    });
  };

  const loadNotifications = async (
    storeId: string
  ) => {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        "id, user_id, store_id, type, title, message, href, is_read, created_at"
      )
      .eq("store_id", storeId)
      .order("created_at", {
        ascending: false,
      })
      .limit(30);

    if (error) {
      console.error(
        "Notifications load error:",
        error
      );
      return;
    }

    setNotifications(
      (data || []) as Notification[]
    );
  };

  const openNotification = async (
    notification: Notification
  ) => {
    setNotificationsOpen(false);

    if (!notification.is_read) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                is_read: true,
              }
            : item
        )
      );

      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq("id", notification.id);

      if (error) {
        console.error(
          "Mark notification read error:",
          error
        );

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  is_read: false,
                }
              : item
          )
        );
      }
    }

    const target =
      notification.href &&
      notification.href.trim() !== ""
        ? notification.href.trim()
        : "/orders";

    if (target.startsWith("/")) {
      router.push(target);
    } else {
      router.push("/orders");
    }
  };

  const markAllNotificationsAsRead =
    async () => {
      if (
        !store?.id ||
        unreadCount === 0
      ) {
        return;
      }

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
        }))
      );

      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq("store_id", store.id)
        .eq("is_read", false);

      if (error) {
        console.error(
          "Mark all notifications error:",
          error
        );

        await loadNotifications(
          store.id
        );
      }
    };

  const deleteNotification = async (
    notificationId: string
  ) => {
    setNotifications((current) =>
      current.filter(
        (item) =>
          item.id !== notificationId
      )
    );

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.error(
        "Delete notification error:",
        error
      );

      if (store?.id) {
        await loadNotifications(
          store.id
        );
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      const clickedInsideMobile =
        mobileNotificationRef.current?.contains(
          target
        );

      const clickedInsideDesktop =
        desktopNotificationRef.current?.contains(
          target
        );

      if (
        !clickedInsideMobile &&
        !clickedInsideDesktop
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData =
      async () => {
        try {
          const {
            data,
            error: userError,
          } = await supabase.auth.getUser();

          if (
            userError ||
            !data?.user?.id
          ) {
            if (mounted) {
              setLoading(false);
            }

            return;
          }

          const userId =
            data.user.id;

          const {
            data: storeData,
            error: storeError,
          } = await supabase
            .from("stores")
            .select(
              "id, store_name, store_type, slug"
            )
            .eq(
              "user_id",
              userId
            )
            .maybeSingle();

          if (storeError) {
            setErrorMessage(
              storeError.message
            );
          }

          if (!storeData) {
            router.replace("/create-store");
            return;
          }

          const currentStore =
            storeData as Store;

          setStore(currentStore);

          await loadNotifications(
            currentStore.id
          );

          const [
            productsResponse,
            ordersResponse,
            visitorsResponse,
          ] = await Promise.all([
             supabase
               .from("products")
               .select(
                 "id, product_name, price, main_image_url, status, created_at"
               )
              .eq(
                "store_id",
                currentStore.id
              )
              .order(
                "created_at",
                {
                  ascending: false,
                }
              ),

            supabase
              .from("orders")
              .select(
                "id, customer_name, phone, total, status, created_at"
              )
              .eq(
                "store_id",
                currentStore.id
              )
              .order(
                "created_at",
                {
                  ascending: false,
                }
              ),
            supabase
              .from("store_visitor_counts")
              .select("visitor_count")
              .eq("store_id", currentStore.id)
              .single(),
          ]);

          if (
            productsResponse.error
          ) {
            setErrorMessage(
              productsResponse.error.message
            );
          }

          if (
            !productsResponse.error &&
            productsResponse.data
          ) {
            const allProducts =
              productsResponse.data as Product[];

            const activeProducts =
              allProducts.filter(
                (product) =>
                  product.status?.toLowerCase() ===
                  "active"
              );

            setProducts(
              allProducts.slice(0, 8)
            );

            setTopProducts(
              allProducts.slice(0, 5)
            );

            setProductCount(
              activeProducts.length
            );
          }

          if (visitorsResponse.error) {
            console.error("Store visitor count load error:", visitorsResponse.error);
            setErrorMessage("Unable to load store visitor statistics.");
          } else {
            setTotalVisitors(visitorsResponse.data?.visitor_count ?? 0);
          }
          if (
            !ordersResponse.error &&
            ordersResponse.data
          ) {
            const orders =
              ordersResponse.data as OrderRecord[];

            setTotalOrders(
              orders.length
            );

            const completedRevenue =
              orders
                .filter(
                  (order) =>
                    order.status?.toLowerCase() ===
                    "completed"
                )
                .reduce(
                  (sum, order) =>
                    sum +
                    Number(
                      order.total || 0
                    ),
                  0
                );

            setTotalSales(
              completedRevenue
            );

            const customers =
              new Set<string>();

            orders.forEach(
              (order) => {
                const key =
                  order.phone?.trim() ||
                  order.customer_name?.trim() ||
                  order.id;

                customers.add(key);
              }
            );

            setTotalCustomers(
              customers.size
            );

            const stats =
              getWeeklyLabels();

            orders.forEach(
              (order) => {
                const createdDate =
                  new Date(
                    order.created_at
                  );

                const key =
                  createdDate
                    .toISOString()
                    .slice(0, 10);

                const index =
                  stats.findIndex(
                    (item) =>
                      item.key ===
                      key
                  );

                if (index >= 0) {
                  stats[index]
                    .orders += 1;

                  if (
                    order.status?.toLowerCase() ===
                    "completed"
                  ) {
                    stats[index]
                      .revenue +=
                      Number(
                        order.total ||
                          0
                      );
                  }
                }
              }
            );

            setWeeklyStats(
              stats
            );
          }
        } catch (error) {
          console.error(
            "Dashboard error:",
            error
          );
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!store?.id) {
      return;
    }

    const channel =
      supabase
        .channel(
          `notifications-${store.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `store_id=eq.${store.id}`,
          },
          (payload) => {
            if (
              payload.eventType ===
              "INSERT"
            ) {
              const newNotification =
                payload.new as Notification;

              setNotifications(
                (current) => {
                  const exists =
                    current.some(
                      (item) =>
                        item.id ===
                        newNotification.id
                    );

                  if (exists) {
                    return current;
                  }

                  return [
                    newNotification,
                    ...current,
                  ].slice(0, 30);
                }
              );
            }

            if (
              payload.eventType ===
              "UPDATE"
            ) {
              const updated =
                payload.new as Notification;

              setNotifications(
                (current) =>
                  current.map(
                    (item) =>
                      item.id ===
                      updated.id
                        ? updated
                        : item
                  )
              );
            }

            if (
              payload.eventType ===
              "DELETE"
            ) {
              const deleted =
                payload.old as Notification;

              setNotifications(
                (current) =>
                  current.filter(
                    (item) =>
                      item.id !==
                      deleted.id
                  )
              );
            }
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [store?.id]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#D94680]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const maxRevenue =
    Math.max(
      ...weeklyStats.map(
        (item) =>
          item.revenue
      ),
      1
    );

  const maxOrders =
    Math.max(
      ...weeklyStats.map(
        (item) =>
          item.orders
      ),
      1
    );

  const navigationItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "dashboard" as IconName,
    },
    {
      label: "Products",
      href: "/products",
      icon: "products" as IconName,
    },
    {
      label: "Add Product",
      href: "/products/new",
      icon: "add" as IconName,
    },
    {
      label: "Orders",
      href: "/orders",
      icon: "orders" as IconName,
    },
    {
      label: "Customers",
      href: "/customers",
      icon: "customers" as IconName,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: "settings" as IconName,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F8F8FA]">

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[230px] border-r border-gray-200 bg-white lg:block">
        <div className="flex h-full flex-col">

          <div className="flex h-[76px] items-center border-b border-gray-100 px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#D94680] text-sm font-bold text-white">
                V
              </span>

              <span className="text-[17px] font-bold">
                VEYA
              </span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="space-y-1">
              {navigationItems.map(
                (item) => {
                  const active =
                    item.href ===
                    "/dashboard";

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      className={`flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium ${
                        active
                          ? "bg-[#FCE7F0] text-[#C72F6E]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        name={
                          item.icon
                        }
                        size={18}
                      />

                      <span>
                        {
                          item.label
                        }
                      </span>
                    </Link>
                  );
                }
              )}
            </div>
          </nav>

          <div className="border-t border-gray-100 p-4">
            <button
              type="button"
              onClick={logout}
              className="flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <Icon
                name="logout"
                size={18}
              />

              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="w-full min-w-0 lg:ml-[230px] lg:w-[calc(100%-230px)]">

        <header className="sticky top-0 z-30 w-full border-b border-gray-100 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-[64px] items-center justify-between px-4">

            <div className="w-10" />

            <Link
              href="/dashboard"
              className="flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#D94680] text-xs font-bold text-white">
                V
              </span>

              <span className="text-[16px] font-bold">
                VEYA
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <ViewStoreButton />

              <div
                ref={
                  mobileNotificationRef
                }
                className="relative"
              >
              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (value) =>
                      !value
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-[10px] text-gray-700 hover:bg-gray-50"
                aria-label="Notifications"
              >
                <Icon
                  name="bell"
                  size={19}
                />

                {unreadCount >
                  0 && (
                  <span className="absolute right-1 top-1 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#D94680] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadCount >
                    99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <NotificationPanel
                  notifications={
                    notifications
                  }
                  unreadCount={
                    unreadCount
                  }
                  onRead={
                    openNotification
                  }
                  onReadAll={
                    markAllNotificationsAsRead
                  }
                  onDelete={
                    deleteNotification
                  }
                  onViewOrders={() => {
                    setNotificationsOpen(
                      false
                    );
                    router.push(
                      "/orders"
                    );
                  }}
                />
              )}
              </div>
            </div>
          </div>
        </header>

        <header className="hidden h-[76px] items-center justify-between border-b border-gray-200 bg-white px-8 lg:flex">

          <div>
            <h1 className="text-[24px] font-bold">
              Dashboard
            </h1>

            <p className="mt-1 text-[13px] text-gray-500">
              Welcome back to{" "}
              {store?.store_name ||
                "your store"}
              .
            </p>
          </div>

          <div className="flex items-center gap-4">

            <ViewStoreButton />

            <div
              ref={
                desktopNotificationRef
              }
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (value) =>
                      !value
                  )
                }
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-50"
                aria-label="Notifications"
              >
                <Icon
                  name="bell"
                  size={18}
                />

                {unreadCount >
                  0 && (
                  <span className="absolute right-0 top-0 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#D94680] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadCount >
                    99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <NotificationPanel
                  notifications={
                    notifications
                  }
                  unreadCount={
                    unreadCount
                  }
                  onRead={
                    openNotification
                  }
                  onReadAll={
                    markAllNotificationsAsRead
                  }
                  onDelete={
                    deleteNotification
                  }
                  onViewOrders={() => {
                    setNotificationsOpen(
                      false
                    );
                    router.push(
                      "/orders"
                    );
                  }}
                />
              )}
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-white">
              {store?.store_name
                ?.charAt(0)
                ?.toUpperCase() ||
                "V"}
            </div>
          </div>
        </header>

        <div className="w-full min-w-0 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">

          {errorMessage && (
            <p className="mb-5 rounded-[14px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="mb-5 lg:hidden">
            <h1 className="text-[25px] font-bold tracking-tight">
              Dashboard
            </h1>

            <p className="mt-1 truncate text-[13px] text-gray-500">
              Welcome back to{" "}
              {store?.store_name ||
                "your store"}
              .
            </p>
          </div>

          {/* STORE LINK */}

          {storeLink && (
            <div className="mb-7 rounded-[18px] border border-gray-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900">
                    Store Link
                  </p>

                  <p className="mt-1 truncate text-[12px] text-gray-500">
                    {storeLink}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyStoreLink}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#D94680] px-4 text-[12px] font-semibold text-white transition hover:bg-[#C72F6E]"
                >
                  <Icon
                    name={
                      copied
                        ? "check"
                        : "copy"
                    }
                    size={15}
                  />

                  {copied
                    ? "Copied"
                    : "Copy"}
                </button>
              </div>
            </div>
          )}

          <div
            className={`mb-7 grid gap-4 ${
              store?.store_type ===
              "digital"
                ? "lg:grid-cols-4"
                : "lg:grid-cols-5"
            }`}
          >

            <div className="rounded-[18px] bg-[#D94680] p-5 text-white">
              <p className="text-[13px] text-white/80">
                Total Sales
              </p>

              <p className="mt-2 text-[27px] font-bold">
                {formatCurrency(
                  totalSales
                )}
              </p>

              <p className="mt-1 text-[11px] text-white/70">
                Completed sales
              </p>
            </div>

            <StatCard
              label="Orders"
              value={
                totalOrders
              }
              icon="orders"
            />

            <StatCard
              label="Customers"
              value={
                totalCustomers
              }
              icon="customers"
            />

            <StatCard
              label="Active Products"
              value={
                productCount
              }
              icon="box"
            />

            <StatCard
              label="Store Visitors"
              value={totalVisitors === null ? "—" : totalVisitors.toLocaleString()}
              icon="eye"
            />
          </div>

          <div className="mb-7 grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">

            <div className="rounded-[20px] border border-gray-200 bg-white p-5 sm:p-6">

              <div className="flex items-start justify-between gap-3">

                <div>
                  <p className="text-[13px] font-semibold">
                    Revenue Trend
                  </p>

                  <h2 className="mt-1 text-[21px] font-bold">
                    Last 7 days
                  </h2>

                  <p className="mt-1 text-[13px] text-gray-500">
                    Revenue and order volume.
                  </p>
                </div>

                <span className="rounded-full bg-[#FCE7F0] px-3 py-1.5 text-[11px] font-semibold text-[#C72F6E]">
                  {weeklyStats.reduce(
                    (sum, item) =>
                      sum +
                      item.orders,
                    0
                  )}{" "}
                  orders
                </span>
              </div>

              <div className="mt-7 space-y-4">

                {weeklyStats.map(
                  (stat) => (
                    <div
                      key={
                        stat.key
                      }
                    >

                      <div className="mb-1.5 flex justify-between text-[11px] text-gray-500">

                        <span>
                          {
                            stat.label
                          }
                        </span>

                        <span>
                          {formatCurrency(
                            stat.revenue
                          )}
                        </span>

                      </div>

                      <div className="grid grid-cols-2 gap-2">

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#D94680]"
                            style={{
                              width: `${Math.round(
                                (stat.revenue /
                                  maxRevenue) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-[#2563EB]"
                            style={{
                              width: `${Math.round(
                                (stat.orders /
                                  maxOrders) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>

                      </div>
                    </div>
                  )
                )}

              </div>

              <div className="mt-6 flex gap-5 text-[11px] text-gray-500">

                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D94680]" />
                  Revenue
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                  Orders
                </span>

              </div>
            </div>

            {store?.store_type !==
              "digital" && (
              <div className="rounded-[20px] border border-gray-200 bg-white p-6">

                <p className="text-[13px] font-semibold">
                  Top Products
                </p>

                <h2 className="mt-1 text-[21px] font-bold">
                  Most viewed
                </h2>

                <div className="mt-6 space-y-3">

                  {topProducts.length >
                  0 ? (
                    topProducts.map(
                      (
                        product,
                        index
                      ) => (
                        <div
                          key={
                            product.id
                          }
                          className="flex items-center gap-3 rounded-[14px] border border-gray-100 p-3"
                        >

                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-gray-100">

                            {product.main_image_url && (
                              <img
                                src={
                                  product.main_image_url
                                }
                                alt={
                                  product.product_name
                                }
                                className="h-full w-full object-cover"
                              />
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-[12px] font-semibold">
                              {
                                product.product_name
                              }
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-[11px] font-semibold">
                              #
                              {index +
                                1}
                            </p>

                            <p className="mt-1 text-[11px] text-[#D94680]">
                              $
                              {product.price.toFixed(
                                2
                              )}
                            </p>

                          </div>

                        </div>
                      )
                    )
                  ) : (
                    <div className="py-8 text-center text-sm text-gray-400">
                      No products available.
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          <section>

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-[20px] font-bold">
                Featured Products
              </h2>

              <Link
                href="/products"
                className="text-[13px] font-semibold text-[#D94680]"
              >
                View All
              </Link>
            </div>

            {products.length >
            0 ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">

                {products
                  .slice(0, 4)
                  .map(
                    (product) => (
                      <div
                        key={
                          product.id
                        }
                        className="overflow-hidden rounded-[16px] border border-gray-200 bg-white"
                      >

                        <div className="aspect-square bg-gray-100">

                          {product.main_image_url && (
                            <Image
                              src={
                                product.main_image_url
                              }
                              alt={
                                product.product_name
                              }
                              width={
                                400
                              }
                              height={
                                400
                              }
                              className="h-full w-full object-cover"
                            />
                          )}

                        </div>

                        <div className="p-3.5">

                          <h3 className="truncate text-[13px] font-semibold">
                            {
                              product.product_name
                            }
                          </h3>

                          <p className="mt-1.5 text-[13px] font-bold text-[#D94680]">
                            $
                            {product.price.toFixed(
                              2
                            )}
                          </p>

                        </div>
                      </div>
                    )
                  )}

              </div>
            ) : (
              <div className="rounded-[18px] border border-gray-200 bg-white p-10 text-center">

                <p className="mb-4 text-sm text-gray-500">
                  No products yet.
                </p>

                <Link
                  href="/products/new"
                  className="inline-flex rounded-[10px] bg-[#D94680] px-5 py-3 text-sm font-semibold text-white"
                >
                  Create Your First Product
                </Link>

              </div>
            )}

          </section>

          {products.length >
            4 && (
            <section className="mt-8">

              <h2 className="mb-5 text-[20px] font-bold">
                Recent Products
              </h2>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">

                {products
                  .slice(4, 8)
                  .map(
                    (product) => (
                      <div
                        key={
                          product.id
                        }
                        className="overflow-hidden rounded-[16px] border border-gray-200 bg-white"
                      >

                        <div className="aspect-square bg-gray-100">

                          {product.main_image_url && (
                            <Image
                              src={
                                product.main_image_url
                              }
                              alt={
                                product.product_name
                              }
                              width={
                                400
                              }
                              height={
                                400
                              }
                              className="h-full w-full object-cover"
                            />
                          )}

                        </div>

                        <div className="p-3.5">

                          <h3 className="truncate text-[13px] font-semibold">
                            {
                              product.product_name
                            }
                          </h3>

                          <p className="mt-1.5 text-[13px] font-bold text-[#D94680]">
                            $
                            {product.price.toFixed(
                              2
                            )}
                          </p>

                        </div>
                      </div>
                    )
                  )}

              </div>
            </section>
          )}

        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">

          <div className="mx-auto flex w-full max-w-[520px] items-center justify-between">

            <Link
              href="/dashboard"
              className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[#D94680]"
            >
              <Icon
                name="dashboard"
                size={19}
              />

              <span className="text-[10px] font-semibold">
                Dashboard
              </span>
            </Link>

            <Link
              href="/products"
              className="flex min-w-0 flex-1 flex-col items-center gap-1 text-gray-500"
            >
              <Icon
                name="products"
                size={19}
              />

              <span className="text-[10px]">
                Products
              </span>
            </Link>

            <Link
              href="/products/new"
              className="flex min-w-0 flex-1 flex-col items-center gap-1 text-gray-500"
            >
              <span className="flex h-10 w-10 -translate-y-3 items-center justify-center rounded-full bg-[#D94680] text-white shadow-lg">

                <Icon
                  name="add"
                  size={21}
                />

              </span>

              <span className="-mt-2 text-[10px]">
                Add
              </span>
            </Link>

            <Link
              href="/orders"
              className="flex min-w-0 flex-1 flex-col items-center gap-1 text-gray-500"
            >
              <Icon
                name="orders"
                size={19}
              />

              <span className="text-[10px]">
                Orders
              </span>
            </Link>

            <button
              type="button"
              onClick={() =>
                setMoreOpen(true)
              }
              className="flex min-w-0 flex-1 flex-col items-center gap-1 text-gray-500"
            >
              <Icon
                name="more"
                size={19}
              />

              <span className="text-[10px]">
                More
              </span>
            </button>

          </div>
        </nav>

        {moreOpen && (
          <div
            className="fixed inset-0 z-[100] lg:hidden"
            onClick={() =>
              setMoreOpen(false)
            }
          >

            <div className="absolute inset-0 bg-black/30" />

            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-[26px] bg-white px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-4 shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-gray-200" />

              <div className="mb-5 flex items-center gap-3">

                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#D94680] text-sm font-bold text-white">
                  V
                </span>

                <span className="font-bold">
                  VEYA
                </span>

              </div>

              <div className="space-y-1">

                <Link
                  href="/customers"
                  onClick={() =>
                    setMoreOpen(
                      false
                    )
                  }
                  className="flex h-12 items-center gap-4 rounded-[12px] px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Icon
                    name="customers"
                    size={19}
                  />

                  Customers
                </Link>

                <Link
                  href="/settings"
                  onClick={() =>
                    setMoreOpen(
                      false
                    )
                  }
                  className="flex h-12 items-center gap-4 rounded-[12px] px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Icon
                    name="settings"
                    size={19}
                  />

                  Settings
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="flex h-12 w-full items-center gap-4 rounded-[12px] px-4 text-left text-sm font-medium text-[#C72F6E] hover:bg-[#FFF1F5]"
                >
                  <Icon
                    name="logout"
                    size={19}
                  />

                  Logout
                </button>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: IconName;
}) {
  return (
    <div className="rounded-[18px] border border-gray-200 bg-white p-5">

      <div className="flex items-center justify-between gap-3">

        <p className="text-[13px] text-gray-500">
          {label}
        </p>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gray-50 text-gray-600">

          <Icon
            name={icon}
            size={18}
          />

        </span>
      </div>

      <p className="mt-3 truncate text-[26px] font-bold">
        {value}
      </p>

    </div>
  );
}

function NotificationPanel({
  notifications,
  unreadCount,
  onRead,
  onReadAll,
  onDelete,
  onViewOrders,
}: {
  notifications: Notification[];
  unreadCount: number;
  onRead: (
    notification: Notification
  ) => void;
  onReadAll: () => void;
  onDelete: (
    notificationId: string
  ) => void;
  onViewOrders: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-[48px] z-[200] w-[calc(100vw-32px)] max-w-[390px] overflow-hidden rounded-[18px] border border-gray-200 bg-white shadow-2xl"
      onMouseDown={(event) =>
        event.stopPropagation()
      }
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">

        <div>

          <h3 className="text-[15px] font-bold">
            Notifications
          </h3>

          <p className="mt-0.5 text-[11px] text-gray-500">
            {unreadCount >
            0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>

        </div>

        {unreadCount >
          0 && (
          <button
            type="button"
            onClick={
              onReadAll
            }
            className="text-[11px] font-semibold text-[#D94680]"
          >
            Mark all read
          </button>
        )}

      </div>

      <div className="max-h-[420px] overflow-y-auto">

        {notifications.length ===
        0 ? (
          <div className="px-5 py-12 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">

              <Icon
                name="bell"
                size={21}
              />

            </div>

            <p className="mt-3 text-sm font-semibold text-gray-700">
              No notifications
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
              New store activity will appear here.
            </p>

          </div>
        ) : (
          notifications.map(
            (notification) => (
              <div
                key={
                  notification.id
                }
                className={`group relative border-b border-gray-100 px-4 py-3.5 transition ${
                  notification.is_read
                    ? "bg-white"
                    : "bg-[#FFF7FA]"
                }`}
              >

                <button
                  type="button"
                  onClick={() =>
                    onRead(
                      notification
                    )
                  }
                  className="flex w-full cursor-pointer gap-3 pr-7 text-left"
                >

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                      notification.is_read
                        ? "bg-gray-100 text-gray-500"
                        : "bg-[#FCE7F0] text-[#C72F6E]"
                    }`}
                  >

                    <Icon
                      name={
                        notification.type ===
                          "new_order" ||
                        notification.type ===
                          "order"
                          ? "shopping"
                          : "bell"
                      }
                      size={17}
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-2">

                      <p
                        className={`text-[12px] ${
                          notification.is_read
                            ? "font-medium text-gray-700"
                            : "font-bold text-gray-900"
                        }`}
                      >
                        {
                          notification.title
                        }
                      </p>

                      {!notification.is_read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D94680]" />
                      )}

                    </div>

                    {notification.message && (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-gray-500">
                        {
                          notification.message
                        }
                      </p>
                    )}

                    <p className="mt-1.5 text-[10px] text-gray-400">
                      {formatTime(
                        notification.created_at
                      )}
                    </p>

                    {notification.href &&
                      (
                        notification.type ===
                          "new_order" ||
                        notification.type ===
                          "order"
                      ) && (
                        <p className="mt-1 text-[10px] font-semibold text-[#D94680]">
                          Open order →
                        </p>
                      )}

                  </div>
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    onDelete(
                      notification.id
                    );
                  }}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-300 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
                  aria-label="Delete notification"
                >
                  <Icon
                    name="trash"
                    size={14}
                  />
                </button>

              </div>
            )
          )
        )}

      </div>

      {notifications.length >
        0 && (
        <div className="border-t border-gray-100 p-3">

          <button
            type="button"
            onClick={
              onViewOrders
            }
            className="flex h-9 w-full items-center justify-center gap-2 rounded-[9px] bg-gray-50 text-[11px] font-semibold text-gray-700 hover:bg-gray-100"
          >
            View Orders

            <Icon
              name="arrow"
              size={13}
            />
          </button>

        </div>
      )}

    </div>
  );
}