"use client";

import { useEffect } from "react";
import { RoomEvent } from "livekit-client";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { toast } from "react-toastify";

/**
 * When the host mutes this participant, disable the local mic and show a notice.
 */
export function useHostMuteListener() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!room || !localParticipant) return;

    const onData = (payload) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);
        if (
          data?.type === "host-mute" &&
          data?.identity === localParticipant.identity
        ) {
          void localParticipant.setMicrophoneEnabled(false);
          toast.info("The host muted your microphone");
        }
      } catch {
        // ignore
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => room.off(RoomEvent.DataReceived, onData);
  }, [room, localParticipant]);
}
