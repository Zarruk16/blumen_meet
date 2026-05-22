"use client";

import { useEffect } from "react";
import { KEYBOARD_SHORTCUTS } from "../constants";

export function useMeetingKeyboard({
  onToggleMic,
  onToggleCam,
  onToggleChat,
  onToggleParticipants,
  onToggleFullscreen,
  onLeave,
}) {
  useEffect(() => {
    const handler = (e) => {
      if (e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA") return;
      const key = e.key.toLowerCase();
      if (key === KEYBOARD_SHORTCUTS.toggleMic) {
        e.preventDefault();
        onToggleMic?.();
      } else if (key === KEYBOARD_SHORTCUTS.toggleCam) {
        e.preventDefault();
        onToggleCam?.();
      } else if (key === KEYBOARD_SHORTCUTS.toggleChat) {
        e.preventDefault();
        onToggleChat?.();
      } else if (key === KEYBOARD_SHORTCUTS.toggleParticipants) {
        e.preventDefault();
        onToggleParticipants?.();
      } else if (key === KEYBOARD_SHORTCUTS.toggleFullscreen) {
        e.preventDefault();
        onToggleFullscreen?.();
      } else if (key === KEYBOARD_SHORTCUTS.leave && e.shiftKey) {
        e.preventDefault();
        onLeave?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onToggleMic, onToggleCam, onToggleChat, onToggleParticipants, onToggleFullscreen, onLeave]);
}
