"use client";

import { useState, useCallback } from "react";
import { useParticipants, useRoomContext } from "@livekit/components-react";
import { Mic, MicOff, Hand, Crown, Video, VideoOff, Monitor, Pin, PinOff, VolumeX } from "lucide-react";
import { toast } from "react-toastify";
import { useMeetingStore } from "@/store/meetingStore";

function getHostKey(roomId) {
  if (typeof window === "undefined") return "";
  return (localStorage.getItem(`hostKey:${roomId}`) || "").trim();
}

export function ParticipantsPanel({ isHost, roomId, hostUserId }) {
  const participants = useParticipants();
  const room = useRoomContext();
  const pinnedParticipantId = useMeetingStore((s) => s.pinnedParticipantId);
  const pinScreenShare = useMeetingStore((s) => s.setPinnedParticipant);
  const clearPinnedParticipant = useMeetingStore((s) => s.clearPinnedParticipant);
  const [mutingId, setMutingId] = useState(null);

  const broadcastHostMute = useCallback(
    async (identity) => {
      if (!room?.localParticipant) return;
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ type: "host-mute", identity })
        );
        await room.localParticipant.publishData(payload, { reliable: true });
      } catch {
        // ignore
      }
    },
    [room]
  );

  const muteParticipant = async (participant) => {
    if (!isHost || !roomId || participant.isLocal) return;

    setMutingId(participant.identity);
    try {
      const res = await fetch(`/api/meetings/${roomId}/mute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostKey: getHostKey(roomId),
          hostUserId: hostUserId || "",
          participantIdentity: participant.identity,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to mute participant");
      }
      if (data.reason === "no_microphone_track") {
        toast.info(`${participant.name || participant.identity} has no active microphone`);
      } else {
        await broadcastHostMute(participant.identity);
        const p = room?.remoteParticipants.get(participant.identity);
        if (p) await p.setMicrophoneEnabled(false).catch(() => {});
        toast.success(`${participant.name || participant.identity} was muted`);
      }
    } catch (e) {
      toast.error(e?.message || "Could not mute participant");
    } finally {
      setMutingId(null);
    }
  };

  const sorted = [...participants].sort((a, b) => {
    const aHand = a.attributes?.handRaised === "true" ? 1 : 0;
    const bHand = b.attributes?.handRaised === "true" ? 1 : 0;
    return bHand - aHand;
  });

  return (
    <div className="overflow-y-auto p-3 space-y-1">
      {sorted.map((p) => {
        const name = p.name || p.identity;
        const isLocal = p.isLocal;
        const hostLabel = name?.startsWith("HOST");
        const handRaised = p.attributes?.handRaised === "true";
        const micOn = p.isMicrophoneEnabled;
        const isMuting = mutingId === p.identity;

        return (
          <div
            key={p.identity}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 hover:bg-white/5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-medium text-white">
                {name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {name}
                  {isLocal && <span className="text-zinc-500"> (you)</span>}
                  {handRaised && (
                    <span className="ml-1.5 text-[10px] font-medium text-amber-300">· hand raised</span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {hostLabel && <Crown className="h-3 w-3 text-amber-400" />}
                  {handRaised && <Hand className="h-3 w-3 text-amber-300" />}
                  {micOn ? (
                    <Mic className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <MicOff className="h-3 w-3 text-red-400" />
                  )}
                  {p.isScreenShareEnabled && (
                    <Monitor className="h-3 w-3 text-sky-300" aria-label="Sharing screen" />
                  )}
                  {p.isCameraEnabled ? (
                    <Video className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <VideoOff className="h-3 w-3 text-zinc-500" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {p.isScreenShareEnabled && (
                pinnedParticipantId === p.identity ? (
                  <button
                    type="button"
                    onClick={() => clearPinnedParticipant()}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-amber-300 hover:bg-white/5"
                  >
                    <PinOff className="h-3.5 w-3.5" />
                    Unpin
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => pinScreenShare(p.identity, { screenShareOnly: true })}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-sky-300 hover:bg-white/5"
                  >
                    <Pin className="h-3.5 w-3.5" />
                    Pin
                  </button>
                )
              )}
              {isHost && !isLocal && (
                <button
                  type="button"
                  disabled={isMuting || !micOn}
                  onClick={() => muteParticipant(p)}
                  className="flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Mute ${name}`}
                >
                  <VolumeX className="h-3.5 w-3.5 shrink-0" />
                  {isMuting ? "…" : micOn ? "Mute" : "Muted"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
