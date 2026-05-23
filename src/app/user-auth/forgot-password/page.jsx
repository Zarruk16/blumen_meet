"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LandingBackground } from "@/components/layout/LandingBackground";
import Loader from "@/app/components/Loader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/saas/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <LandingBackground />
      {loading && <Loader />}
      <Link
        href="/user-auth"
        className="fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-300 backdrop-blur-xl transition hover:text-white sm:left-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl"
        >
          <h1 className="text-2xl font-semibold">Forgot password</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your email and we&apos;ll send a reset link if an account exists.
          </p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-violet-500/50"
          />
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
          >
            Send reset link
          </button>
        </form>
      </div>
    </div>
  );
}
