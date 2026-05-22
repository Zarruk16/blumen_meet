"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useParticipants, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Users } from "lucide-react";
import { ParticipantTile } from "./ParticipantTile";
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
      <div>
        <p className="text-sm font-medium text-zinc-300">Waiting for others to join</p>
        <p className="mt-1 text-xs text-zinc-500">Share the invite link to start the meeting</p>
      </div>
    </motion.div>
  );
}

export function VideoGrid() {
  const participants = useParticipants();
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true }
  );

  const tiles = useMemo(() => {
    return participants.map((p) => {
      const trackRef =
        tracks.find((t) => t.participant.identity === p.identity && t.source === Track.Source.ScreenShare) ||
        tracks.find((t) => t.participant.identity === p.identity && t.source === Track.Source.Camera);
      return { participant: p, trackRef, isSpeaking: p.isSpeaking };
    });
  }, [participants, tracks]);

  const count = tiles.length;
  const gridClass =
    count <= 1
      ? "grid-cols-1 max-w-4xl mx-auto"
      : count === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : count <= 4
          ? "grid-cols-2"
          : count <= 6
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  if (count === 0) return <EmptyStage />;

  return (
    <div
      className={cn(
        "grid h-full w-full auto-rows-fr content-center",
        "gap-2 p-2 sm:gap-3 sm:p-4 md:gap-4",
        "pt-[calc(3.5rem+env(safe-area-inset-top))]",
        "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-[calc(6rem+env(safe-area-inset-bottom))]",
        gridClass
      )}
    >
      {tiles.map(({ participant, trackRef, isSpeaking }) => (
        <ParticipantTile
          key={participant.identity}
          participant={participant}
          trackRef={trackRef}
          isSpeaking={isSpeaking}
          className="min-h-[140px] sm:min-h-[160px] md:min-h-[180px]"
        />
      ))}
    </div>
  );
}
