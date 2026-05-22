"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";
import { useAuthGate } from "@/hooks/useAuthGate";

export function CTASection() {
  const { requireAuth } = useAuthGate();

  const goWorkspace = () => {
    requireAuth(
      () => document.querySelector("#workspace")?.scrollIntoView({ behavior: "smooth" }),
      { callbackPath: "/#workspace" }
    );
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-indigo-600/20" />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/30 blur-[80px]"
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          Ready to meet the future?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-6 max-w-xl text-lg text-zinc-300"
        >
          Start your next meeting in one click. No downloads. No friction. Just premium collaboration.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={goWorkspace}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-zinc-900 shadow-xl transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Free Meeting
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goWorkspace}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            <Building2 className="h-4 w-4" />
            Create Workspace
          </button>
        </motion.div>
      </div>
    </section>
  );
}
