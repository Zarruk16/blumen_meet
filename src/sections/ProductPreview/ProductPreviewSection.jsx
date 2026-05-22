"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, Circle, Sparkles, Smile } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";

export function ProductPreviewSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Product"
          title="A meeting experience that feels alive"
          subtitle="Real controls, real layouts, real AI — not a mockup website. This is Blumen Meet in action."
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/10" />
          <div className="relative aspect-[16/10] min-h-[320px] bg-[#07070b] p-4 sm:p-6">
            {/* Top bar mock */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-xl">
              <div>
                <p className="text-sm font-semibold text-white">Team standup</p>
                <p className="text-[11px] text-white/50 font-mono tabular-nums">18:42 elapsed</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs text-white">
                  <Users className="h-3 w-3" /> 5
                </span>
                <span className="rounded-lg bg-red-600/80 px-2 py-1 text-[10px] font-bold text-white flex items-center gap-1">
                  <Circle className="h-1.5 w-1.5 fill-white" /> REC
                </span>
              </div>
            </div>

            {/* Video grid */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 flex-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-xl border bg-zinc-800/80 aspect-video ${
                    i === 0
                      ? "col-span-2 row-span-2 border-sky-400/40 ring-1 ring-sky-400/30"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex h-full items-center justify-center text-zinc-500 text-xs">
                    {i === 0 ? "Active speaker" : `P${i}`}
                  </div>
                </div>
              ))}
            </div>

            {/* Side panels floating */}
            <div className="absolute right-4 top-20 hidden w-48 rounded-2xl border border-white/10 bg-zinc-950/90 p-3 shadow-xl backdrop-blur-xl md:block">
              <p className="text-xs font-medium text-white flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Chat
              </p>
              <div className="mt-2 space-y-1 text-[10px] text-zinc-400">
                <p className="rounded bg-blue-500/20 px-2 py-1 text-blue-200">Looks great!</p>
                <p className="px-2">👍 from Jordan</p>
              </div>
            </div>

            <div className="absolute right-4 bottom-20 hidden w-44 rounded-2xl border border-violet-500/20 bg-zinc-950/90 p-3 shadow-xl backdrop-blur-xl lg:block">
              <p className="text-xs font-medium text-violet-300 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> AI Panel
              </p>
              <p className="mt-1 text-[10px] text-zinc-500">Summary generating…</p>
            </div>

            {/* Reactions */}
            <div className="absolute left-1/2 bottom-16 flex -translate-x-1/2 gap-1">
              {["👍", "🎉", "❤️"].map((e) => (
                <span
                  key={e}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm backdrop-blur-md"
                >
                  {e}
                </span>
              ))}
              <Smile className="h-8 w-8 p-1.5 rounded-full bg-white/10 text-white/60" />
            </div>

            {/* Bottom dock */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-xl">
              {["Mic", "Cam", "Share", "Chat", "Leave"].map((l) => (
                <div
                  key={l}
                  className={`h-9 min-w-[36px] rounded-full flex items-center justify-center text-[10px] font-medium ${
                    l === "Leave" ? "bg-red-600/90 text-white px-3" : "bg-white/10 text-white/80"
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile preview strip */}
          <div className="border-t border-white/10 bg-zinc-950/80 p-4 flex justify-center gap-4">
            <div className="w-24 rounded-2xl border border-white/10 bg-[#07070b] p-2 aspect-[9/16]">
              <div className="h-full rounded-lg bg-zinc-800/50 flex items-end p-1">
                <div className="w-full h-6 rounded-full bg-white/10" />
              </div>
              <p className="text-[9px] text-center text-zinc-500 mt-1">Mobile</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
