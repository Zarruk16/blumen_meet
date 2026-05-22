"use client";

import { motion, AnimatePresence } from "framer-motion";

export function ReactionBubbles({ bubbles = [] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <AnimatePresence>
        {bubbles.map((item, index) => (
          <motion.span
            key={item.id}
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute text-3xl sm:text-4xl"
            style={{
              left: `${18 + ((index * 17) % 62)}%`,
              bottom: `${16 + ((index % 4) * 10)}%`,
            }}
          >
            {item.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
