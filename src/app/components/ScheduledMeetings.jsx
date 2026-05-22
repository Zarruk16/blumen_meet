"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Copy, Loader2, Play, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function StatusBadge({ status }) {
  const styles = {
    scheduled: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    ended: "bg-zinc-500/15 text-zinc-400 border-white/10",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
        styles[status] || styles.scheduled
      )}
    >
      {status || "scheduled"}
    </span>
  );
}

export default function ScheduledMeetings({ hostUserId, hostName }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const baseUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    []
  );

  const load = async () => {
    if (!hostUserId && !hostName) return;
    setLoading(true);
    try {
      if (hostUserId && hostName) {
        await fetch("/api/meetings/migrate-host", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostUserId, hostName }),
        });
      }

      const params = new URLSearchParams();
      if (hostUserId) params.set("hostUserId", hostUserId);
      if (hostName) params.set("hostName", hostName);
      const res = await fetch(`/api/meetings?${params.toString()}`);
      const data = await res.json();
      const meetings = Array.isArray(data?.meetings) ? data.meetings : [];
      meetings.sort((a, b) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
      setItems(meetings);
    } catch {
      toast.error("Couldn't load scheduled meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostUserId, hostName]);

  const copyLink = async (meeting) => {
    const url = `${baseUrl}/join/${meeting.roomId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const cancel = async (meeting) => {
    try {
      const res = await fetch(`/api/meetings/${meeting.roomId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostKey: meeting.hostKey }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((m) => m.roomId !== meeting.roomId));
    } catch {
      toast.error("Couldn't cancel meeting");
    }
  };

  const startMeeting = async (meeting) => {
    try {
      const res = await fetch(`/api/meetings/${meeting.roomId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostKey: meeting.hostKey }),
      });
      if (!res.ok) throw new Error();
      router.push(`/join/${meeting.roomId}`);
    } catch {
      toast.error("Couldn't start meeting");
    }
  };

  const formatStart = (startAt) => {
    if (!startAt) return "No start time";
    try {
      return new Date(startAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  };

  return (
    <section className="mt-0 min-w-0 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <h2 className="text-lg sm:text-xl font-semibold text-white shrink-0">
          Scheduled meetings
        </h2>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No scheduled meetings yet.</p>
      ) : (
        <ul className="mt-4 space-y-3 min-w-0">
          {items.map((m) => (
            <li
              key={m.roomId}
              className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between min-w-0">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <p className="font-mono text-sm font-medium text-white truncate max-w-full">
                      {m.roomId?.slice(0, 8)}…
                    </p>
                    <StatusBadge status={m.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1 min-w-0">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-violet-400" />
                      <span className="break-words">{formatStart(m.startAt)}</span>
                    </span>
                    {m.recurrence && m.recurrence !== "none" && (
                      <>
                        <span className="text-zinc-600" aria-hidden>
                          ·
                        </span>
                        <span className="capitalize">{m.recurrence}</span>
                      </>
                    )}
                  </div>

                  <p
                    className="hidden sm:block font-mono text-[10px] text-zinc-600 truncate"
                    title={m.roomId}
                  >
                    {m.roomId}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto lg:max-w-[320px]">
                  <button
                    type="button"
                    onClick={() => startMeeting(m)}
                    className="inline-flex w-full sm:flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    <Play className="h-4 w-4 shrink-0" />
                    Start
                  </button>
                  <button
                    type="button"
                    onClick={() => copyLink(m)}
                    className="inline-flex w-full sm:flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-zinc-200 transition hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4 shrink-0" />
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => cancel(m)}
                    className="inline-flex w-full sm:flex-1 sm:min-w-[5.5rem] items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    Cancel
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
