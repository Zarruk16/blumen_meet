"use client";

import { useEffect } from "react";
import { ConnectionQuality, RoomEvent } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";
import { useMeetingStore } from "@/store/meetingStore";

function mapQuality(quality) {
  if (quality === ConnectionQuality.Excellent) return "excellent";
  if (quality === ConnectionQuality.Good) return "good";
  if (quality === ConnectionQuality.Poor) return "poor";
  return "fair";
}

export function useConnectionQuality() {
  const room = useRoomContext();
  const setConnectionQuality = useMeetingStore((s) => s.setConnectionQuality);

  useEffect(() => {
    if (!room?.localParticipant) return;

    const update = () => {
      const q = room.localParticipant.connectionQuality;
      setConnectionQuality(mapQuality(q));
    };

    update();
    room.on(RoomEvent.ConnectionQualityChanged, update);
    return () => room.off(RoomEvent.ConnectionQualityChanged, update);
  }, [room, setConnectionQuality]);
}
