"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { ParticipantTile } from "./ParticipantTile";
import { useStageDominant } from "../hooks/useStageDominant";
import { cn } from "@/lib/utils";

function EmptyStage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10">
        <Users className="h-8 w-8 text-zinc-500" />
      </div>
      <p className="text-sm font-medium text-zinc-300">Waiting for participants…</p>
    </motion.div>
  );
}

export function SpeakerLayout() {
  const {
    dominant,
    thumbnails,
    screenShareFillStage,
    pinScreenShare,
    unpinParticipant,
    toggleScreenShareFillStage,
    pinnedParticipantId,
  } = useStageDominant();

  if (!dominant) return <EmptyStage />;

  const fillStage = screenShareFillStage && dominant.isScreenShare;
  const hideThumbs = fillStage;

  return (
    <div
      className={cn(
        "flex h-full w-full gap-2 p-2 sm:gap-3 sm:p-4 md:gap-4",
        "pt-[calc(3.5rem+env(safe-area-inset-top))]",
        "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-[calc(6rem+env(safe-area-inset-bottom))]",
        hideThumbs ? "flex-col" : "flex-col sm:flex-row"
      )}
    >
      <div
        className={cn(
          "flex-1 min-h-0",
          !hideThumbs && "min-h-[40vh] sm:min-h-0"
        )}
      >
        <ParticipantTile
          participant={dominant.participant}
          trackRef={dominant.trackRef}
          isSpeaking={dominant.isSpeaking}
          isDominant
          isScreenShare={dominant.isScreenShare}
          isPinned={pinnedParticipantId === dominant.participant.identity}
          screenShareFillStage={fillStage}
          onPinScreenShare={() => pinScreenShare(dominant.participant.identity)}
          onUnpin={unpinParticipant}
          onToggleFillStage={dominant.isScreenShare ? toggleScreenShareFillStage : undefined}
          className={cn("h-full", hideThumbs ? "min-h-0" : "min-h-[200px] sm:min-h-0")}
        />
      </div>
      {!hideThumbs && thumbnails.length > 0 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto scrollbar-none sm:w-36 md:w-44 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden">
          {thumbnails.map(({ participant, trackRef, isSpeaking, isScreenSharing }) => (
            <ParticipantTile
              key={participant.identity}
              participant={participant}
              trackRef={trackRef}
              isSpeaking={isSpeaking}
              isScreenSharing={isScreenSharing}
              onPinScreenShare={
                isScreenSharing ? () => pinScreenShare(participant.identity) : undefined
              }
              className="h-24 w-36 shrink-0 sm:h-28 sm:w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
