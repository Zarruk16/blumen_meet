"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { RoomEvent, Track } from "livekit-client";

export function useMeetingControls() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [screenSharing, setScreenSharing] = useState(false);

  const micEnabled = localParticipant?.isMicrophoneEnabled ?? false;
  const camEnabled = localParticipant?.isCameraEnabled ?? false;

  const toggleMic = useCallback(async () => {
    await localParticipant?.setMicrophoneEnabled(!micEnabled);
  }, [localParticipant, micEnabled]);

  const toggleCam = useCallback(async () => {
    await localParticipant?.setCameraEnabled(!camEnabled);
  }, [localParticipant, camEnabled]);

  const toggleScreenShare = useCallback(async () => {
    if (!localParticipant) return;
    const next = !screenSharing;
    await localParticipant.setScreenShareEnabled(next, { audio: true });
    setScreenSharing(next);
  }, [localParticipant, screenSharing]);

  const leaveCall = useCallback(() => {
    room?.disconnect(true);
  }, [room]);

  const [handRaised, setHandRaised] = useState(false);

  useEffect(() => {
    setHandRaised(localParticipant?.attributes?.handRaised === "true");
  }, [localParticipant?.attributes?.handRaised]);

  useEffect(() => {
    if (!room) return;
    const syncLocal = () => {
      setHandRaised(room.localParticipant?.attributes?.handRaised === "true");
    };
    room.on(RoomEvent.ParticipantAttributesChanged, syncLocal);
    return () => room.off(RoomEvent.ParticipantAttributesChanged, syncLocal);
  }, [room]);

  const broadcastHandState = useCallback(
    async (raised) => {
      if (!localParticipant) return;
      const payload = new TextEncoder().encode(
        JSON.stringify({
          type: "hand",
          raised,
          identity: localParticipant.identity,
          name: localParticipant.name || localParticipant.identity,
        })
      );
      try {
        await localParticipant.publishData(payload, { reliable: true });
      } catch {
        // ignore
      }
    },
    [localParticipant]
  );

  const setHandRaise = useCallback(
    async (raised) => {
      if (!localParticipant) return;
      setHandRaised(raised);
      try {
        await localParticipant.setAttributes({ handRaised: raised ? "true" : "false" });
      } catch {
        // attributes may be unavailable on some plans
      }
      await broadcastHandState(raised);
    },
    [localParticipant, broadcastHandState]
  );

  const toggleHandRaise = useCallback(async () => {
    await setHandRaise(!handRaised);
  }, [handRaised, setHandRaise]);

  const lowerHand = useCallback(async () => {
    if (handRaised) await setHandRaise(false);
  }, [handRaised, setHandRaise]);

  return {
    micEnabled,
    camEnabled,
    screenSharing,
    handRaised,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    toggleHandRaise,
    lowerHand,
    leaveCall,
    localParticipant,
  };
}

export function useScreenShareTrack() {
  const { localParticipant } = useLocalParticipant();
  const pub = localParticipant?.getTrackPublication(Track.Source.ScreenShare);
  return pub?.track;
}
