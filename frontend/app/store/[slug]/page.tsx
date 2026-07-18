import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import StorefrontClient from "@/components/StorefrontClient";

interface Store {
  id: string;
  store_name: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  slug: string;
}

interface Product {
  id: string;
  product_name: string;
  description: string | null;
  price: number;
  category: string;
  main_image_url: string | null;
  status: string;
  is_featured?: boolean | null;
  views?: number | null;
}

interface StorePageProps {
  params: {
    slug: string;
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const slug = params.slug;

  const storeResponse = await supabase
    .from("stores")
    .select("id, store_name, description, logo, banner, slug")
    .eq("slug", slug)
    .single();

  const storeData = storeResponse.data as Store | null;
  const storeError = storeResponse.error;

  if (storeError || !storeData) {
    return notFound();
  }

  const productsResponse = await supabase
    .from("products")
    .select(
      "id, product_name, description, price, category, main_image_url, status, is_featured, views"
    )
    .eq("store_id", storeData.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const products = (productsResponse.data as Product[]) || [];

  return (
    <StorefrontClient
      storeName={storeData.store_name}
      storeDescription={storeData.description}
      storeLogo={storeData.logo}
      storeBanner={storeData.banner}
      storeSlug={storeData.slug}
      products={products}
    />
  );
}
