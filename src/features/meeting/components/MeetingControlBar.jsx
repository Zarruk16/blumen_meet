"use client";

import { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  MessageSquare,
  Users,
  Circle,
  Hand,
  Smile,
  Settings,
  Maximize,
  Minimize,
  PhoneOff,
  Sparkles,
} from "lucide-react";
import { useMeetingStore, PANELS } from "@/store/meetingStore";
import { ControlButton } from "@/components/meeting/ControlButton";
import { FloatingDock, DockGroup, DockDivider } from "@/components/meeting/FloatingDock";
import { MobileControls } from "@/components/meeting/MobileControls";
import { ReactionPicker } from "@/components/meeting/ReactionPicker";
import { cn } from "@/lib/utils";

function DesktopControls({
  micEnabled,
  camEnabled,
  screenSharing,
  handRaised,
  isHost,
  isRecording,
  recordingAvailable,
  isFullscreen,
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
  onToggleHand,
  onToggleRecording,
  reactionsOpen,
  onReactionsOpenChange,
  onSelectReaction,
  onLeave,
  onToggleFullscreen,
}) {
  const activePanel = useMeetingStore((s) => s.activePanel);
  const togglePanel = useMeetingStore((s) => s.togglePanel);
  const setSettingsOpen = useMeetingStore((s) => s.setSettingsOpen);

  return (
    <FloatingDock wrapperClassName="hidden lg:flex" className="max-w-3xl xl:max-w-4xl">
      <DockGroup>
        <ControlButton
          label={`Microphone (${micEnabled ? "on" : "off"})`}
          active={micEnabled}
          onClick={onToggleMic}
          className={!micEnabled ? "!bg-red-600/90 !border-red-500/40 !text-white" : ""}
        >
          {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </ControlButton>
        <ControlButton
          label={`Camera (${camEnabled ? "on" : "off"})`}
          active={camEnabled}
          onClick={onToggleCam}
          className={!camEnabled ? "!bg-red-600/90 !border-red-500/40 !text-white" : ""}
        >
          {camEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </ControlButton>
      </DockGroup>

      <DockDivider />

      <DockGroup>
        <ControlButton
          label="Share screen"
          active={screenSharing}
          onClick={onToggleScreenShare}
          glow={screenSharing}
        >
          {screenSharing ? <MonitorOff className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
        </ControlButton>

        <ControlButton
          label="Chat"
          active={activePanel === PANELS.CHAT}
          onClick={() => togglePanel(PANELS.CHAT)}
        >
          <MessageSquare className="h-5 w-5" />
        </ControlButton>

        <ControlButton
          label="Participants"
          active={activePanel === PANELS.PARTICIPANTS}
          onClick={() => togglePanel(PANELS.PARTICIPANTS)}
        >
          <Users className="h-5 w-5" />
        </ControlButton>

        <ControlButton
          label="Reactions"
          active={reactionsOpen}
          onClick={() => onReactionsOpenChange?.(!reactionsOpen)}
        >
          <Smile className="h-5 w-5" />
        </ControlButton>

        <ControlButton
          label={handRaised ? "Lower hand" : "Raise hand"}
          active={handRaised}
          onClick={onToggleHand}
          className={handRaised ? "!bg-amber-500/90 !border-amber-400/50 !text-white" : ""}
        >
          <Hand className={cn("h-5 w-5", handRaised && "text-amber-100")} />
        </ControlButton>

        {isHost && recordingAvailable && (
          <ControlButton
            label={isRecording ? "Stop recording" : "Record meeting"}
            active={isRecording}
            onClick={onToggleRecording}
            className={cn(isRecording && "!bg-red-600/90 !border-red-500/50")}
            glow={isRecording}
          >
            <Circle className={cn("h-5 w-5", isRecording && "fill-current animate-pulse")} />
          </ControlButton>
        )}

        <ControlButton
          label="AI Summary"
          active={activePanel === PANELS.SUMMARY}
          onClick={() => togglePanel(PANELS.SUMMARY)}
        >
          <Sparkles className="h-5 w-5" />
        </ControlButton>
      </DockGroup>

      <DockDivider />

      <DockGroup>
        <ControlButton label="Settings" onClick={() => setSettingsOpen(true)}>
          <Settings className="h-5 w-5" />
        </ControlButton>
        <ControlButton
          label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </ControlButton>
      </DockGroup>

      <DockDivider className="mx-1" />

      <ControlButton label="Leave meeting (Shift+L)" danger onClick={onLeave}>
        <PhoneOff className="h-5 w-5" />
      </ControlButton>
    </FloatingDock>
  );
}

export function MeetingControlBar(props) {
  const { reactionsOpen, onReactionsOpenChange, onSelectReaction } = props;
  return (
    <>
      <MobileControls {...props} />
      <DesktopControls {...props} />
      <div className="hidden lg:block">
        <ReactionPicker
          open={reactionsOpen}
          onClose={() => onReactionsOpenChange?.(false)}
          onSelect={onSelectReaction}
        />
      </div>
    </>
  );
}
