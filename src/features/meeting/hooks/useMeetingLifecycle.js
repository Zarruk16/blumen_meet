"use client";

import { useCallback, useEffect } from "react";
import { RoomEvent } from "livekit-client";
import { useParticipants, useRoomContext } from "@livekit/components-react";
import { toast } from "react-toastify";

function getHostKey(roomId) {
  if (typeof window === "undefined") return "";
  return (localStorage.getItem(`hostKey:${roomId}`) || "").trim();
}

export function useMeetingLifecycle({
  roomId,
  participantIdentity,
  hostUserId,
  isHost,
  onHostChange,
  onMeetingEnded,
}) {
  const room = useRoomContext();
  const participants = useParticipants();

  const broadcast = useCallback(
    async (payload) => {
      if (!room?.localParticipant) return;
      try {
        const data = new TextEncoder().encode(JSON.stringify(payload));
        await room.localParticipant.publishData(data, { reliable: true });
      } catch {
        // ignore
      }
    },
    [room]
  );

  useEffect(() => {
    if (!room) return;

    const onData = (payload) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);
        if (data?.type === "host-changed" && data?.currentHostUserId) {
          const nowHost = data.currentHostUserId === participantIdentity;
          onHostChange?.(nowHost, data);
          if (data.nextHostName) {
            toast.info(`${data.nextHostName} is now the host`);
          }
        }
        if (data?.type === "meeting-ended") {
          toast.info("The host ended the meeting");
          onMeetingEnded?.();
          room.disconnect(true);
        }
      } catch {
        // ignore
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => room.off(RoomEvent.DataReceived, onData);
  }, [room, participantIdentity, onHostChange, onMeetingEnded]);

  const pickNextHost = useCallback(() => {
    const remotes = participants.filter((p) => !p.isLocal);
    if (!remotes.length) return null;
    const preferred = remotes.find((p) => !p.identity.startsWith("guest-"));
    const pick = preferred || remotes[0];
    return {
      userId: pick.identity,
      name: pick.name || pick.identity,
    };
  }, [participants]);

  const transferHostOnLeave = useCallback(async () => {
    const next = pickNextHost();
    if (!next) return { transferred: false };

    const res = await fetch(`/api/meetings/${roomId}/leave-host`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostKey: getHostKey(roomId),
        hostUserId,
        nextHostUserId: next.userId,
        nextHostName: next.name,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.transferred) {
      await broadcast({
        type: "host-changed",
        currentHostUserId: data.currentHostUserId,
        nextHostName: data.nextHostName,
      });
      toast.success(`${data.nextHostName} is now the host`);
      return { transferred: true, ...data };
    }
    return { transferred: false };
  }, [roomId, hostUserId, pickNextHost, broadcast]);

  const endMeetingForAll = useCallback(async () => {
    const res = await fetch(`/api/meetings/${roomId}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostKey: getHostKey(roomId),
        hostUserId,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to end meeting");
    }
    await broadcast({ type: "meeting-ended" });
    return true;
  }, [roomId, hostUserId, broadcast]);

  return {
    transferHostOnLeave,
    endMeetingForAll,
    pickNextHost,
  };
}
