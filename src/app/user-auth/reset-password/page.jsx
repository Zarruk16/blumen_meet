"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LandingBackground } from "@/components/layout/LandingBackground";
import Loader from "@/app/components/Loader";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/saas/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      router.push("/user-auth?reset=1");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <p className="text-sm text-red-400">
        Invalid reset link.{" "}
        <Link href="/user-auth/forgot-password" className="text-violet-400 underline">
          Request a new one
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl">
      <h1 className="text-2xl font-semibold">Set new password</h1>
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-violet-500/50"
      />
      <input
        type="password"
        required
        minLength={8}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm password"
        className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-violet-500/50"
      />
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-medium hover:bg-violet-500 disabled:opacity-50"
      >
        Update password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <LandingBackground />
      <Link
        href="/user-auth"
        className="fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-300 backdrop-blur-xl transition hover:text-white sm:left-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <Suspense fallback={<Loader />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
