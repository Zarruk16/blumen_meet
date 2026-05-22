"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Play, Sparkles, Download, Film } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import HostRecordings from "@/app/components/HostRecordings";
import { getLoginUrl } from "@/lib/authRedirect";

const demoRecordings = [
  { title: "Product roadmap review", duration: "42:18", date: "Today", hasAi: true },
  { title: "Design critique", duration: "28:05", date: "Yesterday", hasAi: true },
  { title: "Investor update", duration: "55:12", date: "Mar 18", hasAi: false },
];

function DemoRecordingCard({ title, duration, date, hasAi, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition hover:border-violet-500/25 hover:shadow-[0_0_32px_rgba(139,92,246,0.1)]"
    >
      <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-950 p-4">
        <div className="flex h-full items-end gap-0.5">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-violet-500/40"
              style={{ height: `${20 + Math.sin(i * 0.5) * 30}%` }}
            />
          ))}
        </div>
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 bg-black/40"
          aria-label="Play"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-900 shadow-xl">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </span>
        </button>
        {hasAi && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 text-[10px] font-medium text-violet-300">
            <Sparkles className="h-3 w-3" />
            AI Summary
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-medium text-white truncate">{title}</p>
        <p className="mt-1 text-xs text-zinc-500">
          {date} · {duration}
        </p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
            Ready
          </span>
          <button
            type="button"
            className="ml-auto flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function RecordingsSection({ authenticated }) {
  return (
    <section id="recordings" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Recordings"
          title="Never lose a meeting moment"
          subtitle="Automatic cloud recording with playback, downloads, and AI-generated summaries."
        />

        {!authenticated && (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {demoRecordings.map((r, i) => (
              <DemoRecordingCard key={r.title} {...r} index={i} />
            ))}
          </div>
        )}

        {authenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-sky-400" />
                <h3 className="font-semibold text-white">Your recordings</h3>
              </div>
              <Link
                href="/recordings"
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                View all →
              </Link>
            </div>
            <div className="landing-recordings [&_h2]:hidden [&_section]:mt-0 [&_section]:border-0">
              <HostRecordings />
            </div>
          </motion.div>
        )}

        {!authenticated && (
          <div className="mt-10 text-center">
            <p className="text-sm text-zinc-500 mb-4">
              Sign in to save, download, and manage your meeting recordings.
            </p>
            <Link
              href={getLoginUrl("/#recordings")}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
            >
              Sign in for recordings
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
