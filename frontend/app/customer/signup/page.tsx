"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function CustomerSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  const safeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//")
    ? redirect
    : "/";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert(signUpError.message);
      return;
    }

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      alert(loginError.message);
      return;
    }

    if (!loginData.user) {
      alert("Login failed.");
      return;
    }

    const { error: customerError } = await supabase
      .from("customers")
      .upsert({
        id: loginData.user.id,
        full_name: fullName,
        email,
        phone: phone || null,
      });

    if (customerError) {
      alert(customerError.message);
      return;
    }
        if (safeRedirect !== "/") {
      router.replace(safeRedirect);
    } else {
      router.replace("/");
    }

    router.refresh();
  }
    return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFC] px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D94680] text-3xl font-bold text-white">
            V
          </div>

          <h1 className="mt-6 text-4xl font-bold">
            Create Account
          </h1>

          <p className="mt-2 text-gray-500">
            Sign up as a customer
          </p>
        </div>

        <div className="mb-6 flex justify-end">
          <button aria-label="Home"
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></svg>
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">

          <div>
            <label className="mb-2 block font-semibold">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Email
            </label>

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
            <label className="mb-2 block font-semibold">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-[#D94680]"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Confirm Password
            </label>

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
              safeRedirect !== "/"
                ? `/customer/login?redirect=${encodeURIComponent(safeRedirect)}`
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

export default function CustomerSignupPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#FAFAFC] px-6">
          <p className="text-gray-500">Loading...</p>
        </main>
      }
    >
      <CustomerSignupForm />
    </Suspense>
  );
}
