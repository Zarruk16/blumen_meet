"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Film, LogOut, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavUserMenu({ className, onAction }) {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const handleSignOut = async () => {
    setOpen(false);
    onAction?.();
    await signOut({ callbackUrl: "/user-auth" });
  };

  if (status === "loading") {
    return (
      <div
        className={cn("h-9 w-9 animate-pulse rounded-full bg-white/10", className)}
        aria-hidden
      />
    );
  }

  if (!session) {
    return (
      <button
        type="button"
        onClick={() => {
          onAction?.();
          signIn(undefined, { callbackUrl: "/" });
        }}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white",
          className
        )}
      >
        Login
      </button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "rounded-full ring-2 ring-white/10 transition hover:ring-white/25 focus:outline-none focus-visible:ring-violet-500/50",
            className
          )}
          aria-label="Account menu"
        >
          <Avatar className="h-9 w-9 cursor-pointer">
            {session.user?.image ? (
              <AvatarImage src={session.user.image} alt={session.user.name || ""} />
            ) : (
              <AvatarFallback className="bg-zinc-700 text-sm text-white">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 border-white/10 bg-zinc-950/95 p-4 text-white backdrop-blur-xl"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="max-w-[220px] truncate text-sm font-medium text-zinc-300">
            {session.user?.email}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4 flex flex-col items-center">
          <Avatar className="mb-2 h-20 w-20">
            {session.user?.image ? (
              <AvatarImage src={session.user.image} alt={session.user.name || ""} />
            ) : (
              <AvatarFallback className="bg-zinc-700 text-2xl text-white">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <h2 className="text-lg font-semibold text-white">
            Hi, {session.user?.name?.split(" ")[0] || "there"}!
          </h2>
        </div>

        <div className="mb-3 flex gap-2">
          <Link
            href="/recordings"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
            onClick={() => {
              setOpen(false);
              onAction?.();
            }}
          >
            <Film className="h-4 w-4" />
            Recordings
          </Link>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-blue-400" />
            )}
          </button>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-xl border-white/10 bg-white/5 text-white hover:bg-red-600/20 hover:text-red-300 hover:border-red-500/30"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
