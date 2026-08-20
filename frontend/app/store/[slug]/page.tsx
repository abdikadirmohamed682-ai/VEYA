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
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: storeData, error: storeError } = await supabase
    .from("stores")
    .select("id, store_name, description, logo, banner, slug")
    .eq("slug", slug)
    .single();

  if (storeError || !storeData) {
    notFound();
  }

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, product_name, description, price, category, main_image_url, status, is_featured"
    )
    .eq("store_id", storeData.id)
    .eq("status", "active");

  return (
    <StorefrontClient
      storeId={storeData.id}
      storeName={storeData.store_name}
      storeDescription={storeData.description}
      storeLogo={storeData.logo}
      storeBanner={storeData.banner}
      storeSlug={storeData.slug}
      products={products ?? []}
    />
  );
}