"use client";

import { useEffect, useState } from "react";
import { Sparkles, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import * as summaryApi from "@/services/summaryApi";

export function SummaryPanel({ roomId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    summaryApi
      .getSummary(roomId)
      .then((data) => {
        if (!cancelled) setSummary(data || null);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const onGenerate = async () => {
    setGenerating(true);
    try {
      const data = await summaryApi.generateSummary(roomId, {});
      setSummary(data);
    } catch (e) {
      toast.error(e.message || "Could not generate summary");
    } finally {
      setGenerating(false);
    }
  };

  const exportMarkdown = () => {
    if (!summary) return;
    const md = `# ${summary.title || "Meeting Summary"}

## Summary
${summary.summary || ""}

## Key points
${(summary.keyPoints || []).map((p) => `- ${p}`).join("\n")}

## Action items
${(summary.actionItems || []).map((p) => `- ${p}`).join("\n")}

## Decisions
${(summary.decisions || []).map((p) => `- ${p}`).join("\n")}
`;
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `meeting-${roomId}-summary.md`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
        <Sparkles className="h-10 w-10 text-violet-400" />
        <p className="text-sm text-zinc-400">Generate AI-powered meeting notes, action items, and highlights.</p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {generating ? "Generating…" : "Generate summary"}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-4 space-y-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-white">{summary.title || "Meeting summary"}</h3>
        <button
          type="button"
          onClick={exportMarkdown}
          className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>
      {summary.summaryNote && (
        <p className="text-xs text-amber-400/90 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
          {summary.summaryNote}
        </p>
      )}
      <p className="text-zinc-300 leading-relaxed">{summary.summary}</p>
      {summary.keyPoints?.length > 0 && (
        <section>
          <h4 className="text-xs font-medium uppercase text-zinc-500 mb-2">Key points</h4>
          <ul className="list-disc pl-4 space-y-1 text-zinc-300">
            {summary.keyPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      )}
      {summary.actionItems?.length > 0 && (
        <section>
          <h4 className="text-xs font-medium uppercase text-zinc-500 mb-2">Action items</h4>
          <ul className="list-disc pl-4 space-y-1 text-zinc-300">
            {summary.actionItems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      )}
      <button
        type="button"
        onClick={onGenerate}
        disabled={generating}
        className="w-full rounded-lg border border-white/10 py-2 text-xs text-zinc-400 hover:bg-white/5"
      >
        {generating ? "Regenerating…" : "Regenerate summary"}
      </button>
    </div>
  );
}
