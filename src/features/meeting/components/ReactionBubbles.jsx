"use client";

import { motion, AnimatePresence } from "framer-motion";

export function ReactionBubbles({ bubbles = [] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <AnimatePresence>
        {bubbles.map((item, index) => {
          const left = Math.min(82, Math.max(18, 18 + ((index * 17) % 62)));
          const bottom = Math.min(48, 16 + (index % 4) * 10);
          return (
            <motion.span
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="absolute -translate-x-1/2 text-3xl sm:text-4xl"
              style={{ left: `${left}%`, bottom: `${bottom}%` }}
            >
              {item.emoji}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
