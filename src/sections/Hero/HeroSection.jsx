"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Shield, Zap, Sparkles } from "lucide-react";
import { MeetingDashboardMockup } from "./MeetingDashboardMockup";
import { useAuthGate } from "@/hooks/useAuthGate";

const pills = ["HD Video", "AI Summaries", "Cloud Recording", "End-to-end encrypted"];

export function HeroSection() {
  const { isAuthenticated, requireAuth } = useAuthGate();

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const onStartMeeting = () => {
    requireAuth(() => scrollTo("#workspace"), { callbackPath: "/#workspace" });
  };

  const onJoinMeeting = () => {
    scrollTo("#workspace");
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Now with AI meeting intelligence
            </motion.div>

            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[3.5rem]">
              AI-powered meetings{" "}
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                built for modern teams
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg lg:mx-0">
              Host cinematic video calls, record to the cloud, and turn every conversation into
              actionable insights — all in one premium workspace.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button
                type="button"
                onClick={onStartMeeting}
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/25 transition hover:scale-[1.02] hover:shadow-violet-500/40 active:scale-[0.98]"
              >
                {isAuthenticated ? "Start Meeting" : "Sign in to start"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={onJoinMeeting}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="h-4 w-4" />
                Join Meeting
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 lg:justify-start">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Enterprise-grade security
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                ZarrukCode
              </span>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
              {pills.map((pill, i) => (
                <motion.span
                  key={pill}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400"
                >
                  {pill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative lg:pl-4"
          >
            <MeetingDashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
