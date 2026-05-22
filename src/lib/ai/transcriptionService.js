import { fetchRecordingBytes } from "@/lib/recordingStorage";

/**
 * Transcription — Whisper when OPENAI_API_KEY + recording file/path available.
 */
export async function transcribeMeetingAudio({
  roomId,
  recordingUrl,
  recordingFilePath,
  transcriptHint,
}) {
  if (transcriptHint?.trim()) {
    return transcriptHint.trim();
  }

  if (!process.env.OPENAI_API_KEY && !process.env.DEEPGRAM_API_KEY) {
    return `[Transcript placeholder for room ${roomId}]\n\nAdd OPENAI_API_KEY in .env.local for AI notes.`;
  }

  if (process.env.OPENAI_API_KEY && recordingFilePath) {
    try {
      const bytes = await fetchRecordingBytes(recordingFilePath);
      return transcribeWithWhisperBuffer(bytes, "meeting.mp4");
    } catch (err) {
      console.warn("[transcription] R2 fetch failed", err.message);
      throw new Error(
        "Could not read recording from storage. Wait ~1 minute after stopping record, then try again."
      );
    }
  }

  if (process.env.OPENAI_API_KEY && recordingUrl) {
    return transcribeWithWhisperUrl(recordingUrl);
  }

  return null;
}

async function transcribeWithWhisperUrl(audioUrl) {
  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) {
    throw new Error(`Could not download recording (${audioRes.status}).`);
  }
  const bytes = new Uint8Array(await audioRes.arrayBuffer());
  return transcribeWithWhisperBuffer(bytes, "meeting.mp4");
}

async function transcribeWithWhisperBuffer(bytes, filename) {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "video/mp4" }), filename);
  form.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Whisper failed (${res.status})${detail ? `: ${detail.slice(0, 120)}` : ""}`);
  }

  const data = await res.json();
  return data.text?.trim() || "";
}
