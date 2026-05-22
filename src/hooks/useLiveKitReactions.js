"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RoomEvent } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";
import { toast } from "react-toastify";

const REACTION_EMOJIS = ["👍", "👏", "😂", "❤️", "🎉", "🔥"];

/**
 * In-room emoji reactions via LiveKit data messages.
 */
export function useLiveKitReactions({ enabled = true } = {}) {
  const room = useRoomContext();
  const [showReactions, setShowReactions] = useState(false);
  const [reactionBubbles, setReactionBubbles] = useState([]);
  const timeoutsRef = useRef([]);

  const addBubble = useCallback((emoji) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setReactionBubbles((prev) => [...prev, { id, emoji }]);
    const timeoutId = setTimeout(() => {
      setReactionBubbles((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
    timeoutsRef.current.push(timeoutId);
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!room || !enabled) return;

    const onData = (payload, participant) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);
        if (data?.type === "reaction" && data?.emoji) {
          addBubble(data.emoji);
          if (participant?.name || participant?.identity) {
            // Optional: could show who reacted
          }
        }
      } catch {
        // ignore non-JSON payloads
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => room.off(RoomEvent.DataReceived, onData);
  }, [room, enabled, addBubble]);

  const sendReaction = useCallback(
    async (emoji) => {
      if (!room?.localParticipant) return;
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ type: "reaction", emoji })
        );
        await room.localParticipant.publishData(payload, { reliable: true });
        addBubble(emoji);
      } catch {
        toast.error("Couldn't send reaction");
      } finally {
        setShowReactions(false);
      }
    },
    [room, addBubble]
  );

  return {
    showReactions,
    setShowReactions,
    reactionBubbles,
    sendReaction,
    reactionEmojis: REACTION_EMOJIS,
  };
}
