"use client";

import { useEffect, useState } from "react";
import { getLikeState, likeProduct, unlikeProduct } from "@/lib/likes";
import { supabase } from "@/lib/supabase";

export default function LikeButton({ productId }: { productId: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await getLikeState(productId);
        if (!active) return;
        setLiked(res.liked);
        setCount(res.count ?? 0);
      } catch (e) {
        // ignore
      }
    }
    load();
    const { data: authSub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    return () => {
      active = false;
      authSub.subscription.unsubscribe();
    };
  }, [productId]);

  async function toggle() {
    setLoading(true);
    try {
      if (liked) {
        await unlikeProduct(productId);
        setLiked(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        await likeProduct(productId);
        setLiked(true);
        setCount((c) => c + 1);
      }
    } catch (e) {
      // show an alert only on auth error
      if (e instanceof Error && e.message.includes("Authentication required")) {
        alert("Please log in to like products.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 transition hover:bg-gray-100"
      >
        <span className="text-2xl">{liked ? "♥" : "♡"}</span>
        <span className="text-sm text-gray-600">{count}</span>
      </button>
    </div>
  );
}
