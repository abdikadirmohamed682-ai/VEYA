"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passportImage, setPassportImage] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !fullName ||
      !email ||
      !phone ||
      !whatsapp ||
      !paymentNumber ||
      !password ||
      !confirmPassword
    ) {
      alert("Please complete all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Step 1: Create authentication user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert(`SignUp Error: ${signUpError.message}`);
      return;
    }

    if (!signUpData?.user?.id) {
      alert("Failed to create authentication user. No user ID returned.");
      return;
    }

    const userId = signUpData.user.id;

    // Step 2: Ensure session is established
    let session = signUpData.session;

    if (!session) {
      // If no session after signup, sign in immediately
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        alert(`SignIn Error: ${signInError.message}`);
        return;
      }

      session = signInData.session;
    }

    if (!session) {
      alert("Failed to establish authenticated session. Please try again.");
      return;
    }

    // Step 3: Verify session is valid
    const { data: sessionCheck, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionCheck?.session) {
      alert(`Session Verification Error: ${sessionError?.message || "No active session"}`);
      return;
    }

    // Step 4: Create user profile in database
    const { error: profileError } = await supabase.from("users").insert([
      {
        full_name: fullName,
        email: email,
        phone: phone,
        whatsapp: whatsapp,
        payment_number: paymentNumber,
        national_id: paymentNumber,
        passport_image: null,
        profile_image: null,
      },
    ]);

    if (profileError) {
      alert(`Profile Creation Error: ${profileError.message}`);
      return;
    }

    // Step 5: Redirect to Create Store
    router.push("/create-store");
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl p-10">

        <div className="text-center mb-10">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D94680] text-3xl font-bold text-white">
            V
          </div>

          <h1 className="mt-6 text-4xl font-bold">
            Create Your Account
          </h1>

          <p className="mt-3 text-gray-500">
            One account = One professional online store.
          </p>

        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-6"
        >          <div>

            <label className="mb-2 block font-semibold">
              Full Name
            </label>

            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4"
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
              className="w-full rounded-xl border border-gray-300 p-4"
            />

          </div>

          <div className="grid grid-cols-2 gap-6">

            <div>

              <label className="mb-2 block font-semibold">
                Phone Number
              </label>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-4"
              />

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                WhatsApp
              </label>

              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-4"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Payment Number / Bank Account
            </label>

            <input
              value={paymentNumber}
              onChange={(e) => setPaymentNumber(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              National ID / Passport
            </label>

            <input
              type="file"
              onChange={(e) =>
                setPassportImage(e.target.files?.[0] || null)
              }
              className="w-full rounded-xl border border-gray-300 p-4"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Personal Photo
            </label>

            <input
              type="file"
              onChange={(e) =>
                setProfileImage(e.target.files?.[0] || null)
              }
              className="w-full rounded-xl border border-gray-300 p-4"
            />

          </div>

          <div className="grid grid-cols-2 gap-6">

            <div>

              <label className="mb-2 block font-semibold">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-4"
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
                className="w-full rounded-xl border border-gray-300 p-4"
              />

            </div>

          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#D94680] py-4 text-lg font-bold text-white hover:opacity-90"
          >
            Continue
          </button>

        </form>

      </div>

    </main>
  );
}
        