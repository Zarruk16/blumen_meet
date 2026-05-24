"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Video as VideoIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { LandingBackground } from "@/components/layout/LandingBackground";
import Loader from "@/app/components/Loader";
import OpenInAppBanner from "@/components/join/OpenInAppBanner";

function JoinMeetingContent() {
  const params = useParams();
  const roomID = params.roomId;
  const router = useRouter();
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
  const roomLabel = roomID?.slice(0, 8) || "meeting";

  useEffect(() => {
    const fromSession = status === "authenticated" ? session?.user?.name || "" : "";
    const fromStorage =
      typeof window !== "undefined"
        ? sessionStorage.getItem(`guestName:${roomID}`) ||
          localStorage.getItem(`guestName:${roomID}`) ||
          ""
        : "";
    const resolved = (fromSession || fromStorage).trim();
    if (resolved) setName(resolved);
  }, [roomID, session, status]);

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        const res = await fetch(`/api/meetings/${roomID}`);
        if (res.ok) {
          const meta = await res.json();
          setMeetingMeta(meta);
          if (meta.cancelled || (meta.status === "ended" && meta.kind !== "scheduled")) {
            toast.error("This meeting link has expired.");
          }
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
    const list = await navigator.mediaDevices.enumerDevices();
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
              deviceId: (nextSelected?.cameraId || selected.cameraId)
                ? { exact: nextSelected?.cameraId || selected.cameraId }
                : undefined,
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            }
          : false,
        audio: micEnabled
          ? {
              deviceId: (nextSelected?.micId || selected.micId)
                ? { exact: nextSelected?.micId || selected.micId }
                : undefined,
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
    } catch {
      setPermissionError(
        "Camera/microphone permission is blocked. Please allow access and try again."
      );
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) return;
    startPreview();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
      // ignore
    }
    const hostKey =
      typeof window !== "undefined"
        ? (localStorage.getItem(`hostKey:${roomID}`) || "").trim()
        : "";
    try {
      const auth = await fetch(`/api/meetings/${roomID}/authorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostKey, hostUserId: session?.user?.id || "" }),
      });
      const payload = await auth.json();
      if (!auth.ok || !payload.allowed) {
        if (payload?.reason === "ended") {
          toast.error("This meeting link has expired.");
        } else if (payload?.reason === "scheduled_not_started_time") {
          const startText = payload?.startAt
            ? new Date(payload.startAt).toLocaleString()
            : "scheduled time";
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
        `${meetingUrl}?ready=1&name=${encodeURIComponent(trimmed)}&cam=${cameraEnabled ? "1" : "0"}&mic=${micEnabled ? "1" : "0"}`
      );
    } catch {
      setIsJoining(false);
      toast.error("Unable to join this meeting.");
    }
  };

  const initials = (name.trim() || "?").charAt(0).toUpperCase();

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-zinc-950 text-white">
      <LandingBackground />

      <header className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-6 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <VideoIcon className="h-7 w-7 text-blue-500" />
          <span className="font-semibold tracking-tight">Blumen Meet</span>
        </Link>
        <div className="w-16" aria-hidden />
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <OpenInAppBanner roomId={roomID} />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center sm:text-left"
        >
          <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
            Pre-join lobby
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to join?
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Check your camera and mic, then enter the meeting.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-2xl aspect-[4/5] sm:aspect-video lg:aspect-auto lg:min-h-[420px]"
          >
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {!cameraEnabled && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/90">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-700 text-3xl font-semibold ring-2 ring-white/10">
                  {initials}
                </div>
                <p className="text-sm text-zinc-400">Camera is off</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-12">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                  {name.trim() || "Your preview"}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMicEnabled((v) => !v)}
                    aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                      micEnabled
                        ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                        : "border-red-500/50 bg-red-600/90 text-white"
                    }`}
                  >
                    {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraEnabled((v) => !v)}
                    aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                      cameraEnabled
                        ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                        : "border-red-500/50 bg-red-600/90 text-white"
                    }`}
                  >
                    {cameraEnabled ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <VideoOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Meeting
              </p>
              <p className="mt-1 font-mono text-sm text-white">{roomLabel}…</p>
              {metaLoading ? (
                <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading details…
                </p>
              ) : meetingMeta?.kind === "scheduled" && meetingMeta?.startAt ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                  <Calendar className="h-3.5 w-3.5 text-violet-400" />
                  {new Date(meetingMeta.startAt).toLocaleString()}
                </p>
              ) : (
                <p className="mt-2 text-xs text-emerald-400/90">Instant meeting</p>
              )}
            </div>

            {permissionError && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {permissionError}
              </div>
            )}

            <label className="text-sm font-medium text-zinc-300">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should we call you?"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && onJoin()}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-zinc-300">Camera</label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50"
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
                      <option key={d.deviceId} value={d.deviceId} className="bg-zinc-900">
                        {d.label || "Camera"}
                      </option>
                    ))
                  ) : (
                    <option value="">Default camera</option>
                  )}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300">Microphone</label>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50"
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
                      <option key={d.deviceId} value={d.deviceId} className="bg-zinc-900">
                        {d.label || "Microphone"}
                      </option>
                    ))
                  ) : (
                    <option value="">Default microphone</option>
                  )}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={onJoin}
              disabled={isJoining}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining…
                </>
              ) : (
                "Join meeting"
              )}
            </button>

            <p className="mt-4 text-center text-[11px] text-zinc-600 break-all">
              Room code: <span className="font-mono text-zinc-500">{roomID}</span>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function JoinMeeting() {
  return (
    <Suspense fallback={<Loader />}>
      <JoinMeetingContent />
    </Suspense>
  );
}
