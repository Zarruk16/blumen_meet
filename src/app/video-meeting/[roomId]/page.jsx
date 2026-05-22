"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import LiveKitMeetingRoom from "@/app/components/livekit/LiveKitMeetingRoom";
import { useLiveKitToken } from "@/hooks/useLiveKitToken";
import Loader from "@/app/components/Loader";

const VideoMeeting = () => {
  const params = useParams();
  const roomID = params.roomId;
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const joinedRef = useRef(false);
  const [isHost, setIsHost] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [participantIdentity, setParticipantIdentity] = useState("");
  const [hostResolved, setHostResolved] = useState(false);
  const presenceIdRef = useRef("");

  const ready = searchParams?.get("ready") === "1";
  const nameFromQuery = searchParams?.get("name") || "";
  const cameraOn = searchParams?.get("cam") !== "0";
  const micOn = searchParams?.get("mic") !== "0";

  const displayName =
    (status === "authenticated" ? session?.user?.name : guestName) || nameFromQuery || "";

  const participantName = isHost ? `HOST • ${displayName}` : displayName;

  const {
    token,
    serverUrl,
    error: tokenError,
    isLoading: tokenLoading,
    retry: retryToken,
  } = useLiveKitToken({
    roomName: roomID,
    userName: participantName || "Guest",
    identity: participantIdentity,
    isHost,
    enabled: Boolean(ready && displayName && hostResolved && participantIdentity),
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteUrl(`${window.location.origin}/join/${roomID}`);
    }

    const nameFromStorage =
      typeof window !== "undefined"
        ? sessionStorage.getItem(`guestName:${roomID}`) ||
          localStorage.getItem(`guestName:${roomID}`) ||
          ""
        : "";
    const resolvedGuestName = (nameFromQuery || nameFromStorage).trim();
    if (resolvedGuestName) setGuestName(resolvedGuestName);
  }, [roomID, nameFromQuery]);

  useEffect(() => {
    if (!ready && status !== "loading") {
      router.replace(`/join/${roomID}`);
      return;
    }

    if (!displayName) {
      if (status !== "loading") router.replace(`/join/${roomID}`);
      return;
    }

    const userId =
      status === "authenticated" && session?.user?.id
        ? String(session.user.id)
        : `guest-${Date.now()}`;
    setParticipantIdentity(userId);

    if (!joinedRef.current) {
      joinedRef.current = true;
      (async () => {
        let localHostKey = "";
        if (typeof window !== "undefined") {
          localHostKey = (localStorage.getItem(`hostKey:${roomID}`) || "").trim();
        }
        try {
          const auth = await fetch(`/api/meetings/${roomID}/authorize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              hostKey: localHostKey,
              hostUserId: session?.user?.id || "",
            }),
          });
          if (auth.ok) {
            const payload = await auth.json();
            setIsHost(Boolean(payload?.isHost));
          }
        } catch {
          setIsHost(false);
        } finally {
          setHostResolved(true);
        }
      })();
    }
  }, [status, session?.user?.id, session?.user?.name, roomID, ready, displayName]);

  const getPresenceId = () => {
    if (presenceIdRef.current) return presenceIdRef.current;
    let existing = "";
    try {
      existing = sessionStorage.getItem(`presence:${roomID}`) || "";
      if (!existing) {
        existing = uuidv4();
        sessionStorage.setItem(`presence:${roomID}`, existing);
      }
    } catch {
      existing = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
    presenceIdRef.current = existing;
    return existing;
  };

  const hostUserId =
    status === "authenticated" && session?.user?.id
      ? String(session.user.id)
      : participantIdentity;

  const reportPresence = async (action) => {
    const participantId = getPresenceId();
    try {
      await fetch(`/api/meetings/${roomID}/presence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          participantId,
          userId: participantIdentity,
          name: displayName,
        }),
        keepalive: action === "leave",
      });
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    const onBeforeUnload = () => {
      const participantId = getPresenceId();
      navigator.sendBeacon(
        `/api/meetings/${roomID}/presence`,
        new Blob([JSON.stringify({ action: "leave", participantId })], {
          type: "application/json",
        })
      );
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [roomID]);

  const endMeeting = () => {
    reportPresence("leave");
    setIsInMeeting(false);
    joinedRef.current = false;
    router.push("/");
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      toast.error("Couldn't copy meeting link");
    }
  };

  const showLoader = ready && displayName && (tokenLoading || (!token && !tokenError));

  return (
    <div className="relative h-[100dvh] bg-black overflow-hidden">
      {showLoader && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
          <Loader />
          <p className="absolute bottom-1/3 text-sm text-white/80">Connecting to meeting...</p>
        </div>
      )}

      {tokenError && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black px-6 text-center">
          <p className="text-white text-sm max-w-md">{tokenError}</p>
          <button
            type="button"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
            onClick={retryToken}
          >
            Retry connection
          </button>
          <button
            type="button"
            className="text-sm text-white/70 underline"
            onClick={() => router.push(`/join/${roomID}`)}
          >
            Back to pre-join
          </button>
        </div>
      )}

      {token && serverUrl && !tokenError && (
        <LiveKitMeetingRoom
          token={token}
          serverUrl={serverUrl}
          roomId={roomID}
          cameraOn={cameraOn}
          micOn={micOn}
          isHost={isHost}
          participantIdentity={participantIdentity}
          hostUserId={hostUserId}
          inviteUrl={inviteUrl}
          onConnected={() => {
            setIsInMeeting(true);
            reportPresence("join");
          }}
          onLeaveRoom={endMeeting}
          onCopyInvite={copyInviteLink}
          onHostChange={(nowHost) => setIsHost(nowHost)}
          onReportPresence={reportPresence}
        />
      )}
    </div>
  );
};

export default VideoMeeting;
