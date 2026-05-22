"use client";

import { Calendar, CalendarClock, Repeat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { meetingDialogClass, meetingFieldClass, meetingLabelClass } from "./meetingFormStyles";

const DAYS = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
];

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  scheduledAt,
  onScheduledAtChange,
  recurrence,
  onRecurrenceChange,
  weeklyDay,
  onWeeklyDayChange,
  weeklyTime,
  onWeeklyTimeChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={meetingDialogClass}>
        <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-blue-500/5 px-6 py-5">
          <DialogHeader className="text-left space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 border border-violet-500/30 mb-1">
              <CalendarClock className="h-5 w-5 text-violet-300" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white tracking-tight">
              Schedule meeting
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400 leading-relaxed">
              Pick when participants can join. They can enter early on the pre-join screen once
              the host starts the room.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label className={`${meetingLabelClass} flex items-center gap-2`}>
              <Calendar className="h-4 w-4 text-zinc-500" />
              Date & time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => onScheduledAtChange(e.target.value)}
              disabled={recurrence === "weekly"}
              className={`${meetingFieldClass} mt-2 [color-scheme:dark]`}
            />
            {recurrence === "weekly" && (
              <p className="mt-1.5 text-xs text-zinc-500">Uses weekly day and time below</p>
            )}
          </div>

          <div>
            <label className={`${meetingLabelClass} flex items-center gap-2`}>
              <Repeat className="h-4 w-4 text-zinc-500" />
              Repeat
            </label>
            <select
              className={`${meetingFieldClass} mt-2`}
              value={recurrence}
              onChange={(e) => onRecurrenceChange(e.target.value)}
            >
              <option value="none" className="bg-zinc-900">
                Does not repeat
              </option>
              <option value="daily" className="bg-zinc-900">
                Daily
              </option>
              <option value="weekly" className="bg-zinc-900">
                Weekly
              </option>
            </select>
          </div>

          {recurrence === "weekly" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <label className={meetingLabelClass}>Day</label>
                <select
                  className={`${meetingFieldClass} mt-2`}
                  value={weeklyDay}
                  onChange={(e) => onWeeklyDayChange(e.target.value)}
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value} className="bg-zinc-900">
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={meetingLabelClass}>Time</label>
                <input
                  type="time"
                  value={weeklyTime}
                  onChange={(e) => onWeeklyTimeChange(e.target.value)}
                  className={`${meetingFieldClass} mt-2 [color-scheme:dark]`}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:scale-[1.01] active:scale-[0.99]"
          >
            Create scheduled link
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
