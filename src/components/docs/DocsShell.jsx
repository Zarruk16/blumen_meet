"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Menu, Video, X, ArrowLeft } from "lucide-react";
import { DOCS_NAV } from "@/lib/docs/nav";
import { cn } from "@/lib/utils";
import { LandingBackground } from "@/components/layout/LandingBackground";

function SidebarNav({ onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-8">
      {DOCS_NAV.map((group) => (
        <div key={group.title}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {group.title}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-violet-500/15 font-medium text-violet-200"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      <LandingBackground />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open docs menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Video className="h-7 w-7 text-blue-500" />
              <span className="hidden font-semibold sm:inline">Blumen Meet</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <Link
              href="/docs"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white"
            >
              <BookOpen className="h-4 w-4 text-violet-400" />
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/#docs"
              className="hidden rounded-full px-3 py-1.5 text-sm text-zinc-400 hover:text-white sm:inline"
            >
              Overview
            </Link>
            <Link
              href="/saas/register"
              className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20"
            >
              Get API keys
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:py-12">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">
            <Link
              href="/"
              className="mb-6 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <SidebarNav />
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-20">
          <article className="docs-prose mx-auto max-w-3xl">{children}</article>
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col border-r border-white/10 bg-zinc-950 p-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold">Documentation</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
