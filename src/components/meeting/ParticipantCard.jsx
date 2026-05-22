"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { VideoTrack } from "@livekit/components-react";
import { Mic, MicOff, Hand, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

function ParticipantCardInner({ trackRef, participant, isSpeaking, isDominant, className }) {
  const name = participant?.name || participant?.identity || "Guest";
  const micOn = participant?.isMicrophoneEnabled;
  const handRaised = participant?.attributes?.handRaised === "true";
  const isScreen =
    trackRef?.source?.includes?.("screen") || trackRef?.publication?.source === "screen_share";

  return (
    <motion.div
      layout
      layoutId={participant?.identity ? `tile-${participant.identity}` : undefined}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-zinc-900/80",
        "border border-white/[0.08] shadow-lg",
        "aspect-video w-full",
        isSpeaking &&
          "ring-2 ring-sky-400/70 shadow-[0_0_32px_rgba(56,189,248,0.2)] border-sky-400/30",
        isDominant &&
          "ring-2 ring-violet-400/80 shadow-[0_0_40px_rgba(139,92,246,0.25)] border-violet-400/30",
        className
      )}
    >
      {isSpeaking && (
        <motion.div
          layout={false}
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-sky-400/40"
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {trackRef?.publication?.track ? (
        <VideoTrack
          trackRef={trackRef}
          className="absolute inset-0 h-full w-full object-cover [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800/90 via-zinc-900 to-zinc-950">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 text-lg sm:text-2xl font-semibold text-white shadow-inner ring-2 ring-white/10"
          >
            {name.charAt(0).toUpperCase()}
          </motion.div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-2.5 pt-8">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-white sm:text-sm">{name}</span>
          <div className="flex shrink-0 items-center gap-1.5">
            {isScreen && <Monitor className="h-3.5 w-3.5 text-sky-300" aria-hidden />}
            {handRaised && <Hand className="h-3.5 w-3.5 text-amber-300" aria-hidden />}
            {micOn ? (
              <Mic className="h-3.5 w-3.5 text-emerald-400" aria-label="Mic on" />
            ) : (
              <MicOff className="h-3.5 w-3.5 text-red-400" aria-label="Mic off" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const ParticipantCard = memo(ParticipantCardInner);
