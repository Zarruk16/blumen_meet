"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { RoomAudioRenderer } from "@livekit/components-react";
import { ConnectionState, DisconnectReason, RoomEvent } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";
import { toast } from "react-toastify";
import { useMeetingStore, PANELS } from "@/store/meetingStore";
import { useLiveKitReactions } from "@/hooks/useLiveKitReactions";
import { useMeetingControls } from "./hooks/useMeetingControls";
import { useConnectionQuality } from "./hooks/useConnectionQuality";
import { useMeetingKeyboard } from "./hooks/useMeetingKeyboard";
import { useRecording } from "./hooks/useRecording";
import { useRaisedHands } from "./hooks/useRaisedHands";
import { useMeetingLifecycle } from "./hooks/useMeetingLifecycle";
import { RaisedHandsBanner } from "@/components/meeting/RaisedHandsBanner";
import { MeetingVideoStage } from "./components/MeetingVideoStage";
import { MeetingTopBar } from "./components/MeetingTopBar";
import { MeetingControlBar } from "./components/MeetingControlBar";
import { SettingsModal } from "./components/SettingsModal";
import { SidePanel } from "./components/panels/SidePanel";
import { ChatPanel } from "./components/panels/ChatPanel";
import { ParticipantsPanel } from "./components/panels/ParticipantsPanel";
import { MeetingInfoPanel } from "./components/panels/MeetingInfoPanel";
import { SummaryPanel } from "@/features/ai-summary/SummaryPanel";

function RoomConnectionHandler({
  onConnected,
  onDisconnected,
  onLeaveRoom,
  onStopRecording,
  isHost,
  joinToastShownRef,
}) {
  const room = useRoomContext();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!room) return;

    const onConnectionState = (state) => {
      if (state === ConnectionState.Connected && !connectedRef.current) {
        connectedRef.current = true;
        joinToastShownRef.current = true;
        onConnected?.();
      }
      if (state === ConnectionState.Disconnected) onDisconnected?.();
    };

    const onDisconnected = (reason) => {
      if (isHost) onStopRecording?.({ silent: true, keepalive: true, force: true });
      connectedRef.current = false;
      if (
        reason === DisconnectReason.CLIENT_INITIATED ||
        reason === DisconnectReason.ROOM_DELETED
      ) {
        onLeaveRoom?.();
      }
    };

    room.on(RoomEvent.ConnectionStateChanged, onConnectionState);
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.ConnectionStateChanged, onConnectionState);
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [room, onConnected, onDisconnected, onLeaveRoom, onStopRecording, isHost, joinToastShownRef]);

  return null;
}

export function MeetingExperience({
  roomId,
  meetingTitle,
  isHost,
  participantIdentity,
  hostUserId,
  inviteUrl,
  startedAt,
  onConnected,
  onDisconnected,
  onLeaveRoom,
  onCopyInvite,
  onHostChange,
  onReportPresence,
}) {
  const joinToastShownRef = useRef(false);
  const activePanel = useMeetingStore((s) => s.activePanel);
  const setActivePanel = useMeetingStore((s) => s.setActivePanel);
  const settingsOpen = useMeetingStore((s) => s.settingsOpen);
  const setSettingsOpen = useMeetingStore((s) => s.setSettingsOpen);
  const isFullscreen = useMeetingStore((s) => s.isFullscreen);
  const setFullscreen = useMeetingStore((s) => s.setFullscreen);
  const reset = useMeetingStore((s) => s.reset);

  const { reactionBubbles, sendReaction } = useLiveKitReactions({ enabled: true });
  const [reactionsOpen, setReactionsOpen] = useState(false);

  const handleSelectReaction = useCallback(
    (emoji) => {
      setReactionsOpen(false);
      void sendReaction(emoji);
    },
    [sendReaction]
  );

  const controls = useMeetingControls();
  const { raisedHands } = useRaisedHands();
  const { isRecording, toggleRecording, stopRecordingIfActive } = useRecording(roomId, isHost);
  useConnectionQuality();

  const { transferHostOnLeave, endMeetingForAll } = useMeetingLifecycle({
    roomId,
    participantIdentity,
    hostUserId,
    isHost,
    onHostChange,
    onMeetingEnded: onLeaveRoom,
  });

  const disconnectAndExit = useCallback(async () => {
    await onReportPresence?.("leave");
    controls.leaveCall();
  }, [controls.leaveCall, onReportPresence]);

  const handleLeave = useCallback(async () => {
    try {
      if (isHost) {
        await stopRecordingIfActive({ silent: true, force: true });
        await transferHostOnLeave();
      }
      await disconnectAndExit();
    } catch (e) {
      toast.error(e?.message || "Could not leave meeting");
    }
  }, [
    isHost,
    stopRecordingIfActive,
    transferHostOnLeave,
    disconnectAndExit,
  ]);

  const handleEndMeeting = useCallback(async () => {
    if (!isHost) {
      await handleLeave();
      return;
    }
    try {
      await stopRecordingIfActive({ silent: true, force: true });
      await endMeetingForAll();
      await disconnectAndExit();
    } catch (e) {
      toast.error(e?.message || "Could not end meeting");
    }
  }, [isHost, handleLeave, stopRecordingIfActive, endMeetingForAll, disconnectAndExit]);

  useEffect(() => () => reset(), [reset]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }, [setFullscreen]);

  useMeetingKeyboard({
    onToggleMic: controls.toggleMic,
    onToggleCam: controls.toggleCam,
    onToggleChat: () => useMeetingStore.getState().togglePanel(PANELS.CHAT),
    onToggleParticipants: () => useMeetingStore.getState().togglePanel(PANELS.PARTICIPANTS),
    onToggleFullscreen: toggleFullscreen,
    onLeave: isHost ? handleEndMeeting : handleLeave,
  });

  const closePanel = () => setActivePanel(PANELS.NONE);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <RoomConnectionHandler
        onConnected={onConnected}
        onDisconnected={onDisconnected}
        onLeaveRoom={onLeaveRoom}
        onStopRecording={stopRecordingIfActive}
        isHost={isHost}
        joinToastShownRef={joinToastShownRef}
      />
      <RoomAudioRenderer />

      <div
        className={`relative h-full transition-[margin] duration-300 ${
          activePanel ? "sm:mr-80" : ""
        }`}
      >
        <MeetingVideoStage reactionBubbles={reactionBubbles} />
        <MeetingTopBar
          meetingTitle={meetingTitle}
          startedAt={startedAt}
          isHost={isHost}
          onCopyInvite={onCopyInvite}
          onLeave={handleLeave}
        />
        {raisedHands.length > 0 && (
          <div
            className="pointer-events-none absolute inset-x-0 z-[28] flex justify-center px-3
              bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-[calc(6rem+env(safe-area-inset-bottom))]"
          >
            <RaisedHandsBanner
              raisedHands={raisedHands}
              onLowerHand={controls.lowerHand}
            />
          </div>
        )}
        <MeetingControlBar
          micEnabled={controls.micEnabled}
          camEnabled={controls.camEnabled}
          screenSharing={controls.screenSharing}
          handRaised={controls.handRaised}
          isHost={isHost}
          isRecording={isRecording}
          recordingAvailable={process.env.NEXT_PUBLIC_RECORDING_ENABLED === "true"}
          onToggleMic={controls.toggleMic}
          onToggleCam={controls.toggleCam}
          onToggleScreenShare={controls.toggleScreenShare}
          onToggleHand={controls.toggleHandRaise}
          onToggleRecording={toggleRecording}
          reactionsOpen={reactionsOpen}
          onReactionsOpenChange={setReactionsOpen}
          onSelectReaction={handleSelectReaction}
          onLeave={handleLeave}
          onEndMeeting={handleEndMeeting}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      </div>

      <SidePanel open={activePanel === PANELS.CHAT} title="Chat" onClose={closePanel}>
        <ChatPanel />
      </SidePanel>
      <SidePanel open={activePanel === PANELS.PARTICIPANTS} title="Participants" onClose={closePanel}>
        <ParticipantsPanel isHost={isHost} />
      </SidePanel>
      <SidePanel open={activePanel === PANELS.INFO} title="Meeting info" onClose={closePanel}>
        <MeetingInfoPanel roomId={roomId} inviteUrl={inviteUrl} isHost={isHost} />
      </SidePanel>
      <SidePanel open={activePanel === PANELS.SUMMARY} title="AI Summary" onClose={closePanel}>
        <SummaryPanel roomId={roomId} />
      </SidePanel>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
