"use client";

import { Button } from "@/components/ui/button";
import { Link2, Smile } from "lucide-react";

export function ReactionOverlay({
  reactionBubbles,
  showReactions,
  setShowReactions,
  reactionEmojis,
  onSendReaction,
  visible,
}) {
  if (!visible) return null;

  return (
    <>
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
      <div className="absolute right-3 bottom-24 z-30 flex flex-col items-end gap-2">
        {showReactions && (
          <div className="rounded-xl border border-white/20 bg-black/70 backdrop-blur px-2 py-2 flex gap-1">
            {reactionEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="h-9 w-9 rounded-lg hover:bg-white/10 text-xl"
                onClick={() => onSendReaction(emoji)}
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
    </>
  );
}

export function HostShareOverlay({ isHost, onCopyInvite, inviteUrl }) {
  if (!isHost) return null;

  return (
    <div className="absolute top-3 right-3 z-30">
      <Button
        onClick={onCopyInvite}
        size="sm"
        className="h-9 px-3 bg-black/70 hover:bg-black/80 text-white border border-white/20 backdrop-blur"
      >
        <Link2 className="w-4 h-4 mr-2" />
        Share link
      </Button>
      <span className="sr-only">{inviteUrl}</span>
    </div>
  );
}

export function MeetingTimerOverlay({ elapsed }) {
  if (!elapsed) return null;

  return (
    <div className="absolute top-3 left-3 z-30 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white border border-white/20 backdrop-blur">
      {elapsed}
    </div>
  );
}
