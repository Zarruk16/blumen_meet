"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLiveKitToken } from "@/services/livekit";

/**
 * Fetches and caches a LiveKit token for the given room/participant.
 */
export function useLiveKitToken({ roomName, userName, identity, isHost, enabled = true }) {
  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [participantIdentity, setParticipantIdentity] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(null);

  const loadToken = useCallback(async () => {
    if (!enabled || !roomName || !userName) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchLiveKitToken({
        roomName,
        userName,
        identity,
        isHost,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      setToken(result.token);
      setServerUrl(result.serverUrl);
      setParticipantIdentity(result.identity);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err?.message || "Failed to load meeting token");
      setToken(null);
      setServerUrl(null);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [roomName, userName, identity, isHost, enabled]);

  useEffect(() => {
    loadToken();
    return () => abortRef.current?.abort();
  }, [loadToken]);

  return {
    token,
    serverUrl,
    identity: participantIdentity,
    error,
    isLoading,
    retry: loadToken,
  };
}
