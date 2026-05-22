"use client";

import { useCallback, useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { Track } from "livekit-client";

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

  const toggleHandRaise = useCallback(async () => {
    if (!localParticipant) return;
    const raised = localParticipant.attributes?.handRaised === "true";
    const next = !raised;
    try {
      await localParticipant.setAttributes({ handRaised: next ? "true" : "false" });
    } catch {
      await room?.localParticipant?.publishData(
        new TextEncoder().encode(JSON.stringify({ type: "hand", raised: next })),
        { reliable: true }
      );
    }
  }, [localParticipant, room]);

  const handRaised = localParticipant?.attributes?.handRaised === "true";

  return {
    micEnabled,
    camEnabled,
    screenSharing,
    handRaised,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    toggleHandRaise,
    leaveCall,
    localParticipant,
  };
}

export function useScreenShareTrack() {
  const { localParticipant } = useLocalParticipant();
  const pub = localParticipant?.getTrackPublication(Track.Source.ScreenShare);
  return pub?.track;
}
