"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  PhoneOff,
  MonitorUp,
  MonitorOff,
  Hand,
  Smile,
  Settings,
  Maximize,
  Minimize,
  Circle,
  Sparkles,
} from "lucide-react";
import { useMeetingStore, PANELS } from "@/store/meetingStore";
import { ControlButton } from "./ControlButton";
import { ReactionPicker } from "./ReactionPicker";
import { FloatingDock, DockGroup } from "./FloatingDock";
import {
  ExpandableControls,
  ExpandableControlItem,
  MoreControlsTrigger,
} from "./ExpandableControls";
import { cn } from "@/lib/utils";

export function MobileControls({
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
  onEndMeeting,
  onToggleFullscreen,
}) {
  const activePanel = useMeetingStore((s) => s.activePanel);
  const togglePanel = useMeetingStore((s) => s.togglePanel);
  const setSettingsOpen = useMeetingStore((s) => s.setSettingsOpen);
  const [moreOpen, setMoreOpen] = useState(false);

  const closeMore = () => setMoreOpen(false);

  return (
    <>
      <FloatingDock compact wrapperClassName="lg:hidden" className="justify-between">
        <DockGroup>
          <ControlButton
            size="md"
            label={`Microphone ${micEnabled ? "on" : "off"}`}
            active={micEnabled}
            onClick={onToggleMic}
            showTooltip={false}
            className={!micEnabled ? "!bg-red-600/90 !border-red-500/40 !text-white" : ""}
          >
            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </ControlButton>
          <ControlButton
            size="md"
            label={`Camera ${camEnabled ? "on" : "off"}`}
            active={camEnabled}
            onClick={onToggleCam}
            showTooltip={false}
            className={!camEnabled ? "!bg-red-600/90 !border-red-500/40 !text-white" : ""}
          >
            {camEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </ControlButton>
        </DockGroup>

        <DockGroup>
          <ControlButton
            size="md"
            label="Chat"
            active={activePanel === PANELS.CHAT}
            onClick={() => togglePanel(PANELS.CHAT)}
            showTooltip={false}
          >
            <MessageSquare className="h-5 w-5" />
          </ControlButton>
          <ControlButton
            size="md"
            label="Participants"
            active={activePanel === PANELS.PARTICIPANTS}
            onClick={() => togglePanel(PANELS.PARTICIPANTS)}
            showTooltip={false}
          >
            <Users className="h-5 w-5" />
          </ControlButton>
          <MoreControlsTrigger open={moreOpen} onClick={() => setMoreOpen((v) => !v)} />
          <ControlButton
            size="md"
            label={isHost ? "End meeting" : "Leave"}
            danger
            onClick={isHost ? onEndMeeting : onLeave}
            showTooltip={false}
          >
            <PhoneOff className="h-5 w-5" />
          </ControlButton>
        </DockGroup>
      </FloatingDock>

      <ExpandableControls open={moreOpen} onClose={closeMore}>
        <ExpandableControlItem
          label={screenSharing ? "Stop share" : "Share screen"}
          active={screenSharing}
          onClick={() => {
            onToggleScreenShare?.();
            closeMore();
          }}
        >
          {screenSharing ? <MonitorOff className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
        </ExpandableControlItem>

        <ExpandableControlItem
          label="Reactions"
          onClick={() => {
            onReactionsOpenChange?.(true);
            closeMore();
          }}
          active={reactionsOpen}
        >
          <Smile className="h-5 w-5" />
        </ExpandableControlItem>

        <ExpandableControlItem
          label={handRaised ? "Lower hand" : "Raise hand"}
          active={handRaised}
          onClick={() => {
            onToggleHand?.();
            closeMore();
          }}
        >
          <Hand className={cn("h-5 w-5", handRaised && "text-amber-300")} />
        </ExpandableControlItem>

        {isHost && recordingAvailable && (
          <ExpandableControlItem
            label={isRecording ? "Stop record" : "Record"}
            active={isRecording}
            onClick={() => {
              onToggleRecording?.();
              closeMore();
            }}
          >
            <Circle className={cn("h-5 w-5", isRecording && "fill-red-500 text-red-500")} />
          </ExpandableControlItem>
        )}

        <ExpandableControlItem
          label="Settings"
          onClick={() => {
            setSettingsOpen(true);
            closeMore();
          }}
        >
          <Settings className="h-5 w-5" />
        </ExpandableControlItem>

        <ExpandableControlItem
          label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          onClick={() => {
            onToggleFullscreen?.();
            closeMore();
          }}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </ExpandableControlItem>

        <ExpandableControlItem
          label="AI Summary"
          active={activePanel === PANELS.SUMMARY}
          onClick={() => {
            togglePanel(PANELS.SUMMARY);
            closeMore();
          }}
        >
          <Sparkles className="h-5 w-5" />
        </ExpandableControlItem>
      </ExpandableControls>

      <div className="lg:hidden">
        <ReactionPicker
          open={reactionsOpen}
          onClose={() => onReactionsOpenChange?.(false)}
          onSelect={onSelectReaction}
        />
      </div>
    </>
  );
}
