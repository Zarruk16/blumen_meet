"use client";

import { Link2, Shield, Clock } from "lucide-react";

export function MeetingInfoPanel({ roomId, inviteUrl, isHost }) {
  return (
    <div className="p-4 space-y-4 text-sm text-zinc-300">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Meeting code</p>
        <p className="font-mono text-white break-all">{roomId}</p>
      </div>
      {inviteUrl && (
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1 flex items-center gap-1">
            <Link2 className="h-3 w-3" /> Invite link
          </p>
          <p className="text-xs break-all text-sky-300/90">{inviteUrl}</p>
        </div>
      )}
      <div className="flex items-start gap-2 rounded-lg bg-white/5 p-3 border border-white/10">
        <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs">
          End-to-end encrypted media · ZarrukCode. {isHost ? "You are the meeting host." : "You are a participant."}
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Clock className="h-3.5 w-3.5" />
        <span>Shortcuts: M mic, V camera, C chat, P participants, F fullscreen</span>
      </div>
    </div>
  );
}
