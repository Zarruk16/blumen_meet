"use client";

import { motion } from "framer-motion";
import { Sparkles, ListChecks, FileText, Lightbulb } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";

const insights = [
  { icon: FileText, label: "Full transcript", value: "Auto-generated from cloud recordings" },
  { icon: ListChecks, label: "Action items", value: "3 tasks assigned to design team" },
  { icon: Lightbulb, label: "Key decisions", value: "Launch beta in Q2 approved" },
];

export function AISection() {
  return (
    <section id="ai" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="AI Intelligence"
          title="Turn every meeting into clarity"
          subtitle="Blumen Meet captures conversations and transforms them into structured summaries, decisions, and next steps."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {insights.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-sm text-zinc-500">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-violet-500/20 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-300">
              <Sparkles className="h-4 w-4" />
              AI Summary Preview
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              The team aligned on shipping the v2 beta in Q2. Design will deliver mockups by Friday.
              Engineering owns API integration. Marketing prepares launch assets.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Action items</p>
              {["Finalize API spec", "Review UI mockups", "Schedule beta rollout"].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-300"
                >
                  <span className="text-violet-400">→</span>
                  {t}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {["00:00 Kickoff", "12:40 Demo", "24:10 Wrap-up"].map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-violet-500/10 px-2 py-1 text-[10px] text-violet-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
