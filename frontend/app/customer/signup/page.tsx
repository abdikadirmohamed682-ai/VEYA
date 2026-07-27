"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CustomerSignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Read redirect param from current URL (client-side only)
  const redirect =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("redirect")
      : null;

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Step 1: Create auth user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert(signUpError.message);
      return;
    }

    if (!signUpData?.user?.id) {
      alert("Failed to create account. Please try again.");
      return;
    }

    const userId = signUpData.user.id;

    // Step 2: Ensure session is established
    let session = signUpData.session;

    if (!session) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        alert(signInError.message);
        return;
      }

      session = signInData.session;
    }

    if (!session) {
      alert("Failed to establish session. Please log in.");
      return;
    }

    // Step 3: Create customer record
    const { error: customerError } = await supabase.from("customers").insert([
      {
        id: userId,
        full_name: fullName,
        email,
        phone: phone || null,
      },
    ]);

    if (customerError) {
      alert(`Failed to create customer profile: ${customerError.message}`);
      return;
    }

    // Step 4: Redirect
    if (redirect) {
      router.replace(redirect);
    } else {
      router.replace("/");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFC] px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D94680] text-3xl font-bold text-white">
            V
          </div>
          <h1 className="mt-6 text-4xl font-bold">Create Account</h1>
          <p className="mt-2 text-gray-500">Sign up as a customer</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="mb-2 block font-semibold">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
            />
          </div>

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
            <label className="mb-2 block font-semibold">
              Phone <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 890"
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

          <div>
            <label className="mb-2 block font-semibold">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#D94680] py-4 text-lg font-bold text-white hover:opacity-90"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500">
          Already have an account?
          <Link
            href={
              redirect
                ? `/customer/login?redirect=${encodeURIComponent(redirect)}`
                : "/customer/login"
            }
            className="ml-2 font-semibold text-[#D94680]"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

