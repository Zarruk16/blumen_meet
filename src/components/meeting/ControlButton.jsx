"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const sizes = {
  md: "h-12 w-12 min-h-[48px] min-w-[48px]",
  lg: "h-11 w-11 sm:h-12 sm:w-12",
  sm: "h-10 w-10 min-h-[40px] min-w-[40px]",
};

export const ControlButton = forwardRef(function ControlButton(
  {
    active,
    danger,
    label,
    children,
    className,
    size = "lg",
    showTooltip = true,
    glow,
    ...props
  },
  ref
) {
  return (
    <div className="group relative flex shrink-0">
      <motion.button
        ref={ref}
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        title={label}
        aria-label={label}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-200",
          "border border-white/10 bg-white/[0.08] text-white shadow-sm",
          "hover:bg-white/[0.14] hover:border-white/20 hover:shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          sizes[size],
          active &&
            "border-white/25 bg-white text-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/95",
          danger &&
            "border-red-500/40 bg-red-600 text-white shadow-[0_0_24px_rgba(239,68,68,0.35)] hover:bg-red-500 hover:border-red-400/50",
          glow && !danger && "shadow-[0_0_20px_rgba(56,189,248,0.25)] border-sky-400/30",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
      {showTooltip && label && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap",
            "rounded-lg bg-zinc-950/95 px-2.5 py-1 text-[10px] font-medium text-white/90",
            "border border-white/10 opacity-0 shadow-lg transition-opacity duration-150",
            "group-hover:opacity-100 group-focus-within:opacity-100",
            "hidden lg:block"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
});
