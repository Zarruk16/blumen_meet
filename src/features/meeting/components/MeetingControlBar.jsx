"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { REACTION_EMOJIS } from "../constants";
import { ControlButton } from "@/components/meeting/ControlButton";
import { FloatingDock, DockGroup, DockDivider } from "@/components/meeting/FloatingDock";
import { MobileControls } from "@/components/meeting/MobileControls";
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
  onSendReaction,
  onLeave,
  onToggleFullscreen,
}) {
  const activePanel = useMeetingStore((s) => s.activePanel);
  const togglePanel = useMeetingStore((s) => s.togglePanel);
  const setSettingsOpen = useMeetingStore((s) => s.setSettingsOpen);
  const [showReactions, setShowReactions] = useState(false);

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

        <div className="relative">
          <ControlButton label="Reactions" onClick={() => setShowReactions((v) => !v)}>
            <Smile className="h-5 w-5" />
          </ControlButton>
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-1/2 z-50 mb-3 flex -translate-x-1/2 gap-1 rounded-2xl border border-white/15 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl"
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-lg hover:bg-white/10"
                    onClick={() => {
                      onSendReaction?.(emoji);
                      setShowReactions(false);
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ControlButton label="Raise hand" active={handRaised} onClick={onToggleHand}>
          <Hand className="h-5 w-5" />
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
  return (
    <>
      <MobileControls {...props} />
      <DesktopControls {...props} />
    </>
  );
}
