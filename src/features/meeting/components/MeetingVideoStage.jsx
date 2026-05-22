"use client";

import { useMeetingStore, LAYOUTS } from "@/store/meetingStore";
import { useSpotlightActive } from "../hooks/useStageDominant";
import { VideoGrid } from "./VideoGrid";
import { SpeakerLayout } from "./SpeakerLayout";
import { ReactionBubbles } from "./ReactionBubbles";

export function MeetingVideoStage({ reactionBubbles }) {
  const layout = useMeetingStore((s) => s.layout);
  const spotlightActive = useSpotlightActive();
  const usePresenterView = layout === LAYOUTS.SPEAKER || spotlightActive;

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
        {usePresenterView ? <SpeakerLayout /> : <VideoGrid />}
      </div>
      <ReactionBubbles bubbles={reactionBubbles} />
    </div>
  );
}
