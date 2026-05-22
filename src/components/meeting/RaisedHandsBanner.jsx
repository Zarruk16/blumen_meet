"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Hand, X } from "lucide-react";
import { cn } from "@/lib/utils";

function formatNames(raisedHands) {
  return raisedHands
    .map((p) => (p.isLocal ? `${p.name} (you)` : p.name))
    .join(", ");
}

export function RaisedHandsBanner({ raisedHands, onLowerHand, className }) {
  if (!raisedHands?.length) return null;

  const localRaised = raisedHands.some((p) => p.isLocal);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "pointer-events-auto flex items-center gap-2 rounded-2xl border border-amber-400/30",
          "bg-amber-500/15 px-3 py-2 shadow-lg backdrop-blur-xl",
          "max-w-[min(calc(100vw-1.5rem),28rem)]",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <Hand className="h-4 w-4 shrink-0 text-amber-300" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
            {raisedHands.length === 1 ? "Hand raised" : "Hands raised"}
          </p>
          <p className="truncate text-xs font-medium text-amber-50 sm:text-sm">
            {formatNames(raisedHands)}
          </p>
        </div>
        {localRaised && onLowerHand && (
          <button
            type="button"
            onClick={onLowerHand}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/25 px-2 py-1 text-[10px] font-semibold text-amber-50 hover:bg-amber-500/35 sm:text-xs"
            aria-label="Lower your hand"
          >
            <X className="h-3.5 w-3.5" />
            Lower
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
