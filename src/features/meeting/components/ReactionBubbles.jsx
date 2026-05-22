"use client";

import { motion, AnimatePresence } from "framer-motion";

/** Spread bubbles inside the safe zone above the control bar. */
const BUBBLE_SLOTS = [
  { left: 22, top: 72 },
  { left: 42, top: 58 },
  { left: 62, top: 70 },
  { left: 78, top: 55 },
  { left: 30, top: 48 },
  { left: 55, top: 38 },
  { left: 70, top: 42 },
  { left: 48, top: 62 },
];

export function ReactionBubbles({ bubbles = [] }) {
  return (
    <div
      className="pointer-events-none absolute z-10 overflow-hidden"
      style={{
        top: "max(3.25rem, env(safe-area-inset-top))",
        bottom: "calc(5.75rem + env(safe-area-inset-bottom))",
        left: "max(0.5rem, env(safe-area-inset-left))",
        right: "max(0.5rem, env(safe-area-inset-right))",
      }}
    >
      <AnimatePresence>
        {bubbles.map((item, index) => {
          const slot = BUBBLE_SLOTS[index % BUBBLE_SLOTS.length];
          return (
            <motion.span
              key={item.id}
              initial={{ opacity: 0, y: 16, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.85 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl leading-none sm:text-3xl"
              style={{ left: `${slot.left}%`, top: `${slot.top}%` }}
            >
              {item.emoji}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
