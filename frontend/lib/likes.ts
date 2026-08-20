import { supabase } from "@/lib/supabase";

export async function getLikeState(productId: string) {
  // Returns { liked: boolean, count: number }
  const { data: sessionData } = await supabase.auth.getSession();
  const customerId = sessionData?.session?.user?.id ?? null;

  const likedRowResp = customerId
    ? await supabase
        .from("product_likes")
        .select("id")
        .eq("product_id", productId)
        .eq("customer_id", customerId)
        .maybeSingle()
    : { data: null };

  const countResp = await supabase
    .from("product_likes")
    .select("product_id", { count: "exact", head: true })
    .eq("product_id", productId);

  const liked = !!likedRowResp.data?.id;
  const count = countResp.count ?? 0;
  return { liked, count };
}

export async function likeProduct(productId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Authentication required");
  const customerId = session.user.id;

  const { error } = await supabase.from("product_likes").insert({ product_id: productId, customer_id: customerId });
  if (error) throw error;
}

export async function unlikeProduct(productId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Authentication required");
  const customerId = session.user.id;

  const { error } = await supabase
    .from("product_likes")
    .delete()
    .eq("product_id", productId)
    .eq("customer_id", customerId);
  if (error) throw error;
}
