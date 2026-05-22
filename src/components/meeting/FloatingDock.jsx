"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FloatingDock({
  children,
  className,
  wrapperClassName,
  compact = false,
}) {
  return (
    <motion.footer
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={cn(
        "pointer-events-none absolute inset-x-0 z-30 flex justify-center",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        compact ? "bottom-0 pt-4" : "bottom-0 pt-10 sm:pt-12",
        "bg-gradient-to-t from-black/70 via-black/25 to-transparent",
        wrapperClassName
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center",
          "rounded-2xl border border-white/10",
          "bg-black/40 shadow-2xl backdrop-blur-xl",
          "ring-1 ring-inset ring-white/[0.06]",
          compact
            ? "max-w-[calc(100vw-1rem)] gap-1 px-2 py-2"
            : "gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3",
          className
        )}
      >
        {children}
      </div>
    </motion.footer>
  );
}

export function DockGroup({ children, className }) {
  return (
    <div className={cn("flex items-center gap-1 sm:gap-1.5", className)}>{children}</div>
  );
}

export function DockDivider({ className }) {
  return (
    <div
      className={cn("mx-0.5 h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-white/20 to-transparent", className)}
      aria-hidden
    />
  );
}
