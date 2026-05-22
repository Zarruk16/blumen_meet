"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRoomContext } from "@livekit/components-react";
import { toast } from "react-toastify";
import { useMeetingStore } from "@/store/meetingStore";
import * as recordingApi from "@/services/recordingApi";

function recordingStorageKey(roomId) {
  return `activeRecording:${roomId}`;
}

function isLastInRoom(room) {
  if (!room) return true;
  return room.remoteParticipants.size === 0;
}

export function useRecording(roomId, isHost) {
  const room = useRoomContext();
  const { data: session } = useSession();
  const isRecording = useMeetingStore((s) => s.isRecording);
  const recordingId = useMeetingStore((s) => s.recordingId);
  const setRecording = useMeetingStore((s) => s.setRecording);
  const stoppingRef = useRef(false);

  const clearRecordingStorage = useCallback(() => {
    try {
      sessionStorage.removeItem(recordingStorageKey(roomId));
    } catch {
      // ignore
    }
  }, [roomId]);

  const persistRecordingId = useCallback(
    (id) => {
      try {
        if (id) sessionStorage.setItem(recordingStorageKey(roomId), id);
        else clearRecordingStorage();
      } catch {
        // ignore
      }
    },
    [roomId, clearRecordingStorage]
  );

  const stopRecordingIfActive = useCallback(
    async ({ silent = false, keepalive = false, force = false } = {}) => {
      const id = useMeetingStore.getState().recordingId;
      if (!id || stoppingRef.current) return;
      if (!force && !isLastInRoom(room)) return;
      stoppingRef.current = true;
      try {
        await recordingApi.stopRecording(id, { keepalive });
        if (!silent && !keepalive) {
          toast.success("Recording stopped");
        }
      } catch (e) {
        if (!silent && !keepalive) {
          toast.error(e?.message || "Could not stop recording");
        }
      } finally {
        setRecording({ isRecording: false, recordingId: null, recordingStartedAt: null });
        clearRecordingStorage();
        stoppingRef.current = false;
      }
    },
    [room, setRecording, clearRecordingStorage]
  );

  const startRecording = useCallback(async () => {
    if (!isHost) return;
    try {
      const res = await recordingApi.startRecording(roomId, {
        hostUserId: session?.user?.id || "",
        hostName: session?.user?.name || "",
      });
      setRecording({
        isRecording: true,
        recordingId: res.recordingId,
        recordingStartedAt: Date.now(),
      });
      persistRecordingId(res.recordingId);
    } catch (e) {
      const msg = e?.message || "Could not start recording.";
      toast.error(msg.length > 120 ? `${msg.slice(0, 120)}…` : msg);
    }
  }, [roomId, isHost, setRecording, session?.user?.id, session?.user?.name, persistRecordingId]);

  const stopRecording = useCallback(async () => {
    await stopRecordingIfActive({ silent: false, force: true });
  }, [stopRecordingIfActive]);

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  useEffect(() => {
    if (!isHost) return;
    return () => {
      const { isRecording: active, recordingId: id } = useMeetingStore.getState();
      if (active && id && isLastInRoom(room)) {
        recordingApi.stopRecording(id, { keepalive: true });
        clearRecordingStorage();
      }
    };
  }, [isHost, room, roomId, clearRecordingStorage]);

  return {
    isRecording,
    toggleRecording,
    stopRecordingIfActive,
  };
}
