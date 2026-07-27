import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import BuyNowButton from "@/components/BuyNowButton";
import Image from "next/image";

interface Product {
  id: string;
  store_id: string;
  product_name: string;
  description: string | null;
  price: number;
  category: string;
  quantity: number;
  views: number | null;
  main_image_url: string | null;
  additional_image_urls: string[] | null;
}

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id: productId } = await params;

  const productResponse = await supabase
    .from("products")
    .select(
  "id, store_id, product_name, description, price, category, quantity, views, main_image_url, additional_image_urls"
)
      
    
    .eq("id", productId)
    .eq("status", "active")
    .single();

  const productData = productResponse.data as Product | null;
  const error = productResponse.error;

  if (error || !productData) {
    return notFound();
  }

  Promise.resolve(
    supabase
      .from("products")
      .update({
        views: (productData.views ?? 0) + 1,
      })
      .eq("id", productId)
      .eq("status", "active")
  )
    .then(() => {})
    .catch(() => {});

  const images = [
    productData.main_image_url,
    ...(productData.additional_image_urls || []),
  ].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-gray-900">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
            <div className="space-y-8">
              <div className="overflow-hidden rounded-[2.5rem] border border-gray-200 bg-gray-100">
                {images.length > 0 ? (
                  <Image
                    src={images[0]}
                    alt={productData.product_name}
                    width={800}
                    height={800}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-96 items-center justify-center text-3xl text-gray-300">
                    No Image
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-3xl bg-gray-100"
                    >
                      <Image
                        src={image}
                        alt={`${productData.product_name} ${index + 1}`}
                        width={300}
                        height={160}
                        className="h-40 w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2.5rem] border border-gray-200 bg-white p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-[#D94680]">
                {productData.category || "Product"}
              </p>

              <h1 className="mt-4 text-4xl font-bold text-gray-900">
                {productData.product_name}
              </h1>

              <div className="mt-4 flex items-center gap-4 text-gray-500">
                <span>{productData.views ?? 0} views</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>{productData.quantity} in stock</span>
              </div>

              <p className="mt-6 text-3xl font-bold text-[#D94680]">
                ${productData.price.toFixed(2)}
              </p>

              <p className="mt-6 leading-8 text-gray-600">
                {productData.description || "No description available."}
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-[#FCE7F3] p-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#D94680]">
                    Available
                  </p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {productData.quantity}
                  </p>
                </div>

                <div className="rounded-3xl bg-[#F8E3EF] p-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#D94680]">
                    Category
                  </p>
                  <p className="mt-3 text-3xl font-bold text-gray-900">
                    {productData.category || "General"}
                  </p>
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <AddToCartButton
                  product_id={productData.id}
                  store_id={productData.store_id}
                  title={productData.product_name}
                  price={productData.price}
                  image={productData.main_image_url || ""}
                />

                <BuyNowButton
                
  product_id={productData.id}
  store_id={productData.store_id}
  title={productData.product_name}
  price={productData.price}
  image={productData.main_image_url || ""}
/>
              
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}