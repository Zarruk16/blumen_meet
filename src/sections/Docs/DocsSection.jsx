"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Code2, KeyRound, Plug } from "lucide-react";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";

const highlights = [
  {
    icon: Plug,
    title: "Connect in minutes",
    desc: "Create a reseller account, copy your API key pair, and start creating meetings from your backend.",
  },
  {
    icon: Code2,
    title: "REST API",
    desc: "Create rooms, list meetings, and check usage limits with simple HTTP requests.",
  },
  {
    icon: KeyRound,
    title: "Secure auth",
    desc: "Every request is authenticated with your API key and secret. Rotate keys anytime from the dashboard.",
  },
];

export function DocsSection() {
  return (
    <section id="docs" className="relative scroll-mt-28 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Developers"
          title="Build on Blumen Meet"
          subtitle="Embed cinematic video meetings in your product. Our API handles rooms, hosting, and usage — you focus on your app."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-center justify-center gap-4 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/10 p-8 text-center sm:p-10"
        >
          <BookOpen className="h-10 w-10 text-violet-400" />
          <h3 className="text-xl font-semibold text-white sm:text-2xl">
            Full platform & API documentation
          </h3>
          <p className="max-w-lg text-sm text-zinc-400 sm:text-base">
            Step-by-step guides for authentication, creating meetings, join URLs, rate limits, and
            code examples in curl and JavaScript.
          </p>
          <Link
            href="/docs"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            View documentation
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
