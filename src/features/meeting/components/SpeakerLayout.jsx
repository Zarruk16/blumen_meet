"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useParticipants, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Users } from "lucide-react";
import { ParticipantTile } from "./ParticipantTile";

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
  const participants = useParticipants();
  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Camera, withPlaceholder: true },
    ],
    { onlySubscribed: true }
  );

  const { dominant, thumbnails } = useMemo(() => {
    const speaking = participants.filter((p) => p.isSpeaking);
    const dominantParticipant = speaking[0] || participants[0];
    if (!dominantParticipant) return { dominant: null, thumbnails: [] };

    const dominantTrack =
      tracks.find(
        (t) =>
          t.participant.identity === dominantParticipant.identity &&
          t.source === Track.Source.ScreenShare
      ) ||
      tracks.find(
        (t) =>
          t.participant.identity === dominantParticipant.identity &&
          t.source === Track.Source.Camera
      );

    const thumbs = participants
      .filter((p) => p.identity !== dominantParticipant.identity)
      .map((p) => ({
        participant: p,
        trackRef: tracks.find(
          (t) => t.participant.identity === p.identity && t.source === Track.Source.Camera
        ),
      }));

    return {
      dominant: {
        participant: dominantParticipant,
        trackRef: dominantTrack,
        isSpeaking: dominantParticipant.isSpeaking,
      },
      thumbnails: thumbs,
    };
  }, [participants, tracks]);

  if (!dominant) return <EmptyStage />;

  return (
    <div
      className="flex h-full w-full flex-col gap-2 p-2 sm:flex-row sm:gap-3 sm:p-4 md:gap-4
        pt-[calc(3.5rem+env(safe-area-inset-top))]
        pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-[calc(6rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex-1 min-h-0 min-h-[40vh] sm:min-h-0">
        <ParticipantTile
          participant={dominant.participant}
          trackRef={dominant.trackRef}
          isSpeaking={dominant.isSpeaking}
          isDominant
          className="h-full min-h-[200px] sm:min-h-0"
        />
      </div>
      {thumbnails.length > 0 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto scrollbar-none sm:w-36 md:w-44 sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden">
          {thumbnails.map(({ participant, trackRef }) => (
            <ParticipantTile
              key={participant.identity}
              participant={participant}
              trackRef={trackRef}
              isSpeaking={participant.isSpeaking}
              className="h-24 w-36 shrink-0 sm:h-28 sm:w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
