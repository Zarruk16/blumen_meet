"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Circle, Download, Film, Loader2 } from "lucide-react";
import Header from "@/app/components/Header";
import * as recordingApi from "@/services/recordingApi";

function formatDuration(sec) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recordingApi
      .listMyRecordings()
      .then(setRecordings)
      .catch(() => setRecordings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Film className="h-7 w-7" />
            Recordings
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
            Saved recordings appear here when S3/R2 is configured. Without storage, view jobs in{" "}
            <a
              href="https://cloud.livekit.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 hover:underline"
            >
              LiveKit Cloud → Egresses
            </a>
            .
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : recordings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 p-12 text-center">
            <Film className="mx-auto h-12 w-12 text-zinc-400" />
            <p className="mt-4 text-gray-600 dark:text-zinc-400">No recordings yet</p>
            <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
              Hosts can start recording from the meeting control bar
            </p>
            <Link
              href="/"
              className="inline-block mt-6 text-sm font-medium text-sky-600 hover:underline"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {recordings.map((r) => (
              <li
                key={r.recordingId}
                className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{r.roomName}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                    {new Date(r.createdAt).toLocaleString()} · {formatDuration(r.duration)}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs capitalize text-zinc-500">
                    <Circle
                      className={`h-2 w-2 fill-current ${
                        r.status === "active" ? "text-red-500 animate-pulse" : "text-zinc-500"
                      }`}
                    />
                    {r.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/meetings/${r.roomName}/summary`}
                    className="rounded-lg border border-gray-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    Summary
                  </Link>
                  {r.downloadUrl ? (
                    <a
                      href={r.downloadUrl}
                      className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-500"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  ) : r.filePath ? (
                    <span className="text-xs text-zinc-500 px-3 py-2">Processing…</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
