"use client";

import { motion } from "framer-motion";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

export function DashboardShell({ navItems, title, subtitle, user, children }) {
  return (
    <div className="min-h-[100dvh] bg-[#06060a] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% -10%, rgba(56,189,248,0.12), transparent 50%), radial-gradient(ellipse 50% 40% at 90% 100%, rgba(139,92,246,0.1), transparent)",
        }}
      />
      <DashboardSidebar items={navItems} />
      <div className="relative lg:pl-64">
        <DashboardTopbar title={title} subtitle={subtitle} user={user} />
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 py-6 sm:px-6 lg:px-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
