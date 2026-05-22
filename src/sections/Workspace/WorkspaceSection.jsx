"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Link2, Lock } from "lucide-react";
import MeetingAction from "@/app/components/MeetingAction";
import ScheduledMeetings from "@/app/components/ScheduledMeetings";
import { SectionHeading } from "@/components/landing/ui/SectionHeading";
import { getLoginUrl } from "@/lib/authRedirect";

function GuestWorkspace() {
  const router = useRouter();
  const [meetingLink, setMeetingLink] = useState("");

  const handleJoin = () => {
    const raw = meetingLink.trim();
    if (!raw) return;
    try {
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const url = raw.includes("http") ? new URL(raw) : new URL(`/join/${raw}`, base);
      const roomId = url.pathname.split("/").filter(Boolean).pop();
      if (roomId) router.push(`/join/${roomId}${url.search}`);
    } catch {
      router.push(`/join/${raw}`);
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-blue-500/5 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/10">
          <Lock className="h-7 w-7 text-violet-300" />
        </div>
        <h3 className="text-xl font-semibold text-white">Sign in to host meetings</h3>
        <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
          Create instant meetings, schedule calls, and manage recordings — free after you log in.
        </p>
        <Link
          href={getLoginUrl("/#workspace")}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:scale-[1.02]"
        >
          Sign in to continue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl"
      >
        <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-zinc-400" />
          Join a meeting without signing in
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Paste link or room code"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          />
          <button
            type="button"
            onClick={handleJoin}
            className="rounded-xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/15 transition shrink-0"
          >
            Join
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function WorkspaceSection({ session, isAuthenticated }) {
  return (
    <section id="workspace" className="relative py-20 sm:py-28 scroll-mt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Your workspace"
          title={isAuthenticated ? "Start or join in seconds" : "Get started with Blumen Meet"}
          subtitle={
            isAuthenticated
              ? "Create instant meetings, schedule for later, or join with a code."
              : "Explore the platform freely — sign in when you're ready to host or view recordings."
          }
          align="center"
        />

        {isAuthenticated && session ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
            >
              <div className="landing-workspace [&_.flex-col]:gap-4 [&_button]:rounded-xl [&_input]:rounded-xl [&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-white [&_input]:placeholder:text-zinc-500">
                <MeetingAction />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mx-auto mt-12 w-full max-w-4xl min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 md:p-8"
            >
              <ScheduledMeetings
                hostUserId={session?.user?.id}
                hostName={session?.user?.name}
              />
            </motion.div>
          </>
        ) : (
          <GuestWorkspace />
        )}
      </div>
    </section>
  );
}
