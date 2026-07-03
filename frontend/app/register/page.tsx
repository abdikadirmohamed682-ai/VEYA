export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">

      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl">

        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500 text-3xl font-bold text-white">
            V
          </div>
        </div>
<a
  href="/"
  className="mb-6 inline-flex items-center gap-2 text-gray-500 transition hover:text-pink-500"
>
  ← Back
</a>
        <h1 className="text-center text-4xl font-bold">
          Create your VEYA account
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Start building your online store today.
        </p>

        <input
          type="text"
          placeholder="Full Name"
          className="mt-8 w-full rounded-2xl border border-gray-300 px-5 py-4"
        />

        <input
          type="email"
          placeholder="Email"
          className="mt-5 w-full rounded-2xl border border-gray-300 px-5 py-4"
        />

        <input
          type="password"
          placeholder="Password"
          className="mt-5 w-full rounded-2xl border border-gray-300 px-5 py-4"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="mt-5 w-full rounded-2xl border border-gray-300 px-5 py-4"
        />

        <a
  href="/setup-store"
  className="mt-8 block w-full rounded-full bg-pink-500 py-4 text-center font-bold text-white transition hover:bg-pink-600"
>
  Create Account
</a>

        <p className="mt-6 text-center text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-pink-500 hover:underline"
          >
            Sign In
          </a>
        </p>

      </div>

    </main>
  );
}