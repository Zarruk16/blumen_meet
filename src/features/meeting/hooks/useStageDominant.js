"use client";

import { useEffect, useMemo } from "react";
import { useParticipants, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useMeetingStore } from "@/store/meetingStore";

const TRACK_SOURCES = [
  { source: Track.Source.ScreenShare, withPlaceholder: false },
  { source: Track.Source.Camera, withPlaceholder: true },
];

function findScreenShareTrack(tracks, identity) {
  return tracks.find(
    (t) => t.participant.identity === identity && t.source === Track.Source.ScreenShare
  );
}

function findCameraTrack(tracks, identity) {
  return tracks.find(
    (t) => t.participant.identity === identity && t.source === Track.Source.Camera
  );
}

function pickDominantTrack(tracks, identity) {
  return findScreenShareTrack(tracks, identity) || findCameraTrack(tracks, identity);
}

function findActiveScreenSharer(participants, tracks) {
  const screenTrack = tracks.find(
    (t) => t.source === Track.Source.ScreenShare && t.publication?.track
  );
  if (screenTrack) return screenTrack.participant;
  return participants.find((p) => p.isScreenShareEnabled) || null;
}

function pickDominantParticipant(participants, tracks, pinnedId, pinScreenShareOnly) {
  if (participants.length === 0) return null;

  if (pinnedId) {
    const pinned = participants.find((p) => p.identity === pinnedId);
    if (pinned) {
      if (pinScreenShareOnly) {
        const sharing =
          pinned.isScreenShareEnabled || !!findScreenShareTrack(tracks, pinnedId);
        if (sharing) return pinned;
      } else {
        return pinned;
      }
    }
  }

  const screenSharer = findActiveScreenSharer(participants, tracks);
  if (screenSharer) return screenSharer;

  const speaking = participants.filter((p) => p.isSpeaking);
  return speaking[0] || participants[0];
}

export function useStageDominant() {
  const participants = useParticipants();
  const tracks = useTracks(TRACK_SOURCES, { onlySubscribed: true });

  const pinnedParticipantId = useMeetingStore((s) => s.pinnedParticipantId);
  const pinScreenShareOnly = useMeetingStore((s) => s.pinScreenShareOnly);
  const screenShareFillStage = useMeetingStore((s) => s.screenShareFillStage);
  const setPinnedParticipant = useMeetingStore((s) => s.setPinnedParticipant);
  const clearPinnedParticipant = useMeetingStore((s) => s.clearPinnedParticipant);
  const setScreenShareFillStage = useMeetingStore((s) => s.setScreenShareFillStage);

  const dominantParticipant = useMemo(
    () =>
      pickDominantParticipant(
        participants,
        tracks,
        pinnedParticipantId,
        pinScreenShareOnly
      ),
    [participants, tracks, pinnedParticipantId, pinScreenShareOnly]
  );

  const dominant = useMemo(() => {
    if (!dominantParticipant) return null;
    const trackRef = pickDominantTrack(tracks, dominantParticipant.identity);
    const isScreenShare =
      trackRef?.source === Track.Source.ScreenShare ||
      trackRef?.source?.includes?.("screen") ||
      trackRef?.publication?.source === "screen_share";
    return {
      participant: dominantParticipant,
      trackRef,
      isSpeaking: dominantParticipant.isSpeaking,
      isScreenShare,
    };
  }, [dominantParticipant, tracks]);

  const thumbnails = useMemo(() => {
    if (!dominantParticipant) return [];
    return participants
      .filter((p) => p.identity !== dominantParticipant.identity)
      .map((p) => ({
        participant: p,
        trackRef: findCameraTrack(tracks, p.identity),
        isSpeaking: p.isSpeaking,
        isScreenSharing: p.isScreenShareEnabled,
      }));
  }, [participants, tracks, dominantParticipant]);

  const spotlightActive = useMemo(() => {
    if (pinnedParticipantId) return true;
    return !!findActiveScreenSharer(participants, tracks);
  }, [participants, tracks, pinnedParticipantId]);

  const isManuallyPinned = !!pinnedParticipantId;
  const isAutoScreenSharePin =
    !isManuallyPinned && !!dominant?.isScreenShare && spotlightActive;

  useEffect(() => {
    if (!pinnedParticipantId) return;
    const pinned = participants.find((p) => p.identity === pinnedParticipantId);
    if (!pinned) {
      clearPinnedParticipant();
      return;
    }
    if (pinScreenShareOnly && !pinned.isScreenShareEnabled) {
      clearPinnedParticipant();
    }
  }, [
    participants,
    pinnedParticipantId,
    pinScreenShareOnly,
    clearPinnedParticipant,
  ]);

  useEffect(() => {
    const hasScreenShare = !!findActiveScreenSharer(participants, tracks);
    if (!hasScreenShare && !pinnedParticipantId) {
      setScreenShareFillStage(false);
    }
  }, [participants, tracks, pinnedParticipantId, setScreenShareFillStage]);

  const pinParticipant = (identity, { screenShareOnly = false } = {}) => {
    setPinnedParticipant(identity, { screenShareOnly });
  };

  const pinScreenShare = (identity) => pinParticipant(identity, { screenShareOnly: true });

  const unpinParticipant = () => clearPinnedParticipant();

  const toggleScreenShareFillStage = () =>
    setScreenShareFillStage(!screenShareFillStage);

  return {
    dominant,
    thumbnails,
    spotlightActive,
    isManuallyPinned,
    isAutoScreenSharePin,
    screenShareFillStage,
    pinParticipant,
    pinScreenShare,
    unpinParticipant,
    toggleScreenShareFillStage,
    setScreenShareFillStage,
    pinnedParticipantId,
  };
}

export function useSpotlightActive() {
  const participants = useParticipants();
  const tracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: true }
  );
  const pinnedParticipantId = useMeetingStore((s) => s.pinnedParticipantId);

  return useMemo(() => {
    if (pinnedParticipantId) return true;
    return (
      tracks.some((t) => t.source === Track.Source.ScreenShare && t.publication?.track) ||
      participants.some((p) => p.isScreenShareEnabled)
    );
  }, [participants, tracks, pinnedParticipantId]);
}
