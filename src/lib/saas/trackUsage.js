import dbConnect from "@/lib/dbConnect";
import ApiUsage from "@/models/ApiUsage";
import Reseller from "@/models/Reseller";

export async function logApiUsage({
  resellerId,
  userId,
  endpoint,
  method = "POST",
  statusCode = 200,
  minutesConsumed = 0,
  bandwidth = 0,
  roomName = "",
  metadata = {},
}) {
  if (!resellerId) return;
  await dbConnect();
  await ApiUsage.create({
    resellerId,
    userId,
    endpoint,
    method,
    statusCode,
    minutesConsumed,
    bandwidth,
    roomName,
    metadata,
  });
  await Reseller.findByIdAndUpdate(resellerId, {
    $inc: {
      ...(minutesConsumed ? { minutesUsed: minutesConsumed } : {}),
    },
    lastApiRequestAt: new Date(),
  });
}

export async function trackRoomCreated(resellerId) {
  if (!resellerId) return;
  await dbConnect();
  await Reseller.findByIdAndUpdate(resellerId, {
    $inc: { roomsCreated: 1 },
  });
}

export async function trackMeetingDuration(resellerId, durationMinutes) {
  if (!resellerId || !durationMinutes) return;
  await dbConnect();
  await Reseller.findByIdAndUpdate(resellerId, {
    $inc: { minutesUsed: Math.ceil(durationMinutes) },
  });
  await logApiUsage({
    resellerId,
    endpoint: "/meeting/duration",
    minutesConsumed: Math.ceil(durationMinutes),
  });
}

export async function trackRecording(resellerId) {
  if (!resellerId) return;
  await dbConnect();
  await Reseller.findByIdAndUpdate(resellerId, {
    $inc: { recordingsCount: 1 },
  });
}

export async function trackAiSummary(resellerId) {
  if (!resellerId) return;
  await dbConnect();
  await Reseller.findByIdAndUpdate(resellerId, {
    $inc: { aiSummariesCount: 1 },
  });
}
