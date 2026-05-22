"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Video, Sparkles } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NavUserMenu } from "./NavUserMenu";
import { getLoginUrl, redirectToLogin } from "@/lib/authRedirect";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "AI Features", href: "#ai" },
  { label: "Recordings", href: "#recordings" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
  { label: "Contact", href: "#contact" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href) => {
    setOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6",
          scrolled && "pt-3"
        )}
      >
        <nav
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition-all duration-300 sm:gap-4 sm:rounded-full sm:px-5 sm:py-2",
            scrolled
              ? "border-white/15 bg-zinc-950/70 shadow-2xl shadow-black/40 backdrop-blur-xl"
              : "border-white/10 bg-white/[0.04] backdrop-blur-md"
          )}
        >
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Video className="h-8 w-8 text-blue-500" />
            <span className="hidden font-semibold tracking-tight text-white sm:inline">
              Blumen Meet
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => scrollTo(item.href)}
                className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => {
                if (status === "authenticated") scrollTo("#workspace");
                else redirectToLogin(router, "/#workspace");
              }}
              className="rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Meeting
            </button>
            <NavUserMenu />
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            <NavUserMenu />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-xl lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex h-full flex-col px-6 pt-24 pb-8"
            >
              {session?.user && (
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {session.user.image ? (
                        <AvatarImage src={session.user.image} alt={session.user.name || ""} />
                      ) : (
                        <AvatarFallback className="bg-zinc-700 text-white">
                          {session.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2) || "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {session.user.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">{session.user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/user-auth" });
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {NAV.map((item, i) => (
                  <motion.button
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    type="button"
                    onClick={() => scrollTo(item.href)}
                    className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-left text-lg text-white"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (status === "authenticated") scrollTo("#workspace");
                    else redirectToLogin(router, "/#workspace");
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 text-center font-semibold text-white"
                >
                  Start Meeting
                </button>
                <Link
                  href={session ? "/recordings" : getLoginUrl("/recordings")}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-zinc-300"
                  onClick={() => setOpen(false)}
                >
                  <Sparkles className="h-4 w-4" />
                  Recordings
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
