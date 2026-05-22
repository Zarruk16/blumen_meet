"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { VideoTrack } from "@livekit/components-react";
import { Mic, MicOff, Hand, Monitor, Pin, PinOff, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

function ParticipantCardInner({
  trackRef,
  participant,
  isSpeaking,
  isDominant,
  isScreenShare,
  isScreenSharing,
  isPinned,
  isPinnedManual,
  screenShareFillStage,
  onPinScreenShare,
  onUnpin,
  onToggleFillStage,
  className,
}) {
  const name = participant?.name || participant?.identity || "Guest";
  const micOn = participant?.isMicrophoneEnabled;
  const handRaised = participant?.attributes?.handRaised === "true";
  const isScreen =
    isScreenShare ||
    trackRef?.source?.includes?.("screen") ||
    trackRef?.publication?.source === "screen_share";

  const showStageControls = isDominant && isScreen && (onToggleFillStage || onPinScreenShare || onUnpin);

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
        !isScreen && "aspect-video",
        isScreen && isDominant && "aspect-auto min-h-0",
        isSpeaking &&
          !isPinned &&
          "ring-2 ring-sky-400/70 shadow-[0_0_32px_rgba(56,189,248,0.2)] border-sky-400/30",
        isPinned &&
          "ring-2 ring-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.2)] border-amber-400/40",
        isDominant &&
          !isPinned &&
          "ring-2 ring-violet-400/80 shadow-[0_0_40px_rgba(139,92,246,0.25)] border-violet-400/30",
        className
      )}
    >
      {isSpeaking && !isPinned && (
        <motion.div
          layout={false}
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-sky-400/40"
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {showStageControls && (
        <div className="absolute top-2 right-2 z-20 flex flex-wrap items-center justify-end gap-1.5">
          {onToggleFillStage && (
            <button
              type="button"
              onClick={onToggleFillStage}
              className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-[10px] font-medium text-white backdrop-blur-md hover:bg-black/80 sm:text-xs"
              aria-label={screenShareFillStage ? "Show participant strip" : "Fullscreen screen share"}
            >
              {screenShareFillStage ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">Show all</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          )}
          {isPinned && onUnpin ? (
            <button
              type="button"
              onClick={onUnpin}
              className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-500/20 px-2 py-1.5 text-[10px] font-medium text-amber-100 backdrop-blur-md hover:bg-amber-500/30 sm:text-xs"
              aria-label="Unpin screen share"
            >
              <PinOff className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Unpin</span>
            </button>
          ) : (
            onPinScreenShare && (
              <button
                type="button"
                onClick={onPinScreenShare}
                className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-[10px] font-medium text-white backdrop-blur-md hover:bg-black/80 sm:text-xs"
                aria-label="Pin screen share"
              >
                <Pin className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Pin</span>
              </button>
            )
          )}
        </div>
      )}

      {!isDominant && isScreenSharing && onPinScreenShare && (
        <button
          type="button"
          onClick={onPinScreenShare}
          className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/60 text-white backdrop-blur-md hover:bg-black/80"
          aria-label="Pin screen share"
        >
          <Pin className="h-3.5 w-3.5" />
        </button>
      )}

      {trackRef?.publication?.track ? (
        <VideoTrack
          trackRef={trackRef}
          className={cn(
            "absolute inset-0 h-full w-full",
            isScreen
              ? "[&_video]:h-full [&_video]:w-full [&_video]:object-contain"
              : "[&_video]:h-full [&_video]:w-full [&_video]:object-cover"
          )}
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
          <span className="truncate text-xs font-medium text-white sm:text-sm">
            {name}
            {isPinned && (
              <span className="ml-1.5 text-[10px] font-normal text-amber-300/90">Pinned</span>
            )}
            {isScreen && !isPinned && isDominant && (
              <span className="ml-1.5 text-[10px] font-normal text-sky-300/90">Presenting</span>
            )}
          </span>
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
