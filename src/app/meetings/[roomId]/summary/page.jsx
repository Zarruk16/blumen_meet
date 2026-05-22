"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/app/components/Header";
import { SummaryPanel } from "@/features/ai-summary/SummaryPanel";

export default function MeetingSummaryPage() {
  const params = useParams();
  const roomId = params.roomId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/recordings"
          className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Recordings
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Meeting insights
        </h1>
        <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-h-[400px]">
          <SummaryPanel roomId={roomId} />
        </div>
      </main>
    </div>
  );
}
