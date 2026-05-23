"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardSidebar({ items }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <Video className="h-6 w-6 text-blue-500" />
          <span className="font-semibold tracking-tight">Blumen Meet</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <nav className="fixed bottom-0 inset-x-0 z-40 flex border-t border-white/10 bg-black/80 backdrop-blur-xl lg:hidden">
        {items.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
                active ? "text-sky-400" : "text-zinc-500"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate max-w-[4rem]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
