import { create } from "zustand";

export const LAYOUTS = {
  GRID: "grid",
  SPEAKER: "speaker",
};

export const PANELS = {
  NONE: null,
  CHAT: "chat",
  PARTICIPANTS: "participants",
  INFO: "info",
  SUMMARY: "summary",
};

export const useMeetingStore = create((set) => ({
  layout: LAYOUTS.SPEAKER,
  activePanel: PANELS.NONE,
  settingsOpen: false,
  isFullscreen: false,
  handRaised: false,
  isRecording: false,
  recordingId: null,
  recordingStartedAt: null,
  connectionQuality: "good",
  pinnedParticipantId: null,
  pinScreenShareOnly: false,
  screenShareFillStage: false,

  setLayout: (layout) => set({ layout }),
  setPinnedParticipant: (pinnedParticipantId, { screenShareOnly = false } = {}) =>
    set({
      pinnedParticipantId,
      pinScreenShareOnly: screenShareOnly,
    }),
  clearPinnedParticipant: () =>
    set({ pinnedParticipantId: null, pinScreenShareOnly: false }),
  setScreenShareFillStage: (screenShareFillStage) => set({ screenShareFillStage }),
  setActivePanel: (activePanel) => set({ activePanel }),
  togglePanel: (panel) =>
    set((s) => ({
      activePanel: s.activePanel === panel ? PANELS.NONE : panel,
    })),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setHandRaised: (handRaised) => set({ handRaised }),
  setRecording: ({ isRecording, recordingId, recordingStartedAt }) =>
    set({
      isRecording,
      recordingId: recordingId ?? null,
      recordingStartedAt: recordingStartedAt ?? null,
    }),
  setConnectionQuality: (connectionQuality) => set({ connectionQuality }),
  reset: () =>
    set({
      layout: LAYOUTS.SPEAKER,
      activePanel: PANELS.NONE,
      settingsOpen: false,
      isFullscreen: false,
      handRaised: false,
      isRecording: false,
      recordingId: null,
      recordingStartedAt: null,
      connectionQuality: "good",
      pinnedParticipantId: null,
      pinScreenShareOnly: false,
      screenShareFillStage: false,
    }),
}));
