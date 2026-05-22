/**
 * Host resolution for meetings.
 * - ownerUserId: permanent owner (regains host on rejoin)
 * - currentHostUserId: acting host while in session
 */
export function getOwnerUserId(meeting) {
  return (meeting?.ownerUserId || meeting?.hostUserId || "").trim();
}

export function getCurrentHostUserId(meeting) {
  const owner = getOwnerUserId(meeting);
  return (meeting?.currentHostUserId || meeting?.hostUserId || owner || "").trim();
}

export function resolveHostAccess(meeting, { hostKey = "", hostUserId = "" } = {}) {
  const key = (hostKey || "").trim();
  const uid = (hostUserId || "").trim();
  const ownerId = getOwnerUserId(meeting);
  const currentHostId = getCurrentHostUserId(meeting);

  const keyMatch = Boolean(key) && key === meeting.hostKey;
  const ownerMatch = Boolean(uid) && Boolean(ownerId) && uid === ownerId;
  const actingMatch = Boolean(uid) && Boolean(currentHostId) && uid === currentHostId;

  return {
    isHost: keyMatch || ownerMatch || actingMatch,
    ownerId,
    currentHostId,
    keyMatch,
    ownerMatch,
  };
}

export function isMeetingLinkExpired(meeting) {
  if (!meeting) return true;
  if (meeting.cancelled) return true;
  if (meeting.status === "ended" && meeting.kind !== "scheduled") return true;
  if (meeting.status === "ended" && meeting.recurrence === "none") return true;
  return false;
}

export function pickNextHostUserId(activeParticipants, leavingUserId) {
  const others = (activeParticipants || []).filter(
    (p) => p.userId && p.userId !== leavingUserId
  );
  if (!others.length) return "";

  const preferAuth = others.find((p) => p.userId && !p.userId.startsWith("guest-"));
  return (preferAuth || others[0]).userId;
}
