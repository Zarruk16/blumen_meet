"use client";

import { motion } from "framer-motion";
import { useParticipants } from "@livekit/components-react";
import {
  Users,
  Wifi,
  Circle,
  LayoutGrid,
  User,
  Link2,
  LogOut,
  Video,
} from "lucide-react";
import { useMeetingStore, LAYOUTS } from "@/store/meetingStore";
import { CONNECTION_LABELS } from "@/features/meeting/constants";
import { useMeetingTimer } from "@/hooks/useMeetingTimer";
import { cn } from "@/lib/utils";

function MeetingHeaderInfo({ meetingTitle, elapsed, isRecording, recordingElapsed }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
      <div
        className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] border border-white/10"
        aria-hidden
      >
        <Video className="h-4 w-4 text-sky-300/90" />
      </div>

      <div className="min-w-0 flex flex-col gap-0.5 sm:gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="relative flex h-2 w-2 shrink-0"
            aria-label="Meeting live"
            title="Live"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          </span>
          <h1 className="truncate text-[15px] font-semibold leading-tight tracking-tight text-white sm:text-base md:text-[17px]">
            {meetingTitle || "Blumen Meet"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 pl-4 sm:pl-0 sm:ml-0">
          <p className="flex items-baseline gap-1.5 text-[11px] leading-none sm:text-xs">
            <span className="font-mono tabular-nums text-white/70">{elapsed}</span>
            <span className="text-white/40 font-normal">elapsed</span>
          </p>

          {isRecording && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/25 px-2 py-0.5 text-[10px] font-medium text-red-300 sm:text-[11px]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <Circle className="relative h-1.5 w-1.5 fill-red-500 text-red-500" />
              </span>
              <span className="font-mono tabular-nums">{recordingElapsed}</span>
              <span className="text-red-400/80 hidden sm:inline">recording</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function TopBar({
  meetingTitle,
  startedAt,
  isHost,
  onCopyInvite,
  onLeave,
}) {
  const participants = useParticipants();
  const layout = useMeetingStore((s) => s.layout);
  const setLayout = useMeetingStore((s) => s.setLayout);
  const isRecording = useMeetingStore((s) => s.isRecording);
  const recordingStartedAt = useMeetingStore((s) => s.recordingStartedAt);
  const connectionQuality = useMeetingStore((s) => s.connectionQuality);
  const elapsed = useMeetingTimer(startedAt);
  const recordingElapsed = useMeetingTimer(recordingStartedAt);
  const conn = CONNECTION_LABELS[connectionQuality] || CONNECTION_LABELS.good;

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "absolute inset-x-0 top-0 z-30",
        "pt-[max(0.625rem,env(safe-area-inset-top))]",
        "px-3 pb-2 sm:px-4 md:px-5 md:pb-3",
        "pointer-events-none"
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 md:items-center">
        {/* Left — meeting identity */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className={cn(
            "pointer-events-auto min-w-0 max-w-[min(100%,calc(100%-8.5rem))] sm:max-w-[min(100%,calc(100%-12rem))] md:max-w-[55%]",
            "rounded-2xl border border-white/10 bg-black/30 px-3 py-2",
            "shadow-2xl backdrop-blur-xl",
            "ring-1 ring-inset ring-white/[0.06]",
            "sm:px-4 sm:py-2.5 md:px-5 md:py-3"
          )}
        >
          <MeetingHeaderInfo
            meetingTitle={meetingTitle}
            elapsed={elapsed}
            isRecording={isRecording}
            recordingElapsed={recordingElapsed}
          />
        </motion.div>

        {/* Right — actions */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className={cn(
            "pointer-events-auto flex shrink-0 items-center gap-1 sm:gap-1.5",
            "rounded-2xl border border-white/10 bg-black/30 px-1.5 py-1.5",
            "shadow-2xl backdrop-blur-xl",
            "ring-1 ring-inset ring-white/[0.06]",
            "sm:px-2 sm:py-2"
          )}
        >
          <div
            className="hidden items-center gap-1.5 rounded-xl bg-white/[0.06] px-2.5 py-1.5 text-[11px] text-white/80 md:flex"
            title={`Connection: ${conn.label}`}
          >
            <Wifi className="h-3.5 w-3.5 text-white/50" />
            <span className={cn("h-2 w-2 rounded-full shadow-sm", conn.color)} />
          </div>

          <div
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-2 py-1.5 text-[11px] font-medium text-white/90 sm:px-2.5 sm:text-xs"
            aria-label={`${participants.length} participants`}
          >
            <Users className="h-3.5 w-3.5 text-white/50" />
            <span className="tabular-nums">{participants.length}</span>
          </div>

          <button
            type="button"
            onClick={() => setLayout(layout === LAYOUTS.GRID ? LAYOUTS.SPEAKER : LAYOUTS.GRID)}
            className="hidden h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-white/90 transition-colors hover:bg-white/[0.12] md:flex"
            title={layout === LAYOUTS.GRID ? "Switch to speaker view" : "Switch to grid view"}
            aria-label="Toggle layout"
          >
            {layout === LAYOUTS.GRID ? <User className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </button>

          {isHost && (
            <button
              type="button"
              onClick={onCopyInvite}
              className="hidden h-9 items-center gap-1.5 rounded-xl bg-white/[0.06] px-2.5 text-xs text-white/90 transition-colors hover:bg-white/[0.12] sm:flex"
              aria-label="Copy invite link"
            >
              <Link2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Share</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLeave}
            className="flex h-9 min-h-[36px] items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.08] px-2.5 text-xs font-medium text-white/90 transition-colors hover:bg-white/[0.14] sm:px-3"
            aria-label="Leave meeting"
            title="Leave without ending the meeting for others"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </motion.div>
      </div>
    </motion.header>
  );
}
