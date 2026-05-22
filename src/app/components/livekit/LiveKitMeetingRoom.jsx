"use client";

import React, { useEffect, useRef, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { toast } from "react-toastify";
import { MeetingExperience } from "@/features/meeting/MeetingExperience";

/**
 * LiveKit room shell — premium meeting UI inside LiveKitRoom.
 */
export default function LiveKitMeetingRoom({
  token,
  serverUrl,
  roomId,
  cameraOn,
  micOn,
  isHost,
  participantIdentity,
  hostUserId,
  inviteUrl,
  onConnected,
  onDisconnected,
  onLeaveRoom,
  onCopyInvite,
  onHostChange,
  onReportPresence,
}) {
  const [meetingStartedAt, setMeetingStartedAt] = useState(null);

  if (!token || !serverUrl) {
    return null;
  }

  return (
    <div className="relative h-full w-full bg-[#0a0a0f] overflow-hidden">
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
          if (!meetingStartedAt) setMeetingStartedAt(Date.now());
        }}
        onError={(error) => {
          console.error("[LiveKit]", error);
          toast.error(error?.message || "Meeting connection error");
        }}
      >
        <MeetingExperience
          roomId={roomId}
          meetingTitle={`Meeting ${roomId?.slice(0, 8) || ""}`}
          isHost={isHost}
          participantIdentity={participantIdentity}
          hostUserId={hostUserId}
          inviteUrl={inviteUrl}
          startedAt={meetingStartedAt}
          onConnected={onConnected}
          onDisconnected={onDisconnected}
          onLeaveRoom={onLeaveRoom}
          onCopyInvite={onCopyInvite}
          onHostChange={onHostChange}
          onReportPresence={onReportPresence}
        />
      </LiveKitRoom>
    </div>
  );
}
