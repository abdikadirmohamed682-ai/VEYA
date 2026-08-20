"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "abdikadirmohamed682@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      const userEmail = result.data.user?.email ?? "";
      if (userEmail !== ADMIN_EMAIL) {
        // Unauthorized admin account — sign out and deny access
        await supabase.auth.signOut();
        setError("Unauthorized admin account.");
        setLoading(false);
        return;
      }

      // Successful admin login
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
        <p className="mt-2 text-sm text-gray-500">Sign in with the authorized admin account.</p>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-[#D94680] py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
