"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CustomerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Read redirect param from current URL (client-side only)
  const redirect =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect")
      : null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Verify this user is a customer
    const userId = data?.user?.id;
    if (userId) {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("id", userId)
        .single();

      if (customer) {
        // Customer found — redirect
        if (redirect) {
          router.replace(redirect);
        } else {
          router.replace("/");
        }
        return;
      }
    }

    // Not a customer — show error
    alert("This account is not registered as a customer. Please sign up first.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFC] px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D94680] text-3xl font-bold text-white">
            V
          </div>
          <h1 className="mt-6 text-4xl font-bold">Customer Login</h1>
          <p className="mt-2 text-gray-500">Sign in to your customer account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-2 block font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#D94680] py-4 text-lg font-bold text-white hover:opacity-90"
          >
            Login
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500">
          Don't have an account?
          <Link
            href={
              redirect
                ? `/customer/signup?redirect=${encodeURIComponent(redirect)}`
                : "/customer/signup"
            }
            className="ml-2 font-semibold text-[#D94680]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

