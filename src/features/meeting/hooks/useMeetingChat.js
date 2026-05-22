"use client";

import { useCallback, useEffect, useState } from "react";
import { RoomEvent } from "livekit-client";
import { useRoomContext, useLocalParticipant } from "@livekit/components-react";

export function useMeetingChat() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!room) return;

    const onData = (payload, participant) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data?.type !== "chat") return;
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            text: data.text,
            sender: participant?.name || participant?.identity || "Guest",
            senderId: participant?.identity,
            isLocal: participant?.isLocal,
            at: data.at || Date.now(),
          },
        ]);
      } catch {
        // ignore
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => room.off(RoomEvent.DataReceived, onData);
  }, [room]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || !room?.localParticipant) return;
      const payload = {
        type: "chat",
        text: trimmed,
        at: Date.now(),
      };
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(payload)),
        { reliable: true }
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-local`,
          text: trimmed,
          sender: localParticipant?.name || "You",
          senderId: localParticipant?.identity,
          isLocal: true,
          at: payload.at,
        },
      ]);
    },
    [room, localParticipant]
  );

  return { messages, sendMessage };
}
