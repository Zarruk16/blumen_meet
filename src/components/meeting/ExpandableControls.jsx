"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExpandableControls({ open, onClose, children, className }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="More meeting controls"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) onClose?.();
            }}
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 lg:hidden",
              "rounded-t-3xl border-t border-white/10",
              "bg-zinc-950/95 backdrop-blur-2xl shadow-2xl",
              "pb-[max(1rem,env(safe-area-inset-bottom))]",
              className
            )}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
            </div>
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="text-sm font-medium text-white/90">More controls</span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/15"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 px-4 pb-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ExpandableControlItem({ label, children, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl p-3 min-h-[72px]",
        "border border-white/10 bg-white/[0.06] transition-colors",
        "hover:bg-white/[0.12] active:scale-95",
        active && "border-sky-400/40 bg-sky-500/10"
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
        {children}
      </span>
      <span className="text-[10px] font-medium text-zinc-400 text-center leading-tight">{label}</span>
    </button>
  );
}

export function MoreControlsTrigger({ open, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={open ? "Hide more controls" : "Show more controls"}
      aria-expanded={open}
      className={cn(
        "flex h-12 w-12 min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full",
        "border border-white/10 bg-white/[0.08] text-white",
        "hover:bg-white/[0.14] transition-colors",
        open && "bg-white/15 border-white/20"
      )}
    >
      <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown className="h-5 w-5" />
      </motion.span>
    </motion.button>
  );
}
