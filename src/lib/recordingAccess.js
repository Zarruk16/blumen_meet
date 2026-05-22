import Meeting from "@/models/Meeting";

export async function getHostRoomIds(hostUserId, hostName) {
  const or = [];
  if (hostUserId) or.push({ hostUserId });
  if (hostName) or.push({ hostName });
  if (!or.length) return [];

  const meetings = await Meeting.find({ $or: or }).select("roomId").lean();
  return meetings.map((m) => m.roomId).filter(Boolean);
}

export function buildHostRecordingsFilter(hostUserId, hostName, hostRoomIds = []) {
  const or = [];
  if (hostUserId) or.push({ hostUserId });
  if (hostName) or.push({ hostName });
  if (hostRoomIds.length) {
    or.push({ roomName: { $in: hostRoomIds } });
  }
  if (!or.length) return { hostUserId: "__deny__" };
  return { $or: or };
}

export async function hostCanAccessRecording(recording, { hostUserId, hostName }) {
  if (!recording) return false;
  if (hostUserId && recording.hostUserId && recording.hostUserId === hostUserId) {
    return true;
  }
  if (hostName && recording.hostName && recording.hostName === hostName) {
    return true;
  }
  const roomIds = await getHostRoomIds(hostUserId, hostName);
  return roomIds.includes(recording.roomName);
}
