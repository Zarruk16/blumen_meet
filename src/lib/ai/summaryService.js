import { transcribeMeetingAudio } from "./transcriptionService";

const SUMMARY_SCHEMA = `Return valid JSON only:
{
  "title": "string",
  "summary": "string",
  "keyPoints": ["string"],
  "actionItems": ["string"],
  "decisions": ["string"],
  "speakerHighlights": [{ "speaker": "string", "contribution": "string" }],
  "timestamps": [{ "time": "00:00", "label": "string", "note": "string" }]
}`;

const NO_RECORDING_HINT =
  "Record the meeting (host → Record), stop recording, wait about a minute for the file in R2, then regenerate summary.";

export async function generateMeetingSummary({
  roomId,
  transcript,
  recordingUrl,
  recordingFilePath,
}) {
  let fullTranscript = transcript?.trim() || "";
  let summaryNote;

  if (!fullTranscript) {
    try {
      const fromAudio = await transcribeMeetingAudio({
        roomId,
        recordingUrl,
        recordingFilePath,
      });
      if (fromAudio) {
        fullTranscript = fromAudio;
      } else {
        fullTranscript = `Meeting in room ${roomId}. No recording file found yet.`;
        summaryNote = NO_RECORDING_HINT;
      }
    } catch (err) {
      fullTranscript = `Meeting in room ${roomId}.`;
      summaryNote = err.message || NO_RECORDING_HINT;
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return { ...buildFallbackSummary(roomId, fullTranscript), summaryNote };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SUMMARY_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a meeting assistant. Analyze the transcript and produce structured meeting notes. ${SUMMARY_SCHEMA}`,
          },
          {
            role: "user",
            content: `Room: ${roomId}\n\nTranscript:\n${fullTranscript.slice(0, 12000)}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      console.warn("[summary] OpenAI HTTP", res.status);
      return {
        ...buildFallbackSummary(roomId, fullTranscript),
        summaryNote:
          summaryNote ||
          (res.status === 429
            ? "OpenAI rate limit or billing — showing basic notes. Add credits at platform.openai.com."
            : `OpenAI returned ${res.status} — showing basic notes.`),
      };
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    if (summaryNote) parsed.summaryNote = summaryNote;
    return parsed;
  } catch (error) {
    console.warn("[summary] OpenAI error", error.message);
    return {
      ...buildFallbackSummary(roomId, fullTranscript),
      summaryNote: summaryNote || "AI unavailable — showing basic notes.",
    };
  }
}

function buildFallbackSummary(roomId, transcript) {
  const lines = transcript.split("\n").filter(Boolean);
  return {
    title: `Meeting ${roomId.slice(0, 8)}`,
    summary:
      lines.slice(0, 3).join(" ") ||
      "No transcript yet. Speak in the meeting or paste notes, then regenerate.",
    keyPoints: lines.slice(0, 5).map((l) => l.slice(0, 120)),
    actionItems: ["Review meeting and add action items"],
    decisions: [],
    speakerHighlights: [],
    timestamps: [{ time: "00:00", label: "Start", note: "Meeting began" }],
  };
}
