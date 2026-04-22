"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function JoinMeeting() {
  const params = useParams();
  const roomID = params.roomId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [devices, setDevices] = useState({ cameras: [], mics: [] });
  const [selected, setSelected] = useState({ cameraId: "", micId: "" });
  const [permissionError, setPermissionError] = useState("");
  const [meetingMeta, setMeetingMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const meetingUrl = useMemo(() => `/video-meeting/${roomID}`, [roomID]);

  useEffect(() => {
    // Pre-fill name for logged-in users, otherwise try local storage (guest).
    const fromSession = status === "authenticated" ? (session?.user?.name || "") : "";
    const fromStorage =
      typeof window !== "undefined"
        ? (sessionStorage.getItem(`guestName:${roomID}`) || localStorage.getItem(`guestName:${roomID}`) || "")
        : "";
    const resolved = (fromSession || fromStorage).trim();
    if (resolved) setName(resolved);
  }, [roomID, session, status]);

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        const res = await fetch(`/api/meetings/${roomID}`);
        if (res.ok) {
          const data = await res.json();
          setMeetingMeta(data);
        }
      } finally {
        setMetaLoading(false);
      }
    };
    loadMeeting();
  }, [roomID]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const refreshDevices = async () => {
    if (!navigator?.mediaDevices?.enumerateDevices) return;
    const list = await navigator.mediaDevices.enumerateDevices();
    const cams = list.filter((d) => d.kind === "videoinput");
    const mics = list.filter((d) => d.kind === "audioinput");
    setDevices({ cameras: cams, mics });
    setSelected((prev) => ({
      cameraId: prev.cameraId || cams[0]?.deviceId || "",
      micId: prev.micId || mics[0]?.deviceId || "",
    }));
  };

  const startPreview = async (nextSelected) => {
    setPermissionError("");
    try {
      stopStream();
      const constraints = {
        video: cameraEnabled
          ? {
              deviceId: (nextSelected?.cameraId || selected.cameraId) ? { exact: (nextSelected?.cameraId || selected.cameraId) } : undefined,
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            }
          : false,
        audio: micEnabled
          ? {
              deviceId: (nextSelected?.micId || selected.micId) ? { exact: (nextSelected?.micId || selected.micId) } : undefined,
            }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      await refreshDevices();
    } catch (e) {
      setPermissionError("Camera/microphone permission is blocked. Please allow access and try again.");
    }
  };

  useEffect(() => {
    // Try to start preview on load (it will prompt for permission).
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) return;
    startPreview();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // When toggling camera/mic, restart preview so the stream matches.
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) return;
    startPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraEnabled, micEnabled]);

  const onJoin = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter your name");
      return;
    }
    setIsJoining(true);
    try {
      sessionStorage.setItem(`guestName:${roomID}`, trimmed);
      localStorage.setItem(`guestName:${roomID}`, trimmed);
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    const hostKey = (searchParams?.get("hostKey") || "").trim();
    if (hostKey) {
      try {
        localStorage.setItem(`hostKey:${roomID}`, hostKey);
      } catch {}
    }
    try {
      const auth = await fetch(`/api/meetings/${roomID}/authorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostKey }),
      });
      const payload = await auth.json();
      if (!auth.ok || !payload.allowed) {
        if (payload?.reason === "ended") {
          toast.error("This meeting link has expired.");
        } else if (payload?.reason === "scheduled_not_started_time") {
          const startText = payload?.startAt ? new Date(payload.startAt).toLocaleString() : "scheduled time";
          toast.info(`Meeting starts at ${startText}.`);
        } else if (payload?.reason === "waiting_for_host") {
          toast.info("Waiting for host to start the meeting.");
        } else {
          toast.error("Unable to join this meeting.");
        }
        setIsJoining(false);
        return;
      }
      router.push(
        `${meetingUrl}?ready=1&name=${encodeURIComponent(trimmed)}&cam=${cameraEnabled ? "1" : "0"}&mic=${micEnabled ? "1" : "0"}${
          hostKey ? `&hostKey=${encodeURIComponent(hostKey)}` : ""
        }`
      );
    } catch {
      setIsJoining(false);
      toast.error("Unable to join this meeting.");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black relative aspect-[3/4] md:aspect-auto md:min-h-[420px]">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {!cameraEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm">
                Camera is off
              </div>
            )}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
              <div className="rounded-full bg-black/50 px-3 py-1 text-xs text-white truncate">
                {name.trim() || "Preview"}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMicEnabled((v) => !v)}
                  className={`rounded-full px-3 py-2 text-xs font-medium border ${
                    micEnabled
                      ? "bg-white/90 text-gray-900 border-white/40"
                      : "bg-red-500 text-white border-red-400"
                  }`}
                >
                  {micEnabled ? "Mic on" : "Mic off"}
                </button>
                <button
                  type="button"
                  onClick={() => setCameraEnabled((v) => !v)}
                  className={`rounded-full px-3 py-2 text-xs font-medium border ${
                    cameraEnabled
                      ? "bg-white/90 text-gray-900 border-white/40"
                      : "bg-red-500 text-white border-red-400"
                  }`}
                >
                  {cameraEnabled ? "Cam on" : "Cam off"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Ready to join?
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Confirm your name and choose your camera/microphone.
            </p>
            {metaLoading ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Loading meeting details...</p>
            ) : meetingMeta?.kind === "scheduled" && meetingMeta?.startAt ? (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Scheduled for: {new Date(meetingMeta.startAt).toLocaleString()}
              </p>
            ) : null}

            {permissionError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                {permissionError}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Your name
                </label>
                <div className="mt-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onJoin();
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Camera
                  </label>
                  <select
                    className="mt-2 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    value={selected.cameraId}
                    onChange={(e) => {
                      const next = { ...selected, cameraId: e.target.value };
                      setSelected(next);
                      startPreview(next);
                    }}
                    disabled={!devices.cameras.length}
                  >
                    {devices.cameras.length ? (
                      devices.cameras.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || "Camera"}
                        </option>
                      ))
                    ) : (
                      <option value="">Default camera</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Microphone
                  </label>
                  <select
                    className="mt-2 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    value={selected.micId}
                    onChange={(e) => {
                      const next = { ...selected, micId: e.target.value };
                      setSelected(next);
                      startPreview(next);
                    }}
                    disabled={!devices.mics.length}
                  >
                    {devices.mics.length ? (
                      devices.mics.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                          {d.label || "Microphone"}
                        </option>
                      ))
                    ) : (
                      <option value="">Default microphone</option>
                    )}
                  </select>
                </div>
              </div>

              <Button className="w-full" onClick={onJoin} disabled={isJoining}>
                {isJoining ? "Joining..." : "Join meeting"}
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                Code: {roomID}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

