"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
  useRoomContext,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { ConnectionState, DisconnectReason, RoomEvent } from "livekit-client";
import { toast } from "react-toastify";
import {
  HostShareOverlay,
  MeetingTimerOverlay,
  ReactionOverlay,
} from "./MeetingOverlays";
import { useLiveKitReactions } from "@/hooks/useLiveKitReactions";
import { useMeetingTimer } from "@/hooks/useMeetingTimer";

function RoomInternals({ onConnected, onDisconnected, onLeaveRoom, joinToastShownRef }) {
  const room = useRoomContext();
  const connectedRef = useRef(false);
  const {
    showReactions,
    setShowReactions,
    reactionBubbles,
    sendReaction,
    reactionEmojis,
  } = useLiveKitReactions({ enabled: true });

  useEffect(() => {
    if (!room) return;

    const onJoin = (participant) => {
      if (participant.isLocal) return;
      const name = participant.name || participant.identity || "Someone";
      toast.info(`${name} joined the meeting`);
    };

    const onLeave = (participant) => {
      const name = participant.name || participant.identity || "Someone";
      toast.info(`${name} left the meeting`);
    };

    const onConnectionState = (state) => {
      if (state === ConnectionState.Connected && !connectedRef.current) {
        connectedRef.current = true;
        if (!joinToastShownRef.current) {
          toast.success("Meeting joined successfully");
          joinToastShownRef.current = true;
        }
        onConnected?.();
      }
      if (state === ConnectionState.Reconnecting) {
        toast.info("Reconnecting...");
      }
      if (state === ConnectionState.Disconnected) {
        onDisconnected?.();
      }
    };

    const onDisconnected = (reason) => {
      if (reason === DisconnectReason.CLIENT_INITIATED) {
        connectedRef.current = false;
        onLeaveRoom?.();
      }
    };

    room.on(RoomEvent.ParticipantConnected, onJoin);
    room.on(RoomEvent.ParticipantDisconnected, onLeave);
    room.on(RoomEvent.ConnectionStateChanged, onConnectionState);
    room.on(RoomEvent.Disconnected, onDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, onJoin);
      room.off(RoomEvent.ParticipantDisconnected, onLeave);
      room.off(RoomEvent.ConnectionStateChanged, onConnectionState);
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [room, onConnected, onDisconnected, onLeaveRoom, joinToastShownRef]);

  return (
    <>
      <RoomAudioRenderer />
      <div className="h-full w-full [&_.lk-video-conference]:h-full [&_.lk-video-conference]:min-h-0">
        <VideoConference />
      </div>
      <ReactionOverlay
        reactionBubbles={reactionBubbles}
        showReactions={showReactions}
        setShowReactions={setShowReactions}
        reactionEmojis={reactionEmojis}
        onSendReaction={sendReaction}
        visible={true}
      />
    </>
  );
}

/**
 * Full-screen LiveKit meeting with preserved overlay UI (host link, reactions, timer).
 */
export default function LiveKitMeetingRoom({
  token,
  serverUrl,
  cameraOn,
  micOn,
  isHost,
  inviteUrl,
  onConnected,
  onDisconnected,
  onLeaveRoom,
  onCopyInvite,
}) {
  const joinToastShownRef = useRef(false);
  const [meetingStartedAt, setMeetingStartedAt] = useState(null);
  const elapsed = useMeetingTimer(meetingStartedAt);

  useEffect(() => {
    return () => {
      joinToastShownRef.current = false;
    };
  }, []);

  if (!token || !serverUrl) {
    return null;
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={cameraOn}
        audio={micOn}
        options={{
          adaptiveStream: true,
          dynacast: true,
        }}
        className="h-full w-full"
        onConnected={() => {
          if (!meetingStartedAt) {
            setMeetingStartedAt(Date.now());
          }
        }}
        onError={(error) => {
          console.error("[LiveKit]", error);
          toast.error(error?.message || "Meeting connection error");
        }}
        data-lk-theme="default"
      >
        <RoomInternals
          onConnected={onConnected}
          onDisconnected={onDisconnected}
          onLeaveRoom={onLeaveRoom}
          joinToastShownRef={joinToastShownRef}
        />
      </LiveKitRoom>

      <HostShareOverlay isHost={isHost} onCopyInvite={onCopyInvite} inviteUrl={inviteUrl} />
      <MeetingTimerOverlay elapsed={elapsed} />
    </div>
  );
}
