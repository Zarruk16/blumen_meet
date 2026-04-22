"use client"
import { useSession } from 'next-auth/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Link2, Smile } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const VideoMeeting = () => {
  const params= useParams();
  const roomID = params.roomId;
  const {data:session,status} = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef(null) // ref for video container element
  const [zp,setZp]  = useState(null)
  const [isInMeeting,setIsInMeeting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const joinedRef = useRef(false);
  const [isHost, setIsHost] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [showReactions, setShowReactions] = useState(false);
  const [reactionBubbles, setReactionBubbles] = useState([]);
  const reactionTimeoutsRef = useRef([]);
  const participantIdsRef = useRef([]);
  const joinToastShownRef = useRef(false);
  const presenceIdRef = useRef("");

  const ready = searchParams?.get("ready") === "1";
  const nameFromQuery = searchParams?.get("name") || "";
  const hostKeyFromQuery = (searchParams?.get("hostKey") || "").trim();
  const cameraOn = searchParams?.get("cam") !== "0";
  const micOn = searchParams?.get("mic") !== "0";

  useEffect(() =>{
    if (typeof window !== "undefined") {
      setInviteUrl(`${window.location.origin}/join/${roomID}`);
    }

    const nameFromStorage =
      typeof window !== "undefined"
        ? (sessionStorage.getItem(`guestName:${roomID}`) || localStorage.getItem(`guestName:${roomID}`) || "")
        : "";
    const resolvedGuestName = (nameFromQuery || nameFromStorage).trim();
    if (resolvedGuestName) setGuestName(resolvedGuestName);

    const displayName =
      (status === "authenticated" ? session?.user?.name : resolvedGuestName) || "";

    if (!containerRef.current) return;

    // Always route through our custom pre-join screen first (for better UX on mobile).
    if (!ready && status !== "loading") {
      router.replace(`/join/${roomID}`);
      return;
    }

    if (!displayName) {
      if (status !== "loading") router.replace(`/join/${roomID}`);
      return;
    }

    if (!joinedRef.current) {
      joinedRef.current = true;
      joinMeeting(containerRef.current, displayName, { cameraOn, micOn, hostKeyFromQuery });
      return;
    }
  },[status, session?.user?.name, roomID, ready, nameFromQuery, cameraOn, micOn, hostKeyFromQuery])



  useEffect(() =>{
    return () =>{
      reactionTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      reactionTimeoutsRef.current = [];
      joinToastShownRef.current = false;
      if(zp){
        zp.destroy()
      }
    }
  },[zp])



  const joinMeeting = async (element, displayName, opts) => {
    const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');
    // If a previous instance exists (Fast Refresh / route transitions), destroy it first.
    if (zp) {
      try {
        zp.destroy();
      } catch {}
      setZp(null);
    }
    // generate Kit Token
     const appID = Number(process.env.NEXT_PUBLIC_ZEGOAPP_ID);
     const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
     if(!appID || !serverSecret){
      throw new Error('please provide appId and secret key')
     }

     const userId =
      (status === "authenticated" && session?.user?.id) ? String(session.user.id) : `guest-${Date.now()}`;

     // Determine host synchronously (no state race).
     let isHost = false;
     if (typeof window !== "undefined") {
       const incoming = (opts?.hostKeyFromQuery || "").trim();
       if (incoming) {
         try {
           localStorage.setItem(`hostKey:${roomID}`, incoming);
         } catch {}
       }
       const stored = (localStorage.getItem(`hostKey:${roomID}`) || "").trim();
       isHost = Boolean(stored) && (!incoming || incoming === stored);
     }
     setIsHost(isHost);
     const participantName = isHost ? `HOST • ${displayName}` : displayName;

     const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userId,
      participantName || 'Guest'
     );

   
    // Create instance object from Kit Token.
     const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);
     setZp(zegoInstance)

     // start the call
     zegoInstance.joinRoom({
       container: element,
       // We use our own pre-join screen (name + device preview/settings).
       showPreJoinView: false,
       turnOnCameraWhenJoining: Boolean(opts?.cameraOn),
       turnOnMicrophoneWhenJoining: Boolean(opts?.micOn),
       ...(isHost
        ? {
            // Only the host (creator) can share the invite link from inside the room.
            sharedLinks: [
              {
                name: 'Join via this link',
                url:`${window.location.origin}/join/${roomID}`
              },
            ],
          }
        : {}),
       scenario: {
         mode: ZegoUIKitPrebuilt.GroupCall,
         config: {
          role: isHost ? ZegoUIKitPrebuilt.Host : ZegoUIKitPrebuilt.Audience,
         },
       },
       showAudioVideoSettingsButton:true,
       showReactionButton:true,
       showScreenSharingButton:true,
       showTurnOffRemoteCameraButton:true,
       showTurnOffRemoteMicrophoneButton:true,
       showRemoveUserButton:true,
      onUserJoin:(users) => {
        participantIdsRef.current = [
          ...new Set([...participantIdsRef.current, ...users.map((u) => u.userID).filter(Boolean)]),
        ];
        const joinedNames = users
          .map((u) => u.userName || u.userID)
          .filter(Boolean)
          .join(", ");
        if (joinedNames) {
          toast.info(`${joinedNames} joined the meeting`);
        }
      },
      onUserLeave:(users) => {
        const leaving = new Set(users.map((u) => u.userID));
        participantIdsRef.current = participantIdsRef.current.filter((id) => !leaving.has(id));
        const leftNames = users
          .map((u) => u.userName || u.userID)
          .filter(Boolean)
          .join(", ");
        if (leftNames) {
          toast.info(`${leftNames} left the meeting`);
        }
      },
      onInRoomCommandReceived:(_fromUser, command) =>{
        let payload = null;
        try {
          payload = JSON.parse(command);
        } catch {
          payload = null;
        }
        const emoji = payload?.type === "reaction" ? payload?.emoji : null;
        if (!emoji) return;
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setReactionBubbles((prev) => [...prev, { id, emoji }]);
        const timeoutId = setTimeout(() => {
          setReactionBubbles((prev) => prev.filter((item) => item.id !== id));
        }, 1800);
        reactionTimeoutsRef.current.push(timeoutId);
       },
       onJoinRoom:() =>{
        if (!joinToastShownRef.current) {
          toast.success('Meeting joined succesfully')
          joinToastShownRef.current = true;
        }
        setIsInMeeting(true);
        reportPresence("join");
       },
       onLeaveRoom:() =>{
        reportPresence("leave");
        endMeeting();
       },
     });
 };

 const endMeeting =() =>{
  if(zp){
    zp.destroy();
  }
  toast.success('Meeting end succesfully')
  setZp(null);
  setIsInMeeting(false)
  joinedRef.current = false;
  joinToastShownRef.current = false;
  router.push('/')
 }

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

 const reportPresence = async (action) => {
  const participantId = getPresenceId();
  try {
    await fetch(`/api/meetings/${roomID}/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, participantId }),
      keepalive: action === "leave",
    });
  } catch {}
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
  return () => {
    window.removeEventListener("beforeunload", onBeforeUnload);
  };
 }, [roomID]);

 const sendReaction = async (emoji) => {
  if (!zp || !isInMeeting) return;
  try {
    const recipients = participantIdsRef.current;
    if (recipients.length > 0) {
      await zp.sendInRoomCommand(JSON.stringify({ type: "reaction", emoji }), recipients);
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setReactionBubbles((prev) => [...prev, { id, emoji }]);
    const timeoutId = setTimeout(() => {
      setReactionBubbles((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
    reactionTimeoutsRef.current.push(timeoutId);
  } catch {
    toast.error("Couldn't send reaction");
  } finally {
    setShowReactions(false);
  }
 }

 const copyInviteLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteUrl);
    toast.success("Meeting link copied");
  } catch {
    toast.error("Couldn't copy meeting link");
  }
 }

  return (
    <div className="relative h-[100dvh] bg-black overflow-hidden">
      <div ref={containerRef} className="video-container w-full h-full" />
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {reactionBubbles.map((item, index) => (
          <span
            key={item.id}
            className="absolute text-3xl animate-bounce"
            style={{
              left: `${18 + ((index * 17) % 62)}%`,
              bottom: `${16 + ((index % 4) * 10)}%`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>
      {isHost && (
        <div className="absolute top-3 right-3 z-20">
          <Button
            onClick={copyInviteLink}
            size="sm"
            className="h-9 px-3 bg-black/70 hover:bg-black/80 text-white border border-white/20 backdrop-blur"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Share link
          </Button>
        </div>
      )}
      {isInMeeting && (
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-end gap-2">
          {showReactions && (
            <div className="rounded-xl border border-white/20 bg-black/70 backdrop-blur px-2 py-2 flex gap-1">
              {["👍", "👏", "😂", "❤️", "🎉", "🔥"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="h-9 w-9 rounded-lg hover:bg-white/10 text-xl"
                  onClick={() => sendReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-black/70 hover:bg-black/80 border border-white/20 text-white backdrop-blur"
            onClick={() => setShowReactions((prev) => !prev)}
            title="Reactions"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default VideoMeeting