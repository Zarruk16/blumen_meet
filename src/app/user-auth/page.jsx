"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Sparkles, Video } from "lucide-react";
import { LandingBackground } from "@/components/layout/LandingBackground";
import Loader from "../components/Loader";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AuthPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/auth/continue";

  useEffect(() => {
    localStorage.removeItem("hasShownWelcome");
  }, []);

  const handleLogin = async (provider) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentials = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) return;
      window.location.href = callbackUrl;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <LandingBackground />
      {isLoading && <Loader />}

      <Link
        href="/"
        className="fixed left-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-300 backdrop-blur-xl transition hover:text-white sm:left-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 xl:p-16"
        >
          <div className="flex items-center gap-2 mb-8">
            <Video className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-semibold">Blumen Meet</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Meetings that feel{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              premium
            </span>
          </h1>
          <p className="mt-6 text-lg text-zinc-400 max-w-md leading-relaxed">
            Sign in once to host calls, record to the cloud, and unlock AI summaries for your team.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["HD video", "AI notes", "Recordings"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="relative mt-12 aspect-[4/3] max-w-md overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <Image
              src="/images/meet_image.png"
              fill
              alt=""
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
          </div>
        </motion.div>

        <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 sm:p-10 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              Secure sign-in
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Continue with Google or GitHub. After login you can start meetings, view recordings,
              and use your workspace.
            </p>

            <form onSubmit={handleCredentials} className="mt-8 space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
              />
              <div className="text-right">
                <Link
                  href="/user-auth/forgot-password"
                  className="text-xs text-violet-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading || !password}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold disabled:opacity-50"
              >
                Sign in with email
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-950/80 px-2 text-zinc-500">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleLogin("google")}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleLogin("github")}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                <Github className="h-5 w-5" />
                Continue with GitHub
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-zinc-500">
              Reseller?{" "}
              <Link href="/saas/register" className="text-sky-400 hover:underline">
                Create reseller account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function UserAuthPage() {
  return (
    <Suspense fallback={<Loader />}>
      <AuthPageContent />
    </Suspense>
  );
}
