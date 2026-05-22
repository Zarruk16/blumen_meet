"use client";

import { useMeetingStore, LAYOUTS } from "@/store/meetingStore";
import { VideoGrid } from "./VideoGrid";
import { SpeakerLayout } from "./SpeakerLayout";
import { ReactionBubbles } from "./ReactionBubbles";

export function MeetingVideoStage({ reactionBubbles }) {
  const layout = useMeetingStore((s) => s.layout);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07070b]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(56,189,248,0.08), transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139,92,246,0.06), transparent)",
        }}
      />
      <div className="relative h-full w-full">
        {layout === LAYOUTS.GRID ? <VideoGrid /> : <SpeakerLayout />}
      </div>
      <ReactionBubbles bubbles={reactionBubbles} />
    </div>
  );
}
