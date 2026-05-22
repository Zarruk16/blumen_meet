"use client";

import { motion } from "framer-motion";
import {
  Video,
  Sparkles,
  Circle,
  MessageSquare,
  Users,
  Smartphone,
  MonitorUp,
  Shield,
} from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";

const features = [
  { icon: Video, title: "HD Meetings", desc: "Crystal-clear video powered by ZarrukCode with adaptive streaming." },
  { icon: Sparkles, title: "AI Summaries", desc: "Automatic notes, action items, and highlights after every call." },
  { icon: Circle, title: "Recording", desc: "Cloud recordings with instant playback and secure downloads." },
  { icon: MessageSquare, title: "Live Chat", desc: "Real-time messaging without leaving the meeting." },
  { icon: Users, title: "Collaboration", desc: "Participant management, hand raise, and reactions." },
  { icon: Smartphone, title: "Mobile Ready", desc: "Premium experience on phone, tablet, and desktop." },
  { icon: MonitorUp, title: "Screen Share", desc: "Share your screen with low-latency presentation mode." },
  { icon: Shield, title: "Security", desc: "Encrypted media, host controls, and secure auth." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Platform"
          title="Everything your team needs to meet"
          subtitle="A complete meeting stack — from join to recording to AI insights — designed for speed and clarity."
        />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-shadow hover:border-violet-500/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 text-violet-300">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
