"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Play, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function ScheduledMeetings({ hostUserId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const baseUrl = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), []);

  const load = async () => {
    if (!hostUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings?hostUserId=${encodeURIComponent(hostUserId)}`);
      const data = await res.json();
      setItems(Array.isArray(data?.meetings) ? data.meetings : []);
    } catch {
      toast.error("Couldn't load scheduled meetings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostUserId]);

  const copyLink = async (meeting) => {
    const url = `${baseUrl}/join/${meeting.roomId}?hostKey=${meeting.hostKey}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Meeting link copied");
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
      toast.success("Meeting cancelled");
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
      toast.success("Meeting started");
      router.push(`/join/${meeting.roomId}?hostKey=${encodeURIComponent(meeting.hostKey)}`);
    } catch {
      toast.error("Couldn't start meeting");
    }
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Scheduled meetings</h2>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">No upcoming scheduled meetings.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((m) => (
            <div
              key={m.roomId}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {m.roomId}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {m.startAt ? new Date(m.startAt).toLocaleString() : "—"} · {m.recurrence || "none"} · {m.status}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => startMeeting(m)}>
                  <Play className="h-4 w-4 mr-2" /> Start
                </Button>
                <Button variant="secondary" onClick={() => copyLink(m)}>
                  <Copy className="h-4 w-4 mr-2" /> Copy link
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => cancel(m)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

