"use client";

import { AnimatePresence, motion } from "framer-motion";
import { REACTION_EMOJIS } from "@/features/meeting/constants";

/**
 * Fixed-position picker — stays inside the viewport on all screen sizes.
 */
export function ReactionPicker({ open, onClose, onSelect }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close reactions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/30"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label="Choose a reaction"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[60] box-border rounded-2xl border border-white/15 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl
              bottom-[calc(5.75rem+env(safe-area-inset-bottom))]
              left-[max(0.5rem,env(safe-area-inset-left))]
              right-[max(0.5rem,env(safe-area-inset-right))]
              sm:left-1/2 sm:right-auto sm:w-[min(calc(100vw-1rem),16rem)] sm:-translate-x-1/2"
          >
            <div className="grid grid-cols-4 gap-1">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="flex aspect-square min-w-0 items-center justify-center rounded-xl text-lg leading-none hover:bg-white/10 active:scale-95 sm:text-xl"
                  onClick={() => onSelect?.(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
