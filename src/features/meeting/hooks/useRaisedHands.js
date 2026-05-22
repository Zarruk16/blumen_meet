"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { RoomEvent } from "livekit-client";
import { useParticipants, useRoomContext } from "@livekit/components-react";

function isHandRaised(participant) {
  return participant?.attributes?.handRaised === "true";
}

function participantLabel(participant) {
  return participant?.name || participant?.identity || "Guest";
}

export function useRaisedHands() {
  const room = useRoomContext();
  const participants = useParticipants();
  const [revision, setRevision] = useState(0);
  const [dataHands, setDataHands] = useState({});

  const bump = useCallback(() => setRevision((n) => n + 1), []);

  useEffect(() => {
    if (!room) return;

    const onAttributesChanged = () => bump();
    const onParticipantChange = () => bump();

    const onDisconnected = (participant) => {
      if (!participant?.identity) return;
      setDataHands((prev) => {
        const next = { ...prev };
        delete next[participant.identity];
        return next;
      });
      bump();
    };

    const onData = (payload, participant) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);
        if (data?.type !== "hand" || !data?.identity) return;
        setDataHands((prev) => ({
          ...prev,
          [data.identity]: {
            raised: !!data.raised,
            name: data.name || participant?.name || data.identity,
          },
        }));
        bump();
      } catch {
        // ignore
      }
    };

    room.on(RoomEvent.ParticipantAttributesChanged, onAttributesChanged);
    room.on(RoomEvent.ParticipantConnected, onParticipantChange);
    room.on(RoomEvent.ParticipantDisconnected, onDisconnected);
    room.on(RoomEvent.DataReceived, onData);

    return () => {
      room.off(RoomEvent.ParticipantAttributesChanged, onAttributesChanged);
      room.off(RoomEvent.ParticipantConnected, onParticipantChange);
      room.off(RoomEvent.ParticipantDisconnected, onDisconnected);
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, bump]);

  const raisedHands = useMemo(() => {
    const seen = new Set();
    const list = [];

    for (const p of participants) {
      const fromAttr = isHandRaised(p);
      const fromData = dataHands[p.identity]?.raised === true;
      if (fromAttr || fromData) {
        seen.add(p.identity);
        list.push({
          identity: p.identity,
          name: participantLabel(p),
          isLocal: p.isLocal,
        });
      }
    }

    for (const [identity, info] of Object.entries(dataHands)) {
      if (!info?.raised || seen.has(identity)) continue;
      list.push({
        identity,
        name: info.name || identity,
        isLocal: room?.localParticipant?.identity === identity,
      });
    }

    return list.sort((a, b) => {
      if (a.isLocal !== b.isLocal) return a.isLocal ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [participants, dataHands, room?.localParticipant?.identity, revision]);

  return { raisedHands, hasRaisedHands: raisedHands.length > 0 };
}
