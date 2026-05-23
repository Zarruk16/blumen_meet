"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, change, icon: Icon, accent = "sky", className }) {
  const accents = {
    sky: "from-sky-500/20 to-sky-500/5 border-sky-500/20",
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm",
        accents[accent] || accents.sky,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-white sm:text-3xl">{value}</p>
          {change != null && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                change >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {change >= 0 ? "+" : ""}
              {change}% vs last period
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <Icon className="h-5 w-5 text-white/80" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
