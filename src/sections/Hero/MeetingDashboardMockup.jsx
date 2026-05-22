"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Video,
  MessageSquare,
  Users,
  Circle,
  Sparkles,
  MonitorUp,
  PhoneOff,
} from "lucide-react";

const float = (delay = 0) => ({
  y: [0, -8, 0],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut", delay },
});

export function MeetingDashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg aspect-[4/5] sm:aspect-square lg:max-w-xl">
      <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-transparent blur-2xl" />

      {/* Main meeting frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute inset-0 rounded-3xl border border-white/10 bg-zinc-900/60 p-3 shadow-2xl backdrop-blur-xl sm:p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-medium text-white/90">Product sync</span>
          </div>
          <span className="font-mono text-[10px] text-white/50 tabular-nums">24:18</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <motion.div
            animate={float(0)}
            className="relative col-span-2 aspect-video overflow-hidden rounded-2xl border-2 border-sky-400/50 bg-zinc-800/80 shadow-[0_0_40px_rgba(56,189,248,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-600 text-lg font-bold text-white">
                A
              </div>
            </div>
            <div className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
              Alex · speaking
            </div>
            <div className="absolute right-2 top-2 flex gap-1">
              <span className="rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white flex items-center gap-0.5">
                <Circle className="h-1.5 w-1.5 fill-white" /> REC
              </span>
            </div>
          </motion.div>

          {["J", "M"].map((initial, i) => (
            <motion.div
              key={initial}
              animate={float(0.3 + i * 0.2)}
              className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-zinc-800/60"
            >
              <div className="flex h-full items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-600 text-xs font-semibold text-white">
                  {initial}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Control dock */}
        <motion.div
          animate={float(0.5)}
          className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-white/10 bg-black/50 px-2 py-1.5 shadow-xl backdrop-blur-xl"
        >
          {[Mic, Video, MonitorUp, MessageSquare, Users].map((Icon, i) => (
            <div
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80"
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/90 text-white">
            <PhoneOff className="h-3.5 w-3.5" />
          </div>
        </motion.div>
      </motion.div>

      {/* AI summary popup */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        animate={{ y: [0, -8, 0] }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
          opacity: { duration: 0.4, delay: 0.5 },
        }}
        className="absolute -right-2 top-[18%] w-44 rounded-2xl border border-violet-500/30 bg-zinc-950/90 p-3 shadow-2xl backdrop-blur-xl sm:-right-6 sm:w-48"
      >
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-300">
          <Sparkles className="h-3 w-3" />
          AI Summary
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-zinc-400">
          Key decisions captured. 3 action items assigned.
        </p>
        <div className="mt-2 space-y-1">
          {["Ship v2 beta", "Review designs"].map((t) => (
            <div key={t} className="rounded-lg bg-white/5 px-2 py-1 text-[9px] text-zinc-300">
              ✓ {t}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chat popup */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        animate={{ y: [0, -6, 0] }}
        transition={{
          y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
          opacity: { duration: 0.4, delay: 0.65 },
        }}
        className="absolute -left-2 bottom-[28%] w-40 rounded-2xl border border-white/10 bg-zinc-950/90 p-3 shadow-2xl backdrop-blur-xl sm:-left-8 sm:w-44"
      >
        <p className="text-[10px] font-medium text-white/80">Live chat</p>
        <div className="mt-2 space-y-1.5">
          <div className="rounded-lg bg-blue-500/20 px-2 py-1 text-[9px] text-blue-200">Great demo!</div>
          <div className="rounded-lg bg-white/5 px-2 py-1 text-[9px] text-zinc-400">Recording saved ✓</div>
        </div>
      </motion.div>

      {/* Analytics card */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute bottom-8 -left-4 hidden rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2 shadow-xl backdrop-blur-xl sm:block"
      >
        <p className="text-[9px] text-zinc-500">Participants</p>
        <p className="text-lg font-bold text-white tabular-nums">4</p>
      </motion.div>
    </div>
  );
}
