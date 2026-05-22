# ZEGOCLOUD → LiveKit Migration

This project migrated real-time video from **@zegocloud/zego-uikit-prebuilt** to **LiveKit** (`livekit-client`, `@livekit/components-react`).

> **Note:** This app uses **Next.js**, not Vite. Public env vars use `NEXT_PUBLIC_*` (equivalent to `VITE_*` in the requirements).

## Removed

| Package / config | Location |
|----------------|----------|
| `@zegocloud/zego-uikit-prebuilt` | `package.json` |
| `NEXT_PUBLIC_ZEGOAPP_ID` | `.env` |
| `NEXT_PUBLIC_ZEGO_SERVER_SECRET` | `.env` |
| `ZegoUIKitPrebuilt` join logic | `src/app/video-meeting/[roomId]/page.jsx` |

## Added

| Path | Purpose |
|------|---------|
| `src/services/livekit.js` | Token fetch + endpoint config |
| `src/lib/livekitToken.js` | JWT generation (Next.js API) |
| `src/app/api/livekit/get-token/route.js` | `POST` token endpoint (in-app) |
| `server/index.js` | Express `POST /get-token` example |
| `src/hooks/useLiveKitToken.js` | Token loading + retry |
| `src/hooks/useLiveKitReactions.js` | Emoji reactions via data channel |
| `src/hooks/useMeetingTimer.js` | Elapsed meeting timer |
| `src/app/components/livekit/LiveKitMeetingRoom.jsx` | `LiveKitRoom` + `VideoConference` |
| `src/app/components/livekit/MeetingOverlays.jsx` | Host share link + reactions UI |

## Install

```bash
# Main app (already run during migration)
npm install livekit-client @livekit/components-react @livekit/components-styles livekit-server-sdk
npm uninstall @zegocloud/zego-uikit-prebuilt

# Optional standalone token server
cd server && npm install
```

## Environment

Copy `.env.example` → `.env.local` and set:

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://your-project.livekit.cloud
```

**Option A — Next.js only (recommended for dev):** leave `NEXT_PUBLIC_BACKEND_URL` unset. Tokens are issued at `POST /api/livekit/get-token`.

**Option B — Express server:**

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

```bash
cp server/.env.example server/.env
# fill LIVEKIT_* in server/.env
cd server && npm run dev
```

## Connection flow

1. User completes pre-join at `/join/[roomId]`
2. Redirect to `/video-meeting/[roomId]?ready=1&name=...&cam=...&mic=...`
3. App authorizes host via existing `/api/meetings/[roomId]/authorize`
4. Frontend requests token (`roomName`, `userName`, `identity`, `isHost`)
5. `LiveKitRoom` connects with `serverUrl` + `token`
6. `VideoConference` provides camera, mic, screen share, participants, chat UI
7. Custom overlays: host **Share link**, **Reactions**, **Meeting timer**

## Features preserved

- Pre-join screen (`/join/[roomId]`) — unchanged
- Meeting creation / scheduling — unchanged
- Host key / authorize API — unchanged
- Presence reporting — unchanged
- Share link + reactions overlays — preserved styling

## Optional next steps

- **Waiting room:** gate `LiveKitRoom` `connect` until host admits (API flag)
- **Recording:** add `roomRecord` grant + Egress on server
- **Role-only publish:** set `canPublish: isHost` in token grants for webinar mode

## LiveKit Cloud setup

1. Create a project at [https://cloud.livekit.io](https://cloud.livekit.io)
2. Copy API Key, API Secret, and WebSocket URL into `.env.local`
3. Run `npm run dev` and join a meeting
