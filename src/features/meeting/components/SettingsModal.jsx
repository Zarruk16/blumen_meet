"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutGrid, User } from "lucide-react";
import { useMeetingStore, LAYOUTS } from "@/store/meetingStore";
import { cn } from "@/lib/utils";

export function SettingsModal({ open, onClose }) {
  const layout = useMeetingStore((s) => s.layout);
  const setLayout = useMeetingStore((s) => s.setLayout);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Settings</h3>
              <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase mb-2">Video layout</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: LAYOUTS.SPEAKER, label: "Speaker", icon: User },
                    { id: LAYOUTS.GRID, label: "Grid", icon: LayoutGrid },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLayout(id)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                        layout === id
                          ? "border-sky-500 bg-sky-500/10 text-white"
                          : "border-white/10 text-zinc-400 hover:bg-white/5"
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Virtual backgrounds and noise suppression can be enabled when device APIs are configured.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
