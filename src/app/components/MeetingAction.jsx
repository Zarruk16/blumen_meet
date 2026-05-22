"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { CalendarPlus, Copy, LinkIcon, Plus, Video, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { redirectToLogin } from "@/lib/authRedirect";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import Loader from "./Loader";
import { ScheduleMeetingDialog } from "@/components/meeting/ScheduleMeetingDialog";
import { ShareMeetingLinkDialog } from "@/components/meeting/ShareMeetingLinkDialog";
import { meetingFieldClass } from "@/components/meeting/meetingFormStyles";

const MeetingAction = () => {
  const [isLoading, setIsLoading] = useState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const router = useRouter();
  const [generatedMeetingUrl, setGeneratedMeetingUrl] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [weeklyDay, setWeeklyDay] = useState("1");
  const [weeklyTime, setWeeklyTime] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const createMeetingRecord = async ({ roomId, hostKey, kind, startAt, recurrence }) => {
    const hostUserId = session?.user?.id || "";
    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        hostKey,
        kind,
        startAt,
        recurrence,
        hostUserId,
        hostName: session?.user?.name || "",
      }),
    });
    if (!response.ok) throw new Error("create_meeting_failed");
  };

  const ensureAuth = () => {
    if (!session?.user) {
      redirectToLogin(router, "/#workspace");
      return false;
    }
    return true;
  };

  const handleCreateMeetingForLater = async () => {
    if (!ensureAuth()) return;
    if (recurrence !== "weekly" && !scheduledAt) {
      toast.error("Please choose meeting date and time");
      return;
    }
    if (recurrence === "weekly" && (!weeklyDay || !weeklyTime)) {
      toast.error("Please choose weekly day and time");
      return;
    }

    const toNextWeekdayDateTimeISO = (dayIndex, timeValue) => {
      const now = new Date();
      const [h, m] = timeValue.split(":").map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      const currentDay = now.getDay();
      let delta = Number(dayIndex) - currentDay;
      if (delta < 0 || (delta === 0 && target <= now)) delta += 7;
      target.setDate(now.getDate() + delta);
      return target.toISOString();
    };

    const effectiveStartAt =
      recurrence === "weekly"
        ? toNextWeekdayDateTimeISO(weeklyDay, weeklyTime)
        : new Date(scheduledAt).toISOString();

    const roomId = uuidv4();
    const hostKey = uuidv4();
    try {
      localStorage.setItem(`hostKey:${roomId}`, hostKey);
      await createMeetingRecord({
        roomId,
        hostKey,
        kind: "scheduled",
        startAt: effectiveStartAt,
        recurrence,
      });
    } catch {
      toast.error("Could not schedule meeting");
      return;
    }
    const url = `${baseUrl}/join/${roomId}`;
    setGeneratedMeetingUrl(url);
    setIsDialogOpen(true);
    setIsScheduleDialogOpen(false);
  };

  const handleJoinMeeting = () => {
    if (meetingLink) {
      setIsLoading(true);
      const raw = meetingLink.trim();
      const formattedLink = raw.includes("http") ? raw : `${baseUrl}/join/${raw}`;
      const url = new URL(formattedLink, baseUrl);
      router.push(`${url.pathname}${url.search}`);
      toast.info("Joining meeting…");
    } else {
      toast.error("Please enter a valid link or code");
    }
  };

  const handleStartMeeting = async () => {
    if (!ensureAuth()) return;
    setIsLoading(true);
    const roomId = uuidv4();
    const hostKey = uuidv4();
    try {
      localStorage.setItem(`hostKey:${roomId}`, hostKey);
      await createMeetingRecord({
        roomId,
        hostKey,
        kind: "instant",
      });
    } catch {
      setIsLoading(false);
      toast.error("Could not start meeting");
      return;
    }
    const meetingUrl = `${baseUrl}/join/${roomId}`;
    router.push(meetingUrl);
    toast.info("Joining meeting…");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMeetingUrl);
    toast.success("Link copied");
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:scale-[1.01] active:scale-[0.99]"
            >
              <Video className="h-5 w-5" />
              New meeting
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/10 bg-zinc-950/95 backdrop-blur-xl text-white">
            <DropdownMenuItem
              className="focus:bg-white/10 focus:text-white cursor-pointer"
              onClick={() => setIsScheduleDialogOpen(true)}
            >
              <CalendarPlus className="mr-2 h-4 w-4 text-violet-400" />
              Schedule for later
            </DropdownMenuItem>
            <DropdownMenuItem
              className="focus:bg-white/10 focus:text-white cursor-pointer"
              onClick={handleStartMeeting}
            >
              <Zap className="mr-2 h-4 w-4 text-amber-400" />
              Start instant meeting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative flex w-full sm:flex-1 sm:max-w-md">
          <div className="flex w-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/40">
            <div className="relative flex-1 min-w-0">
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                placeholder="Enter code or link"
                className={`${meetingFieldClass} border-0 rounded-none rounded-l-2xl pl-10 focus:ring-0`}
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
              />
            </div>
            <button
              type="button"
              onClick={handleJoinMeeting}
              className="shrink-0 rounded-r-2xl border-l border-white/10 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      <ScheduleMeetingDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        scheduledAt={scheduledAt}
        onScheduledAtChange={setScheduledAt}
        recurrence={recurrence}
        onRecurrenceChange={setRecurrence}
        weeklyDay={weeklyDay}
        onWeeklyDayChange={setWeeklyDay}
        weeklyTime={weeklyTime}
        onWeeklyTimeChange={setWeeklyTime}
        onSubmit={handleCreateMeetingForLater}
      />

      <ShareMeetingLinkDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        meetingUrl={generatedMeetingUrl}
        onCopy={copyToClipboard}
      />
    </>
  );
};

export default MeetingAction;
