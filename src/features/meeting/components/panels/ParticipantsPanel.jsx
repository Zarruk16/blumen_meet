"use client";

import { useParticipants, useRoomContext } from "@livekit/components-react";
import { Mic, MicOff, Hand, Crown, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ParticipantsPanel({ isHost }) {
  const participants = useParticipants();
  const room = useRoomContext();

  const muteParticipant = async (identity) => {
    if (!isHost || !room) return;
    const p = room.remoteParticipants.get(identity);
    if (p) await p.setMicrophoneEnabled(false);
  };

  return (
    <div className="overflow-y-auto p-3 space-y-1">
      {participants.map((p) => {
        const name = p.name || p.identity;
        const isLocal = p.isLocal;
        const hostLabel = name?.startsWith("HOST");
        const handRaised = p.attributes?.handRaised === "true";

        return (
          <div
            key={p.identity}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-medium text-white">
                {name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {name}
                  {isLocal && <span className="text-zinc-500"> (you)</span>}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {hostLabel && <Crown className="h-3 w-3 text-amber-400" />}
                  {handRaised && <Hand className="h-3 w-3 text-amber-300" />}
                  {p.isMicrophoneEnabled ? (
                    <Mic className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <MicOff className="h-3 w-3 text-red-400" />
                  )}
                  {p.isCameraEnabled ? (
                    <Video className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <VideoOff className="h-3 w-3 text-zinc-500" />
                  )}
                </div>
              </div>
            </div>
            {isHost && !isLocal && p.isMicrophoneEnabled && (
              <button
                type="button"
                onClick={() => muteParticipant(p.identity)}
                className="text-xs text-red-400 hover:text-red-300 shrink-0"
              >
                Mute
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
