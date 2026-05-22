"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Film, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as recordingApi from "@/services/recordingApi";

function formatDuration(sec) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function statusLabel(status) {
  if (status === "active") return "Recording…";
  if (status === "processing") return "Processing";
  if (status === "completed" || status === "stopped") return "Ready";
  if (status === "failed") return "Failed";
  return status || "—";
}

export default function HostRecordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    recordingApi
      .listMyRecordings()
      .then(setRecordings)
      .catch(() => setRecordings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Film className="h-5 w-5 text-sky-500" />
          Your recordings
        </h2>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Meetings you recorded as host. Download the video or open AI summary.
      </p>

      {loading ? (
        <div className="mt-6 flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : recordings.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          No recordings yet. Start a meeting, tap <strong>Record</strong> in the control bar, then stop when
          finished.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {recordings.map((r) => (
            <li
              key={r.recordingId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {r.roomName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(r.endedAt || r.createdAt).toLocaleString()} · {formatDuration(r.duration)} ·{" "}
                  {statusLabel(r.status)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link
                  href={`/meetings/${r.roomName}/summary`}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Summary
                </Link>
                {r.downloadUrl ? (
                  <a
                    href={r.downloadUrl}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-500"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-3 py-2 text-xs text-gray-500">
                    File processing…
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
